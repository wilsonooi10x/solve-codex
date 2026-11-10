(()=>{
 let ready=false,pinEnabled=false,authenticated=false,error='';
 const notify=()=>window.dispatchEvent(new Event('solve-admin-session'));
 const api=window.SolveAdmin={
  get authenticated(){return authenticated},
  headers(code){return {'Content-Type':'application/json',...(authenticated?{'x-solve-admin-session':'1'}:{'x-solve-admin':code||''})}},
  handle(r){if(r.status===401&&authenticated){authenticated=false;error='Please enter your PIN again.';notify()}},
  gate(container){if(ready&&!pinEnabled)return false;if(ready&&authenticated)return false;
   container.innerHTML='<section class="admin-sign-in"><h1>Admin</h1><p>Enter your PIN to open the controls.</p><form><label>PIN<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" autocomplete="off" required></label><button class="primary" type="submit">Unlock Admin</button><p role="status"></p></form></section>';
   const form=container.querySelector('form'),status=form.querySelector('[role=status]'),button=form.querySelector('button');status.textContent=error||(!ready?'Checking Admin access…':'');button.disabled=!ready;
   form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;button.disabled=true;status.textContent='Checking PIN…';try{const r=await fetch('/api/admin-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',pin:form.elements.pin.value})});form.elements.pin.value='';const data=await r.json();if(!r.ok)throw Error(data.error||'Could not sign in.');authenticated=true;error='';notify()}catch(e){status.textContent=e.message;button.disabled=false}};return true;
  },
  async logout(){try{const r=await fetch('/api/admin-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(!r.ok)throw Error('Could not lock Admin. Please try again.');authenticated=false;notify()}catch(e){alert(e.message)}}
 };
 fetch('/api/admin-session',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const data=await r.json();pinEnabled=data.pinEnabled;authenticated=data.authenticated;ready=true;notify()}).catch(()=>{error='Admin access could not be checked. Refresh to try again.';notify()});
})();
