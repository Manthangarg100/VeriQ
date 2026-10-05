const fs = require('fs');
const path = require('path');

const MODEL_FILE = path.join(__dirname, 'data', 'risk-model.json');
let cached = null;

function loadModel(){
  if(cached) return cached;
  try{
    cached = JSON.parse(fs.readFileSync(MODEL_FILE,'utf8'));
    return cached;
  }catch(err){
    return null;
  }
}

function sigmoid(z){
  if(z >= 0){ const e=Math.exp(-z); return 1/(1+e); }
  const e=Math.exp(z); return e/(1+e);
}

function normalizeFeature(value, spec){
  const min=Number(spec?.min ?? 0), max=Number(spec?.max ?? 1);
  if(max===min) return 0;
  return Math.max(-3,Math.min(3,(Number(value||0)-min)/(max-min)));
}

function predict(features){
  const model=loadModel();
  if(!model) return {available:false, probability:null, score:null, modelVersion:null, factors:[]};
  let z=Number(model.intercept||0);
  const factors=[];
  for(const name of model.features||[]){
    const raw=Number(features[name]||0);
    const n=normalizeFeature(raw,model.scaling?.[name]);
    const c=Number(model.coefficients?.[name]||0);
    const contribution=n*c;
    z+=contribution;
    factors.push({feature:name,raw,contribution});
  }
  const probability=sigmoid(z);
  const score=Math.round(probability*100);
  factors.sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution));
  return {available:true,probability:Number(probability.toFixed(4)),score,modelVersion:model.version||'v1',factors};
}

function modelInfo(){
  const model=loadModel();
  if(!model) return {available:false};
  return {available:true,version:model.version,algorithm:model.algorithm,trainedAt:model.trainedAt,trainingRows:model.trainingRows,features:model.features,limitations:model.limitations};
}

module.exports={predict,modelInfo};
