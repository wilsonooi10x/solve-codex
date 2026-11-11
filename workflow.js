(function(root){
 const stages=['State','Observe','List','Validate','Execute & Evolve'];
 const workshopSections=[
  [['Problem worth solving','title','What problem are we solving?'],['Current situation','current','What is happening now?'],['Impact','impact','What is the business impact?'],['Big problem statement','statement','Summarise the key problem.']],
  [['Where is the leakage?','leakage','Stage / process → observation / data → gap or leakage'],...Array.from({length:5},(_,i)=>['Why '+(i+1),'why'+i,'Why is this happening?']),['Root cause summary','root','Key root causes based on evidence. Label uncertain explanations as hypotheses.']],
  [...Array.from({length:5},(_,i)=>['Possible solution '+(i+1),'solution'+i,'What could we do?']),['Best solution & rationale','chosen','Which solution will we take, and why?']],
  [['Experiment / pilot','how','What will we test? How?'],['Decision owner','owner','Who will decide?'],['Person in charge','pic','Who will carry out the test?'],['Pilot due date','due','YYYY-MM-DD','date'],['Metric / outcome','metric','What will we measure?'],['Measurement method','method','How will we check it?'],['Expected result','expected','What do we expect?'],['Actual result','actual','What actually happened? Leave blank until tested.'],['Evidence / learning','feedback','Expected vs actual: what did we learn?'],['Decision','decision','Adopt, Scale, Improve, or Stop?'],['Decision & why','reason','Why did we choose this?']],
  [['Execution plan — What','execution','What will we execute?'],['How','executionHow','How will we execute?'],['Who / PIC','pic','Who is responsible?'],['When','due','YYYY-MM-DD','date'],['Target','target','What result do we want?'],...Array.from({length:3},(_,i)=>[['Metric '+(i+1),'kpi'+i,'KPI'],['Target '+(i+1),'target'+i,'Target'],['Measurement method '+(i+1),'measurement'+i,'How will we measure?']]).flat(),['Learning','learning','What should evolve?'],['Next review','review','YYYY-MM-DD','date']]
 ];
 const stageInfo={
 State:{aim:'Define the business problem and the decision needed.',steps:'Describe the current situation → business impact → one clear problem statement.',output:'A focused problem statement; separate observations from interpretations.'},
 Observe:{aim:'Find a plausible cause that can be tested, not just a symptom or a person to blame.',steps:'Map the process and leakage → ask Why along supported causal links → check evidence and alternatives.',output:'A working root cause, supporting observations and open evidence checks. Use up to five Whys; do not invent answers to fill five boxes.'},
 List:{aim:'Converge on one targeted option to test.',steps:'Link each option to a cause → score impact, ease of effort and feasibility (1–5) → choose and explain.',output:'One selected option and rationale. Scores are decision aids, not proof of impact; 5 means best and ease 5 means least effort.'},
 Validate:{aim:'Test the selected option at a small, reversible scale.',steps:'Confirm pilot, owner, PIC, date, success criterion and measurement → run the test → record actual evidence → owner decides.',output:'During the hackathon: a test-ready plan. Later: expected versus actual, learning and an Adopt / Improve / Stop / Scale decision. Creating training videos is an activity; also measure the behaviour or business outcome it should improve.'},
 'Execute & Evolve':{aim:'Deploy an approved approach, then measure and review it.',steps:'What / how / who / when → business target and KPI → actual outcome → learning and next decision.',output:'During the hackathon: an optional conditional rollout draft. After pilot evidence and approval: a confirmed execution plan, then a dated outcome review. Planning complete is different from problem solved.'}
 };
 const stageFields={State:['title','why','current','impact','statement'],Observe:['leakage','why0','why1','why2','why3','why4','root'],List:['chosen'],Validate:['how','metric','expected','method','pic','owner','due','actual','feedback'], 'Execute & Evolve':['execution','executionHow','target','pic','owner','due','kpi0','target0','result0','measurement0','kpi1','target1','measurement1','kpi2','target2','measurement2','learning','review']};
 const requirements={State:['title','current','impact','statement'],Observe:['leakage','root'],Validate:['how','metric','expected','method','pic','owner','due'],'Execute & Evolve':['execution','executionHow','target','pic','due','kpi0','target0','measurement0','review']};
 const present=v=>typeof v==='string'&&v.trim().length>0;
 function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v}
 function missing(stage,p){return (requirements[stage]||[]).filter(k=>!present(p[k])||(['due','review'].includes(k)&&!validDate(p[k])))}
 function canDecide(p){return (p.frameworkVersion!==2||Boolean(p.resultConfirmedAt))&&p.pilotStarted&&present(p.actual)&&(['qualitative','mixed'].includes(p.resultType)||Number.isFinite(Number(p.actual)))&&present(p.expected)&&(['qualitative','mixed'].includes(p.resultType)||Number.isFinite(Number(p.expected)))&&present(p.metric)&&present(p.feedback)}
 function resultType(expected,actual){if([expected,actual].every(v=>present(v)&&Number.isFinite(Number(v))))return 'numeric';return /[0-9]/.test(expected+' '+actual)?'mixed':'qualitative'}
 function score(s,priority='balanced'){const impact=Number(s.impact)||1,ease=Number(s.effort)||1,feasibility=Number(s.feasibility)||1;return priority==='impact'?impact*3+ease+feasibility:priority==='ease'?impact+ease*3+feasibility:priority==='feasibility'?impact+ease+feasibility*3:impact+ease+feasibility}
 const pilotFields=['how','owner','pic','due','metric','expected','method'];
 const executionFields=['execution','executionHow','pic','due','target','kpi0','target0','measurement0','review'];
 function canScale(p){return Boolean(canDecide(p)&&['Move to scale','Scale','Adopt'].includes(p.decision)&&present(p.reason))}
 function stageProgress(p){
  if(['Resolved','Closed','Stopped','Adopted'].includes(p.status))return {phase:'closed',label:'Cycle closed — outcome/decision recorded',next:'Reopen only when new evidence or circumstances need another cycle.'};
  if(p.stage==='Execute & Evolve')return p.executionConfirmedAt?{phase:'executing',label:'Execution plan confirmed',next:'Run the agreed plan and return on '+(validDate(p.review)?p.review:'the review date')+' to record outcomes.'}:{phase:'execution-plan',label:'Confirm the rollout plan',next:canScale(p)?'Review what, how, who, when and the KPI, then confirm.':'Record actual pilot evidence and an owner decision in Validate before starting rollout.'};
  if(p.stage==='Validate'){if(canDecide(p))return {phase:'decision',label:'Pilot evidence recorded — owner decision needed',next:'Adopt at tested scope, improve/retest, stop, or approve wider rollout.'};if(p.pilotStarted)return {phase:'waiting',label:'Pilot running — awaiting real results',next:'No more planning questions are needed. Return after the test to record actual evidence.'};if(p.sessionReadyAt)return {phase:'plan-ready',label:'Planning session complete — pilot ready',next:'Run the pilot outside the workshop. A conditional rollout draft can be prepared without claiming success.'};return {phase:'pilot-plan',label:'Prepare a test-ready plan',next:'Confirm the pilot plan below; actual results may remain blank during the hackathon.'}}
  return {phase:'diagnosis',label:'Build the decision brief',next:stageInfo[p.stage]?.output||'Review the case.'};
 }
 function activateRollout(p){if(!canScale(p))throw Error('Record actual pilot evidence and the owner’s Adopt or Scale decision first.');p.pilotPlan=Object.fromEntries(pilotFields.map(k=>[k,p[k]||'']));const draft=p.rolloutDraft||{};for(const k of executionFields)p[k]=typeof draft[k]==='string'?draft[k]:'';for(let i=0;i<3;i++){p['result'+i]='';for(const key of ['kpi','target','measurement'])if(i>0)p[key+i]=typeof draft[key+i]==='string'?draft[key+i]:''}delete p.executionConfirmedAt;p.stage='Execute & Evolve';p.status=p.decision==='Adopt'?'Preparing adoption':'Scaling';return p;}
 function scoreComplete(s){return Boolean(s?.name?.trim()&&['impact','effort','feasibility'].every(k=>Number.isFinite(Number(s[k]))&&Number(s[k])>=1&&Number(s[k])<=5))}
 // Durable decision context travels separately from the rolling conversation window.
 function navigationReply(value){return /^(?:(?:ok(?:ay)?|yes|yeah|yep)(?:\s+(?:pls|please))?|(?:ok\s+)?(?:let['’]?s\s+)?(?:move on|move to (?:observe|the next stage)|continue|next)|don['’]?t know|not sure|can skip this question)[\s.!?]*$/i.test(String(value||'').trim());}
 function executiveMemory(problem={},history=[]){
  const prior=problem.executive&&typeof problem.executive==='object'?problem.executive:{};
  const messages=Array.isArray(problem.guidance?.messages)?problem.guidance.messages:history;
  const users=messages.filter(m=>m?.role==='user'&&typeof m.text==='string');
  const clip=(s,n)=>typeof s==='string'?s.slice(0,n):'';
  const originalGoal=clip(prior.originalGoal&&!navigationReply(prior.originalGoal)?prior.originalGoal:users.find(m=>!navigationReply(m.text))?.text||problem.statement||problem.current||problem.title,1200);
  const facts=Array.isArray(prior.facts)?prior.facts.filter(x=>typeof x==='string'):[...users.slice(0,10),...users.slice(-4)].map(m=>m.text);
  const stageTurns={};for(const stage of stages){const saved=Number.isSafeInteger(prior.stageTurns?.[stage]),count=users.filter(m=>m.stage===stage||(!m.stage&&!saved&&problem.stage===stage)).length;stageTurns[stage]=Math.min(2000,Math.max(count,saved?Math.max(0,prior.stageTurns[stage]):0));}
  return {originalGoal,goal:clip(prior.goal&&!navigationReply(prior.goal)?prior.goal:originalGoal,1200),facts:[...new Set(facts)].slice(0,16).map(x=>clip(x,320)),stageTurns,
   recommendation:clip(prior.recommendation,1100),hypotheses:(Array.isArray(prior.hypotheses)?prior.hypotheses:[]).filter(x=>typeof x==='string').slice(0,3).map(x=>clip(x,350)),
   evidenceGaps:(Array.isArray(prior.evidenceGaps)?prior.evidenceGaps:[]).filter(x=>typeof x==='string').slice(0,4).map(x=>clip(x,250)),
   proposedActions:(Array.isArray(prior.proposedActions)?prior.proposedActions:[]).filter(x=>typeof x==='string').slice(0,3).map(x=>clip(x,350))};
 }
 // Only concise case facts and recent turns belong in AI context. Audit logs stay in storage/PDFs.
 function guideContext(input){
  const source=input.problem&&typeof input.problem==='object'?input.problem:{},omitted=[];
  function excerpt(value,max){const text=String(value);if(JSON.stringify(text).length<=max)return text;let lo=0,hi=text.length;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(JSON.stringify(text.slice(0,mid)+' … [excerpt]').length<=max)lo=mid;else hi=mid-1}return text.slice(0,lo)+' … [excerpt]'}
  function pickStrings(record,keys,budget,max){const out={};for(const key of [...new Set(keys)]){const v=record?.[key];if(typeof v!=='string'||!v)continue;const allowed=Math.min(max,budget-key.length-6);if(allowed<80){omitted.push(key);continue}const text=excerpt(v,allowed);out[key]=text;budget-=JSON.stringify({[key]:text}).length;if(text!==v)omitted.push(key)}return out}
  const keys=[...(stageFields[input.stage]||[]),'title','statement','root','leakage','chosen','owner','pic','due','resultType','status','executionConfirmedAt','resultConfirmedAt','sessionReadyAt','decision','reason',...Object.values(stageFields).flat(),'kpi1','target1','result1','measurement1','kpi2','target2','result2','measurement2'];
  const problem=pickStrings(source,keys,14000,1800);problem.stage=stages.includes(input.stage)?input.stage:'State';problem.pilotStarted=source.pilotStarted===true;problem.frameworkVersion=source.frameworkVersion===2?2:1;if(source.stateEvidence&&typeof source.stateEvidence==='object')problem.stateEvidence=pickStrings(source.stateEvidence,['gapQuote','scopeQuote','impactQuote'],1400,420);
  if(Array.isArray(source.solutions))problem.solutions=source.solutions.filter(s=>s&&typeof s==='object').slice(0,5).map(s=>({...pickStrings(s,['name','rationale'],600,280),impact:Number(s.impact)||1,effort:Number(s.effort)||1,feasibility:Number(s.feasibility)||1}));
  const business=pickStrings(input.business,['company','website','purpose','vision','mission','values','positioning'],3500,750);
  const history=[];let budget=6000;for(const m of (Array.isArray(input.history)?input.history:[]).slice(-12).reverse()){if(!m||typeof m!=='object')continue;const entry={role:m.role==='assistant'?'assistant':'user',...pickStrings(m,['question','text'],Math.min(budget,3500),3000)};if(stages.includes(m.stage))entry.stage=m.stage;const size=JSON.stringify(entry).length;if(size>budget||(!entry.text&&!entry.question))break;history.unshift(entry);budget-=size}
  const memory=executiveMemory({...source,executive:source.executive||input.executive},Array.isArray(input.history)?input.history:[]);
  // Recover early user reports for a State case even if an older model omitted
  // them from memory. Recent request history alone can no longer contain them.
  const stateUsers=(Array.isArray(input.history)?input.history:[]).filter(m=>m?.role==='user'&&typeof m.text==='string');
  const facts=input.stage==='State'?[...new Set([...stateUsers.slice(0,6).map(m=>m.text),...memory.facts,...stateUsers.slice(-4).map(m=>m.text)])].slice(0,16):memory.facts;
  const executive={originalGoal:excerpt(memory.originalGoal,650),goal:excerpt(memory.goal,900),facts:facts.map(x=>excerpt(x,250)),stageTurns:memory.stageTurns,recommendation:excerpt(memory.recommendation,600),hypotheses:memory.hypotheses.map(x=>excerpt(x,220)),evidenceGaps:memory.evidenceGaps.map(x=>excerpt(x,140)),proposedActions:memory.proposedActions.map(x=>excerpt(x,180))};
  return {stage:problem.stage,problem,business,executive,history,frameworkStep:source.frameworkVersion===2?frameworkStep({...source,stage:problem.stage}):null,currentQuestion:excerpt(input.currentQuestion||'',2000),clientDate:String(input.clientDate||'').slice(0,20),timezone:String(input.timezone||'').slice(0,80),contextNote:'Selected field excerpts and recent conversation only; full history, original fields, trials and audit logs remain saved. Clarify details if an excerpt is insufficient.',excerptedFields:[...new Set(omitted)].slice(0,60)};
 }
 // Concrete examples may be qualitative; numbers and dates are not mandatory.
 function adviceRequested(value){return /\b(?:don['’]?t know|do not know|not sure|unsure|no idea|no data|please (?:help|suggest|advise|guide)|can you (?:please )?(?:help|advise)|any (?:advice|suggestions)|move (?:on|to observe)|skip (?:this|the) question|you suggest|need (?:your )?(?:help|advice|advise)|what (?:can|should) (?:i|we) do|what do you (?:suggest|recommend)|can(?:not|['’]t) (?:answer|recall|remember|explain))\b/i.test(String(value||''));}
 function observableStateGap(value){
  const text=String(value||'').trim().toLowerCase().replace(/[’‘]/g,"'");
  if(!text||/^(?:not (?:yet )?known|unknown|not sure|not provided|not established)/.test(text))return false;
  // Do not let a padded evaluation (or a duration alone) stand in for an observation.
  const measured=/\b\d+(?:[.,]\d+)?\s*(?:%(?!\w)|(?:orders?|sales|projects?|quotations?|quotes?|customers?|clients?|covers?|complaints?|errors?|deliveries|deals?|tickets?|returns?|days? late|weeks? late)\b)/.test(text)||/\b(?:zero|no)\s+(?:orders?|sales|deals?|responses?|replies|conversions?|deliveries)\b/.test(text)||/\b(?:from|by)\s+(?:rm|usd|\$)?\s*\d/.test(text);
  const event=/\b(?:drop(?:ped|s|ping)?|declin(?:e|ed|es|ing)|fall(?:en|ing|s)?|fell|decreas(?:e|ed|es|ing)|miss(?:ed|es|ing)?|overdue|delayed|late|incorrect|wrong|incomplete|cancel(?:led|ed|s)?|broken|damaged|duplicated|stopped|reject(?:ed|s)?|rework|resign(?:ed|s)?|refund(?:ed|s)?|stalled|unanswered|unpaid|unresolved|lost|losing)\b/.test(text);
  const failure=/\b(?:does(?:n't| not)|did(?:n't| not)|has(?:n't| not)|have(?:n't| not)|cannot|can(?:'t| not)|fail(?:ed|s)? to|not)\s+(?:(?:been|being|ever|yet|always|regularly|consistently|get to|got to)\s+)*(?:follow(?:ing)?[- ]up|submit(?:ted)?|deliver(?:ed)?|respond(?:ed)?|reply|pay|paid|complete(?:d)?|convert(?:ed)?|return(?:ed)?|arrive(?:d)?|record(?:ed)?|close(?:d)?)\b/.test(text);
  const process=/\b(?:targets?|follow[- ]ups?|sop|procedure|pipeline|deadline|handover|invoice|payment|shipment|orders?|report|customers?|clients?|covers?|buyers?|prospects?|inquiry|enquiry|leads?|meeting|project|approval|contract|task|ticket|record|budget|quotation|delivery|deal|email|call|sales|stock|product|service|booking|revenue|data|equipment|machine|part|unit)\b/.test(text);
  const absence=/\b(?:no|without)\s+(?:(?:concrete|documented|defined|agreed|follow|up|follow-up|sales)\s+)*(?:sop|procedure|process|owner|ownership|record|handover)\b/.test(text);
  return measured||((event||failure)&&process)||absence;
 }
 function stateSpecific(p){return missing('State',p).length===0&&String(p.current||'').trim().length>=25&&String(p.statement||'').trim().length>=25&&!/^(?:my )?(?:sales|manager|staff|business|team)(?: is| are)? (?:bad|poor|not performing|a problem)[.!]?$/i.test(String(p.current||'').trim());}
 function frameworkStep(p){
  const stage=p.stage||'State',has=k=>typeof p[k]==='string'&&p[k].trim();
  if(stage==='State'){
   if(!has('title'))return {key:'title',question:'What business problem would you like to solve?'};
   if(!has('current')||String(p.current).length<25)return {key:'current',question:'What specifically is happening now, compared with what you need?'};
   if(!has('impact'))return {key:'impact',question:'How is this affecting the business?'};
   return {key:'statement',question:'What important detail is missing from this problem statement?'};
  }
  if(stage==='Observe'){
   if(!has('leakage'))return {key:'leakage',question:'Where in the process do you see the biggest gap, and what have you observed there?'};
   const i=Array.from({length:5},(_,i)=>i).find(i=>!has('why'+i));
   if(i!==undefined)return {key:'why'+i,question:i===0?'Why do you think this gap is happening?':'Why is that happening — what have you observed that explains it?'};
   return {key:'root',question:'What observation supports this possible root cause?'};
  }
  if(stage==='List')return {key:'solutions',question:'What possible solutions would you consider? You can share your ideas or ask me to suggest options.'};
  if(stage==='Validate'){
   if(p.pilotStarted){if(has('actual')&&!p.resultConfirmedAt)return {key:'result-confirm',question:'Review and confirm your reported test result, then choose the next action.'};if(!has('actual'))return {key:'actual',question:'What actually happened in the test, compared with the expected result?'};if(!has('feedback'))return {key:'feedback',question:'What did you observe or measure that supports this result?'};return {key:'decision',question:'Based on the result, will you Adopt, Improve, Scale or Stop?'};}
   const questions={how:'What is the smallest practical test of this solution?',metric:'What outcome will you measure?',expected:'What result would count as success?',method:'How will you measure that result?',pic:'Who will carry out the test?',owner:'Who will make the decision after the test?',due:'When will the test be completed?'};
   for(const key of Object.keys(questions))if(!has(key)||(key==='due'&&!validDate(p[key])))return {key,question:questions[key],type:key==='due'?'date':'text'};
   return {key:'pilot-confirm',question:p.sessionReadyAt?'Your test plan is saved. Run it, then return with the result.':'Your test plan is ready. Confirm it, then run the test and return with the result.'};
  }
  const questions={execution:'What will you put into action?',pic:'Who is responsible for carrying it out?',due:'When will it be completed?',executionHow:'How will it be carried out?',target:'What business result do you want to achieve?',kpi0:'Which key measure will show whether this worked?',target0:'What is the target for this measure?',measurement0:'How will you measure it?',review:'When will you review progress?'};
  for(const key of Object.keys(questions))if(!has(key)||(['due','review'].includes(key)&&!validDate(p[key])))return {key,question:questions[key],type:['due','review'].includes(key)?'date':'text'};
  return {key:'execution-confirm',question:p.executionConfirmedAt?'Your execution plan is saved. Carry it out and return on '+p.review+' to review the result.':'Your execution plan is ready to confirm.'};
 }
 const api={navigationReply,adviceRequested,observableStateGap,stateSpecific,frameworkStep,validDate,stageInfo,workshopSections,pilotFields,executionFields,canScale,stageProgress,activateRollout,scoreComplete,executiveMemory,stages,stageFields,missing,canDecide,resultType,score,guideContext};if(typeof module==='object'&&module.exports)module.exports=api;else root.SolveWorkflow=api;
})(typeof window==='object'?window:globalThis);
