(function(root){
 const stages=['State','Observe','List','Validate','Execute & Evolve'];
 const stageFields={State:['title','why','current','impact','statement'],Observe:['leakage','why0','why1','why2','why3','why4','root'],List:['chosen'],Validate:['how','metric','expected','method','pic','owner','due','actual','feedback'], 'Execute & Evolve':['execution','executionHow','target','pic','owner','due','kpi0','target0','result0','measurement0','learning','review']};
 const requirements={State:['title','current','impact','statement'],Observe:['leakage','root'],Validate:['how','metric','expected','method','pic','owner','due'],'Execute & Evolve':['execution','executionHow','target','pic','due','kpi0','target0','measurement0','review']};
 const present=v=>typeof v==='string'&&v.trim().length>0;
 function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v}
 function missing(stage,p){return (requirements[stage]||[]).filter(k=>!present(p[k])||(['due','review'].includes(k)&&!validDate(p[k])))}
 function canDecide(p){return p.pilotStarted&&present(p.actual)&&(['qualitative','mixed'].includes(p.resultType)||Number.isFinite(Number(p.actual)))&&present(p.expected)&&(['qualitative','mixed'].includes(p.resultType)||Number.isFinite(Number(p.expected)))&&present(p.metric)&&present(p.feedback)}
 function resultType(expected,actual){if([expected,actual].every(v=>present(v)&&Number.isFinite(Number(v))))return 'numeric';return /[0-9]/.test(expected+' '+actual)?'mixed':'qualitative'}
 function score(s,priority='balanced'){const impact=Number(s.impact)||1,ease=Number(s.effort)||1,feasibility=Number(s.feasibility)||1;return priority==='impact'?impact*3+ease+feasibility:priority==='ease'?impact+ease*3+feasibility:impact+ease+feasibility}
 // Durable decision context travels separately from the rolling conversation window.
 function executiveMemory(problem={},history=[]){
  const prior=problem.executive&&typeof problem.executive==='object'?problem.executive:{};
  const messages=Array.isArray(problem.guidance?.messages)?problem.guidance.messages:history;
  const users=messages.filter(m=>m?.role==='user'&&typeof m.text==='string');
  const clip=(s,n)=>typeof s==='string'?s.slice(0,n):'';
  const originalGoal=clip(prior.originalGoal||users[0]?.text||problem.statement||problem.current||problem.title,1200);
  const facts=Array.isArray(prior.facts)?prior.facts.filter(x=>typeof x==='string'):[...users.slice(0,10),...users.slice(-4)].map(m=>m.text);
  const stageTurns={};for(const stage of stages)stageTurns[stage]=Number.isSafeInteger(prior.stageTurns?.[stage])?Math.max(0,Math.min(2000,prior.stageTurns[stage])):users.filter(m=>(m.stage||problem.stage)===stage).length;
  return {originalGoal,goal:clip(prior.goal||originalGoal,1200),facts:[...new Set(facts)].slice(0,16).map(x=>clip(x,320)),stageTurns,
   recommendation:clip(prior.recommendation,1100),hypotheses:(Array.isArray(prior.hypotheses)?prior.hypotheses:[]).filter(x=>typeof x==='string').slice(0,3).map(x=>clip(x,350)),
   evidenceGaps:(Array.isArray(prior.evidenceGaps)?prior.evidenceGaps:[]).filter(x=>typeof x==='string').slice(0,4).map(x=>clip(x,250)),
   proposedActions:(Array.isArray(prior.proposedActions)?prior.proposedActions:[]).filter(x=>typeof x==='string').slice(0,3).map(x=>clip(x,350))};
 }
 // Only concise case facts and recent turns belong in AI context. Audit logs stay in storage/PDFs.
 function guideContext(input){
  const source=input.problem&&typeof input.problem==='object'?input.problem:{},omitted=[];
  function excerpt(value,max){const text=String(value);if(JSON.stringify(text).length<=max)return text;let lo=0,hi=text.length;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(JSON.stringify(text.slice(0,mid)+' … [excerpt]').length<=max)lo=mid;else hi=mid-1}return text.slice(0,lo)+' … [excerpt]'}
  function pickStrings(record,keys,budget,max){const out={};for(const key of [...new Set(keys)]){const v=record?.[key];if(typeof v!=='string'||!v)continue;const allowed=Math.min(max,budget-key.length-6);if(allowed<80){omitted.push(key);continue}const text=excerpt(v,allowed);out[key]=text;budget-=JSON.stringify({[key]:text}).length;if(text!==v)omitted.push(key)}return out}
  const keys=[...(stageFields[input.stage]||[]),'title','statement','root','leakage','chosen','owner','pic','due','resultType','status','decision','reason',...Object.values(stageFields).flat(),'kpi1','target1','result1','measurement1','kpi2','target2','result2','measurement2'];
  const problem=pickStrings(source,keys,14000,1800);problem.stage=stages.includes(input.stage)?input.stage:'State';problem.pilotStarted=source.pilotStarted===true;
  if(Array.isArray(source.solutions))problem.solutions=source.solutions.filter(s=>s&&typeof s==='object').slice(0,4).map(s=>({...pickStrings(s,['name','rationale'],600,280),impact:Number(s.impact)||1,effort:Number(s.effort)||1,feasibility:Number(s.feasibility)||1}));
  const business=pickStrings(input.business,['company','website','purpose','vision','mission','values','positioning'],3500,750);
  const history=[];let budget=6000;for(const m of (Array.isArray(input.history)?input.history:[]).slice(-12).reverse()){if(!m||typeof m!=='object')continue;const entry={role:m.role==='assistant'?'assistant':'user',...pickStrings(m,['question','text'],Math.min(budget,3500),3000)};const size=JSON.stringify(entry).length;if(size>budget||(!entry.text&&!entry.question))break;history.unshift(entry);budget-=size}
  const memory=executiveMemory({...source,executive:source.executive||input.executive},Array.isArray(input.history)?input.history:[]);
  const executive={originalGoal:excerpt(memory.originalGoal,650),goal:excerpt(memory.goal,900),facts:memory.facts.map(x=>excerpt(x,250)),stageTurns:memory.stageTurns,recommendation:excerpt(memory.recommendation,600),hypotheses:memory.hypotheses.map(x=>excerpt(x,220)),evidenceGaps:memory.evidenceGaps.map(x=>excerpt(x,140)),proposedActions:memory.proposedActions.map(x=>excerpt(x,180))};
  return {stage:problem.stage,problem,business,executive,history,currentQuestion:excerpt(input.currentQuestion||'',2000),clientDate:String(input.clientDate||'').slice(0,20),timezone:String(input.timezone||'').slice(0,80),contextNote:'Selected field excerpts and recent conversation only; full history, original fields, trials and audit logs remain saved. Clarify details if an excerpt is insufficient.',excerptedFields:[...new Set(omitted)].slice(0,60)};
 }
 const api={executiveMemory,stages,stageFields,missing,canDecide,resultType,score,guideContext};if(typeof module==='object'&&module.exports)module.exports=api;else root.SolveWorkflow=api;
})(typeof window==='object'?window:globalThis);
