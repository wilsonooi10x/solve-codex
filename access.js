/* Participants use the organisation's managed credits; personal keys are not accepted. */
(function(){
 function clearLegacy(){for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k?.startsWith('solve-ai-source-'))sessionStorage.removeItem(k)}document.querySelector('#ai-connect-button')?.remove();document.querySelector('#ai-connection')?.remove();document.querySelector('#ai-source-confirmation')?.remove()}
 clearLegacy();
 window.SolveAccess={hasPersonalKey:()=>false,headers(code){const h={'Content-Type':'application/json','x-solve-code':code||''};try{const s=JSON.parse(localStorage.getItem('solve-session'));if(s?.access_token&&window.SolveWorkspace?.accountId)h.Authorization='Bearer '+s.access_token}catch{}return h},async readyHeaders(code){const h=this.headers(code);if(window.SolveWorkspace?.accountId&&window.SolveAccount)h.Authorization='Bearer '+await SolveAccount.getToken();return h},open(){window.SolveCredits?.open()}};
 window.addEventListener('solve-workspace-ready',clearLegacy);
})();
