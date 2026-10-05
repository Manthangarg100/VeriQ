const {spawn}=require('child_process');
const fs=require('fs');
const path=require('path');
const assert=(c,m)=>{if(!c)throw new Error(m)};
(async()=>{
 const db=path.join(__dirname,'data','static-test.json');try{fs.unlinkSync(db)}catch{}
 const p=spawn(process.execPath,['server.js'],{cwd:__dirname,env:{...process.env,PORT:'4191',HOST:'127.0.0.1',VERIQ_DB_FILE:db,DATABASE_URL:''},stdio:['ignore','pipe','pipe']});
 try{
  for(let i=0;i<30;i++){try{const r=await fetch('http://127.0.0.1:4191/api/health');if(r.ok)break}catch{} await new Promise(r=>setTimeout(r,100));}
  const checks=[['/','text/html','Veriq'],['/index.html','text/html','app.js'],['/app.js','text/javascript','function render'],['/styles.css','text/css','.btn']];
  for(const [url,contentType,needle] of checks){const r=await fetch(`http://127.0.0.1:4191${url}`);assert(r.ok,`${url} not served`);const ct=r.headers.get('content-type')||'';assert(ct.includes(contentType),`${url} content type ${ct}`);const t=await r.text();assert(t.includes(needle),`${url} missing ${needle}`);}
  const publicVerify=await fetch('http://127.0.0.1:4191/api/public/verify/CERT-2026-3421');assert([200,404].includes(publicVerify.status),'public verify route failed');
  console.log('STATIC/FRONTEND SERVING PASS');
 }catch(e){console.error('STATIC TEST FAILED',e.stack||e);process.exitCode=1;}finally{p.kill('SIGTERM');try{fs.unlinkSync(db)}catch{}}
})();
