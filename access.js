/* Personal API keys exist only in this tab's memory, never in saved cases or browser storage. */
(function(){
 let key='',provider='claude',mode='credits',account=window.SolveWorkspace?.accountId||null;
 function preference(){try{return JSON.parse(sessionStorage.getItem('solve-ai-source-'+(account||'guest')))||{}}catch{return {}}}
 const saved=preference();if(saved.provider==='openai')provider='openai';if(saved.source==='personal')mode='pending';
 const name=()=>provider==='claude'?'Claude':'OpenAI';
 const changed=()=>{try{sessionStorage.setItem('solve-ai-source-'+(account||'guest'),JSON.stringify({source:mode==='credits'?'credits':'personal',provider}))}catch{}render();const d=document.querySelector('#guided-session[open]');if(d&&typeof guidePaint==='function')guidePaint(d);window.dispatchEvent(new Event('solve-ai-connection-changed'))};
 const reset=()=>{key='';mode='credits';changed()};
 window.addEventListener('solve-workspace-ready',e=>{const next=e.detail?.accountId||window.SolveWorkspace?.accountId||null;if(account!==next){const personalIntent=mode!=='credits';account=next;key='';const pref=preference();mode=pref.source==='personal'||personalIntent?'pending':'credits';provider=['claude','openai'].includes(pref.provider)?pref.provider:provider;const d=document.querySelector('#ai-connection');if(d?.open)d.close();changed()}account=next});
 // Accept common copy/paste wrappers without accepting spaces inside a key.
 function normalize(value){let v=value.replace(/[\u200B-\u200D\uFEFF]/g,'').trim();v=v.replace(/^(?:export\s+)?(?:ANTHROPIC_API_KEY|OPENAI_API_KEY)\s*=\s*/i,'').trim();if(/^["'“‘][\s\S]*["'”’]$/.test(v))v=v.slice(1,-1).trim();return v;}
 window.SolveAccess={
  hasPersonalKey:()=>mode!=='credits',
  async readyHeaders(code){const h=this.headers(code);if(mode==='credits'&&window.SolveWorkspace?.accountId&&window.SolveAccount)h.Authorization='Bearer '+await SolveAccount.getToken();return h},
  headers(code){
   if(mode==='pending')throw Error('Your personal API connection has not been applied. Open AI Connection to fix it, or explicitly choose 10XSC credits.');
   const h={'Content-Type':'application/json'};
   if(key){h['x-solve-api-key']=key;h['x-solve-provider']=provider}else{h['x-solve-code']=code||'';try{const s=JSON.parse(localStorage.getItem('solve-session'));if(s?.access_token&&window.SolveWorkspace?.accountId)h.Authorization='Bearer '+s.access_token}catch{}}
   return h;
  },
  open(){
   let d=document.querySelector('#ai-connection');if(!d){d=document.createElement('dialog');d.id='ai-connection';document.body.append(d)}
   d.innerHTML=`<form novalidate><div class="modal-head"><h2>Your AI connection</h2><button type="button" class="close" aria-label="Close">×</button></div><p>Choose your personal API account or 10XSC credits for your next AI request.</p><p role="status" aria-live="polite" id="ai-connection-status"></p><label>AI provider<select name="provider"><option value="claude">Claude (Anthropic)</option><option value="openai">OpenAI</option></select></label><label>Personal API key<input type="password" name="key" autocomplete="off" spellcheck="false" autocapitalize="none" autocorrect="off" maxlength="1024" placeholder="Paste your provider API key"></label><p class="hint">The key stays in this tab’s memory, never in saved work or browser storage. Re-enter it after reloading. Your provider charges your API account.</p><p><a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener noreferrer">Get a Claude API key ↗</a> · <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get an OpenAI API key ↗</a></p><button type="submit" class="primary">Use this connection</button><button type="button" class="text-button" id="disconnect-ai">Disconnect key</button><button type="button" class="text-button" id="use-trial-credit">Use 10XSC credits instead</button><p class="hint">Personal API selection is confirmed here; your provider checks the key and billing on your next AI request. A provider error never switches you to 10XSC credits automatically.</p></form>`;
   const f=d.querySelector('form'),status=d.querySelector('#ai-connection-status'),button=f.querySelector('[type=submit]');f.elements.provider.value=provider;
   const paint=()=>{status.textContent=mode==='personal'?`✓ Personal ${name()} API selected for this tab. 10XSC credits will not be used. Provider verification happens on your next request.`:mode==='pending'?'Personal connection needs setup. AI requests are paused until you apply a valid key or choose 10XSC credits.':'Using 10XSC credits when available. No personal API key selected.';status.className=mode==='personal'?'connection-selected':''};paint();
   f.elements.key.oninput=()=>{if(f.elements.key.value.trim()){key='';mode='pending';button.textContent='Use this connection';paint();changed()}};
   f.elements.provider.onchange=()=>{if(mode==='personal'){key='';mode='pending';button.textContent='Use this connection';paint();changed()}};
   d.querySelector('.close').onclick=()=>d.close();
   d.querySelector('#use-trial-credit').onclick=()=>{reset();f.elements.key.value='';d.close();window.SolveCredits?.open()};
   d.querySelector('#disconnect-ai').onclick=()=>{key='';mode='pending';f.elements.key.value='';button.textContent='Use this connection';paint();changed()};
   f.onsubmit=e=>{
    e.preventDefault();if(mode==='personal'&&!f.elements.key.value){paint();return}
    key='';mode='pending';const value=normalize(f.elements.key.value);changed();
    if(value.length<20||value.length>512||!/^sk-[\w-]+$/.test(value)){
     status.textContent='Connection not applied. Paste the full API secret key from your provider’s API-key page (starting sk-). Do not use a login, password or subscription code. 10XSC credits will not be used while setup is incomplete.';status.className='';status.scrollIntoView?.({block:'nearest'});return;
    }
    provider=value.startsWith('sk-ant-')?'claude':/^sk-(?:proj|svcacct)-/.test(value)?'openai':f.elements.provider.value;
    key=value;mode='personal';f.elements.provider.value=provider;f.elements.key.value='';button.textContent='Connection selected ✓';paint();changed();status.scrollIntoView?.({block:'nearest'});
   };d.showModal();
  }
 };
 const previous=render;render=function(){previous();let b=document.querySelector('#ai-connect-button');if(!b){b=document.createElement('button');b.id='ai-connect-button';b.className='sync-button';b.onclick=()=>SolveAccess.open();document.querySelector('header').append(b)}b.textContent=mode==='personal'?`AI · Personal ${name()}`:mode==='pending'?'AI · Setup needed':'AI Connection';b.title=mode==='personal'?'Personal API selected; 10XSC credits are not used.':mode==='pending'?'AI requests paused until a connection is selected.':'Choose your AI connection';};render();
})();
