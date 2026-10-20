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
 const api={stages,stageFields,missing,canDecide,resultType,score};if(typeof module==='object'&&module.exports)module.exports=api;else root.SolveWorkflow=api;
})(typeof window==='object'?window:globalThis);
