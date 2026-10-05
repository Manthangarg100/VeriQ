"""Train the Veriq prototype predictive risk model.

No third-party ML package is required. This is a small logistic-regression
trainer intended for the hackathon prototype. It learns from lifecycle rows
extracted from backend/data/veriq.json and bootstrap variations so the
local demo dataset can produce a stable model artifact.
"""
from __future__ import annotations
import json, math, os, random
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DB=Path(os.getenv('VERIQ_DB_FILE', ROOT/'backend'/'data'/'veriq.json'))
OUT=ROOT/'backend'/'data'/'risk-model.json'
FEATURES=['failures','complaints','repairs','violations','days_to_expiry','scans','open_fraud','age_years','location_anomalies']
RANGES={
 'failures':(0,5),'complaints':(0,5),'repairs':(0,4),'violations':(0,5),
 'days_to_expiry':(-180,365),'scans':(0,30),'open_fraud':(0,4),'age_years':(0,15),'location_anomalies':(0,3)
}

def sigmoid(z):
    if z>=0:
        e=math.exp(-z); return 1/(1+e)
    e=math.exp(z); return e/(1+e)

def scale(v,k):
    lo,hi=RANGES[k]
    return max(-3,min(3,(v-lo)/(hi-lo)))

def row_for(ins,data):
    iid=ins['id']
    inspections=[x for x in data.get('inspections',[]) if x.get('instrumentId')==iid]
    complaints=[x for x in data.get('complaints',[]) if x.get('instrumentId')==iid and x.get('status')!='Resolved']
    repairs=[x for x in data.get('repairs',[]) if x.get('instrumentId')==iid]
    fraud=[x for x in data.get('fraudSignals',[]) if x.get('instrumentId')==iid and not x.get('resolved')]
    failures=sum(str(x.get('result','')).upper()=='FAIL' for x in inspections)
    days=999
    due=ins.get('nextDue')
    if due:
        try:
            days=(datetime.fromisoformat(due.replace('Z','+00:00'))-datetime.now(timezone.utc)).days
        except Exception: pass
    history=ins.get('history') or {}
    loc=sum(str(x.get('type','')).upper() in {'LOCATION_MISMATCH','RELOCATION_MISMATCH'} for x in fraud)
    return {
      'failures':failures,'complaints':len(complaints),'repairs':len(repairs),'violations':int(history.get('violations',0) or 0),
      'days_to_expiry':days,'scans':sum(x.get('instrumentId')==iid for x in data.get('scanEvents',[])),
      'open_fraud':len(fraud),'age_years':float(history.get('ageYears',0) or 0),'location_anomalies':loc
    }

def make_label(x):
    return int(x['failures']>0 or x['open_fraud']>0 or x['complaints']>=2 or x['violations']>0)

def build_dataset(data):
    base=[]
    for ins in data.get('instruments',[]):
        x=row_for(ins,data); base.append((x,make_label(x)))
    # Bootstrap variations around the actual local lifecycle rows. This is
    # deliberately documented as prototype augmentation, not field accuracy.
    random.seed(26036)
    rows=[]
    for x,y in base:
        for _ in range(180):
            z={k:max(0,v) if k not in ('days_to_expiry','age_years') else v for k,v in x.items()}
            for k in FEATURES:
                if k=='days_to_expiry': z[k]=max(-180,min(365,z[k]+random.gauss(0,45)))
                else: z[k]=max(0,z[k]+random.gauss(0,max(0.2,(z[k] or 1)*0.35)))
            # generate balanced prototype labels from lifecycle risk pattern
            risk=(2*z['failures']+1.5*z['complaints']+1.2*z['repairs']+1.7*z['violations']+2*z['open_fraud']+1.8*z['location_anomalies']+0.7*z['scans']+0.3*z['age_years']+(12 if z['days_to_expiry']<0 else 5 if z['days_to_expiry']<30 else 0))
            p=1/(1+math.exp(-((risk-7)/4)))
            label=1 if random.random()<p else 0
            rows.append((z,label))
    return rows

def train(rows,epochs=2200,lr=0.035):
    w={k:0.0 for k in FEATURES}; b=0.0
    for _ in range(epochs):
        gw={k:0.0 for k in FEATURES}; gb=0.0
        for x,y in rows:
            z=b+sum(w[k]*scale(x[k],k) for k in FEATURES)
            p=sigmoid(z); d=p-y; gb+=d
            for k in FEATURES: gw[k]+=d*scale(x[k],k)
        n=len(rows)
        b-=lr*gb/n
        for k in FEATURES: w[k]-=lr*gw[k]/n
    return b,w

def bootstrap_data():
    # Allow `npm run train:risk` to work immediately after a clean ZIP extract.
    # When the real lifecycle JSON exists it is always preferred.
    instruments=[
      {'id':'TRAIN-001','nextDue':'2027-01-15','history':{'violations':0,'ageYears':1}},
      {'id':'TRAIN-002','nextDue':'2026-10-20','history':{'violations':1,'ageYears':5}},
      {'id':'TRAIN-003','nextDue':'2026-08-01','history':{'violations':2,'ageYears':8}},
      {'id':'TRAIN-004','nextDue':'2027-06-30','history':{'violations':0,'ageYears':2}},
      {'id':'TRAIN-005','nextDue':'2026-07-15','history':{'violations':3,'ageYears':12}},
    ]
    return {'instruments':instruments,'inspections':[],'complaints':[],'repairs':[],'fraudSignals':[],'scanEvents':[]}

def main():
    source='local lifecycle dataset'
    if DB.exists():
        try:
            data=json.loads(DB.read_text(encoding='utf-8'))
        except Exception:
            data=bootstrap_data(); source='clean-extract bootstrap dataset'
    else:
        data=bootstrap_data(); source='clean-extract bootstrap dataset'
    rows=build_dataset(data)
    b,w=train(rows)
    model={
      'version':'MT-RISK-LOGREG-1.0','algorithm':'Explainable logistic regression','trainedAt':datetime.now(timezone.utc).isoformat(),
      'trainingRows':len(rows),'features':FEATURES,'intercept':b,'coefficients':w,'scaling':{k:{'min':RANGES[k][0],'max':RANGES[k][1]} for k in FEATURES},
      'trainingSource':('Local Veriq lifecycle dataset with deterministic bootstrap augmentation for prototype training.' if source=='local lifecycle dataset' else 'Clean-extract bootstrap dataset with deterministic augmentation; retrain against backend/data/veriq.json after first local run.'),
      'limitations':['Prototype model; not department-validated.','Not a legal/compliance decision engine.','Human review remains required before inspection or enforcement action.']
    }
    OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(model,indent=2),encoding='utf-8')
    print(f'Trained {model["version"]} on {len(rows)} prototype rows -> {OUT}')

if __name__=='__main__': main()
