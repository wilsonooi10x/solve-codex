/* Company identity is confirmed once per workspace; it is not inferred from AI text. */
(function(){
 let scheduled=false,pendingAction=null;
 const details=()=>({company:business.company||business.coreDraft?.fields?.company||'',website:business.website||business.coreDraft?.fields?.website||''});
 function validWebsite(value){let raw=String(value||'').trim();if(!/^https?:\/\//i.test(raw))raw='https://'+raw;let u;try{u=new URL(raw)}catch{throw Error('Enter a valid HTTPS company website or page link.')}if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.'))throw Error('Enter a valid HTTPS company website or page link.');return u.href}
 function hasProfile(){const p=details();try{return Boolean(p.company.trim()&&validWebsite(p.website))}catch{return false}}
 function done(){return Boolean(business.onboarding?.completedAt)||hasProfile()}
 function markExisting(){if(!business.onboarding?.completedAt&&hasProfile()){const p=details();business={...business,company:p.company.trim(),website:validWebsite(p.website),onboarding:{version:1,completedAt:new Date().toISOString(),source:'existing-profile'}};saveBusiness()}}
 function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;check()},0)}
 function check(){const state=window.SolveWorkspace;if(!state?.ready)return;
 const current=document.querySelector('#company-onboarding');
 if(done()){markExisting();if(current?.open)current.close();if(pendingAction){const next=pendingAction;pendingAction=null;next()}return}
 if(state.accountId&&!state.loaded)return; // Never replace a profile that is still loading from cloud.
 if(document.querySelector('dialog[open]:not(#company-onboarding)'))return;
 const identity=state.accountId||'device';if(current?.open&&current.dataset.workspace===identity)return;
 let d=current;if(!d){d=document.createElement('dialog');d.id='company-onboarding';d.setAttribute('aria-labelledby','company-setup-title');d.addEventListener('cancel',e=>e.preventDefault());document.body.append(d)}else if(d.open)d.close();d.dataset.workspace=identity;
 const initial=details();
 d.innerHTML=`<form id="company-setup-form"><img class="setup-icon" src="/assets/icon-192.png" width="56" height="56" alt="SOLVE OS"><span class="eyebrow">WELCOME TO S.O.L.V.E OS</span><h2 id="company-setup-title">Let’s get to know your company.</h2><p>A quick, one-time setup helps put your business problems in context.</p><label>Company name<input name="company" type="text" maxlength="160" autocomplete="organization" placeholder="Your company name" value="${esc(initial.company)}" required></label><label>Company website or page<input name="website" type="text" inputmode="url" autocapitalize="none" spellcheck="false" maxlength="2000" placeholder="yourcompany.com or a company page link" value="${esc(initial.website)}" required></label><p class="hint">We’ll remember these details. You can update them later in Business Core 5.</p><p id="company-setup-error" role="alert"></p><button class="primary" type="submit">Save & continue →</button>${state.cloudConfigured?`<button class="text-button" type="button" id="setup-sign-in">${state.accountId?'Account / sign out':'Already have an account? Sign in first'}</button>`:''}<p class="hint">${state.accountId?'Your profile will sync with this account when connected.':'Saved on this browser. Sign in to a configured cloud account to sync between devices.'}</p></form>`;
 const form=d.querySelector('form');form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const company=form.elements.company.value.trim();if(!company){d.querySelector('#company-setup-error').textContent='Please enter your company name.';return}let website;try{website=validWebsite(form.elements.website.value)}catch(error){d.querySelector('#company-setup-error').textContent=error.message;return}
 const before=business;business={...business,company,website,onboarding:{version:1,completedAt:new Date().toISOString(),source:'company-setup'}};if(business.coreDraft)business.coreDraft={...business.coreDraft,fields:{...business.coreDraft.fields,company,website}};
 try{saveBusiness()}catch{business=before;d.querySelector('#company-setup-error').textContent='Your browser could not save the profile. Please check storage permissions and try again.';return}d.close();navigate('business');if(pendingAction){const next=pendingAction;pendingAction=null;next()}};
 d.querySelector('#setup-sign-in')?.addEventListener('click',()=>{d.close();document.querySelector('#sync-status')?.click()});d.showModal();
 }
 const originalNew=openNew,originalDetail=detail;
 openNew=function(){if(done())return originalNew();pendingAction=()=>originalNew();check()};
 detail=function(id){if(done())return originalDetail(id);pendingAction=()=>originalDetail(id);check()};
 const previousRender=render;render=function(){previousRender();schedule()};
 window.addEventListener('solve-workspace-ready',schedule);window.addEventListener('solve-local-save',schedule);
 new MutationObserver(schedule).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('storage',e=>{if(e.key==='solve-business'&&!window.SolveWorkspace?.accountId){try{const saved=JSON.parse(e.newValue);if(saved?.onboarding?.completedAt){business={...business,company:saved.company,website:saved.website,onboarding:saved.onboarding};schedule()}}catch{}}});
 render();schedule();
})();
