/* A returning-visit greeting; no API calls, credits or persistent personal data. */
(function(){
 const seen=new Set();let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;check()},0)}
 function check(){
  const state=window.SolveWorkspace,id=state?.accountId||'device',existing=document.querySelector('#welcome-back');
  if(existing?.open&&existing.dataset.workspace!==id)existing.close();
  if(!state?.ready||(state.accountId&&!state.loaded))return;
  if(window.SolveWorkshop&&(!SolveWorkshop.ready||SolveWorkshop.mode!=='os'))return;
  if(location.hash==='#workshop-admin'||view!=='dashboard')return;
  const company=typeof business.company==='string'?business.company.trim():'';
  if(!company||document.querySelector('#company-onboarding[open]')){seen.add(id);return}
  if(seen.has(id)||document.querySelector('dialog[open]'))return;
  seen.add(id);let d=existing;if(!d){d=document.createElement('dialog');d.id='welcome-back';document.body.append(d)}
  d.dataset.workspace=id;d.setAttribute('aria-labelledby','welcome-back-title');
  d.innerHTML='<div class="modal-head"><span class="eyebrow">GOOD TO SEE YOU AGAIN</span><button type="button" class="close" aria-label="Close welcome">×</button></div><h2 id="welcome-back-title"></h2><p>Ready for your next clear step?</p><button type="button" class="primary" id="welcome-continue">Continue →</button>';
  d.querySelector('h2').textContent='Welcome back, '+company+'.';d.querySelector('.close').onclick=()=>d.close();d.querySelector('#welcome-continue').onclick=()=>d.close();d.showModal();
 }
 const previous=render;render=function(){previous();schedule()};
 window.addEventListener('solve-workspace-ready',schedule);window.addEventListener('solve-workshop-state',schedule);window.addEventListener('solve-local-save',schedule);
 new MutationObserver(schedule).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});schedule();
})();
