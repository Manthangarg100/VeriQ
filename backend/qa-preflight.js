const http = require('http');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DB = path.join(__dirname, 'data', 'qa-preflight.json');
const PORT = 4197;
const HOST = '127.0.0.1';
const BASE = `http://${HOST}:${PORT}`;

function req(method, pathname, body, headers={}) {
  return new Promise((resolve,reject)=>{
    const r=http.request(`${BASE}${pathname}`,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...headers},timeout:5000},res=>{
      let raw=''; res.setEncoding('utf8'); res.on('data',c=>raw+=c); res.on('end',()=>{let json=null;try{json=JSON.parse(raw)}catch{} resolve({status:res.statusCode,headers:res.headers,body:raw,json});});
    });
    r.on('timeout',()=>r.destroy(new Error('timeout'))); r.on('error',reject); if(body)r.write(JSON.stringify(body)); r.end();
  });
}
function check(name,ok,detail=''){ console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`); return ok; }
async function main(){
  try{fs.unlinkSync(DB)}catch{}
  const env={...process.env,PORT:String(PORT),HOST,DATABASE_URL:'',VERIQ_DB_FILE:DB};
  const child=spawn(process.execPath,['server.js'],{cwd:__dirname,env,stdio:['ignore','pipe','pipe']});
  let output=''; child.stdout.on('data',d=>output+=d); child.stderr.on('data',d=>output+=d);
  try{
    let ready=false; for(let i=0;i<50&&!ready;i++){await new Promise(r=>setTimeout(r,100));try{const r=await req('GET','/api/health');ready=r.status===200}catch{}}
    if(!check('server startup',ready)) throw new Error(output);

    let ok=true;
    let r=await req('GET','/api/health'); ok &= check('health version',r.status===200 && r.json?.version==='4.0.0',JSON.stringify(r.json||{}));
    r=await req('POST','/api/risk/recompute',{}); ok &= check('unauthenticated protected POST returns 401',r.status===401 && r.json?.error==='Authentication required',`HTTP ${r.status}`);
    r=await req('POST','/api/certificates/CERT-2026-3421/revoke',{}); ok &= check('another protected POST returns 401',r.status===401,`HTTP ${r.status}`);
    r=await req('GET','/api/risk/model'); ok &= check('risk model endpoint requires authentication',r.status===401,`HTTP ${r.status}`);

    const files=[
      ['frontend index','/'],['service worker','/sw.js'],['manifest','/manifest.webmanifest'],['frontend app','/app.js'],['frontend styles','/styles.css']
    ];
    for(const [name,url] of files){r=await req('GET',url);ok &= check(name,r.status===200);}

    const index=fs.readFileSync(path.join(ROOT,'frontend','index.html'),'utf8');
    const app=fs.readFileSync(path.join(ROOT,'frontend','app.js'),'utf8');
    const sw=fs.readFileSync(path.join(ROOT,'frontend','sw.js'),'utf8');
    const manifest=fs.readFileSync(path.join(ROOT,'frontend','manifest.webmanifest'),'utf8');
    ok &= check('viewport meta present',/name=["']viewport["']/i.test(index));
    ok &= check('service worker registration present',/serviceWorker\.register\(["']\/sw\.js/.test(index));
    ok &= check('GPS capture implementation present',/navigator\.geolocation\.getCurrentPosition/.test(app));
    ok &= check('camera QR implementation present',/getUserMedia\(/.test(app) && /BarcodeDetector/.test(app));
    ok &= check('QR manual fallback present',/Enter the certificate ID from the QR/.test(app));
    ok &= check('offline encrypted draft implementation present',/AES-GCM|crypto\.subtle/.test(app));
    ok &= check('service worker caches app shell',/caches\.open\(CACHE\).*addAll\(APP_SHELL\)/s.test(sw));
    ok &= check('PWA manifest is valid JSON',(()=>{try{JSON.parse(manifest);return true}catch{return false}})());
    ok &= check('integration adapters are explicitly demo/sandbox',/ADAPTER_READY|SIMULATED|DEMO/.test(fs.readFileSync(path.join(__dirname,'server.js'),'utf8')));
    if(!ok)process.exitCode=1;
  } finally {child.kill(); try{fs.unlinkSync(DB)}catch{} }
}
main().catch(e=>{console.error('QA ERROR',e);process.exit(1)});
