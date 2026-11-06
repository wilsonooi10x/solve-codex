const crypto = require('node:crypto');
const credits = require('./credits');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function fail(message, status=503) { const e=Error(message); e.status=status; e.publicMessage=message; return e; }
function config() {
 const key=process.env.STRIPE_SECRET_KEY, price=process.env.STRIPE_PRICE_ID;
 if(process.env.SOLVE_STRIPE_SANDBOX_ENABLED!=='true'||!/^sk_test_[\w]+$/.test(key||'')||!/^price_[\w]+$/.test(price||'')||!/^whsec_[\w]+$/.test(process.env.STRIPE_WEBHOOK_SECRET||'')) throw fail('Sandbox purchases are not enabled yet.');
 const raw=process.env.SOLVE_APP_URL||'https://solve-codex.vercel.app'; let url;try{url=new URL(raw)}catch{throw fail('Invalid checkout return URL configuration.')}
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw fail('Configure a fixed HTTPS app origin for checkout.');
 return {key,price,origin:url.origin};
}
function tester(user) {
 config();
 const emails=(process.env.SOLVE_STRIPE_TESTER_EMAILS||'').split(/[\s,;]+/).map(s=>s.toLowerCase()).filter(Boolean);
 if(!emails.includes(user.email.toLowerCase()))throw fail('Sandbox purchases and paid replies are limited to the named test accounts.',403);
}
async function stripe(path, {body, idempotency}={}) {
 const {key}=config();let r;
 try{r=await fetch('https://api.stripe.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+key,'Stripe-Version':'2025-04-30.basil',...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body:body?new URLSearchParams(body).toString():undefined,signal:AbortSignal.timeout(12000)})}catch{throw fail('Stripe could not be reached. Retry the same checkout; no replies have been added.')}
 if(!r.ok)throw fail('Stripe could not verify this test checkout. Check the Sandbox key, price and payment settings.');return r.json();
}
const rpc=(name,args)=>credits.db('rpc/solve_paid_'+name,args);
async function state(){const rows=await credits.db('solve_paid_settings?id=eq.main&select=*');if(!rows[0])throw fail('Run the paid wallet SQL setup first.');return rows[0]}
async function balance(user){return rpc('balance',{p_user:user.id})}
async function offer(user){tester(user);const b=await balance(user);return {...b,canBuy:b.enabled&&b.budgetAvailable&&!b.frozen,testMode:true,amount:2000,currency:'myr',replies:100}}
async function configure(b){if(typeof b.enabled!=='boolean'||!Number.isSafeInteger(b.revision))throw fail('Reload paid controls first.',400);const budget=Number(b.budget);if(!Number.isFinite(budget)||budget<0||budget>1000)throw fail('Enter a valid paid testing budget.',400);return rpc('configure',{p_revision:b.revision,p_enabled:b.enabled,p_budget:Math.round(budget*1000000)})}
async function checkout(user,id){
 tester(user);if(!UUID.test(id||''))throw fail('A valid checkout request ID is required.',400);
 const c=config(),b=await balance(user);if(!b.enabled||!b.budgetAvailable||b.frozen)throw fail('Paid testing is paused or its budget is unavailable.',403);
 const p=await stripe('prices/'+encodeURIComponent(c.price));
 if(p.id!==c.price||p.livemode!==false||!p.active||p.type!=='one_time'||p.currency!=='myr'||p.unit_amount!==2000||p.billing_scheme!=='per_unit'||p.transform_quantity)throw fail('The Sandbox price must be a one-time MYR 20.00 package.');
 const order=await rpc('order',{p_user:user.id,p_id:id,p_price:c.price});
 if(order.state==='fulfilled')throw fail('This checkout already added its replies. Refresh your balance.',409);
 if(order.state!=='pending')throw fail('This checkout needs payment review.',409);
 if(Date.now()-Date.parse(order.created_at)>45*60*1000)throw fail('This checkout expired. Start a new purchase.',410);
 const session=await stripe('checkout/sessions',{idempotency:'solve-sandbox-'+id,body:{mode:'payment','payment_method_types[0]':'card','line_items[0][price]':c.price,'line_items[0][quantity]':'1',client_reference_id:user.id,'metadata[solve_order]':id,'metadata[solve_owner]':user.id,'metadata[solve_package]':'100-text-replies-v1',success_url:c.origin+'/?payment=success#credits',cancel_url:c.origin+'/?payment=cancelled#credits',expires_at:String(Math.floor(Date.parse(order.created_at)/1000)+3600)}});
 if(session.livemode!==false||!/^cs_test_/.test(session.id||''))throw fail('Only Sandbox checkout is supported.');
 let target;try{target=new URL(session.url)}catch{throw fail('This checkout is no longer open. Start a new purchase.',410)}
 if(target.protocol!=='https:'||target.hostname!=='checkout.stripe.com'||target.username||target.password)throw fail('Stripe returned an invalid checkout URL.');
 await rpc('attach',{p_user:user.id,p_id:id,p_session:session.id});
 return {url:target.href,testMode:true};
}
function verifySignature(raw,header,secret,now=Date.now()){
 if(!Buffer.isBuffer(raw)||raw.length>65536||typeof header!=='string'||header.length>2048||!secret)throw fail('Invalid Stripe webhook signature.',400);
 const fields=header.split(',').map(x=>x.split('='));const timestamps=fields.filter(x=>x[0]==='t');
 if(timestamps.length!==1||!/^\d+$/.test(timestamps[0][1]))throw fail('Invalid Stripe webhook signature.',400);
 const timestamp=timestamps[0][1];if(Math.abs(now/1000-Number(timestamp))>300)throw fail('Expired Stripe webhook signature.',400);
 const expected=crypto.createHmac('sha256',secret).update(timestamp+'.').update(raw).digest();
 if(!fields.some(([k,v])=>k==='v1'&&/^[a-f0-9]{64}$/.test(v||'')&&crypto.timingSafeEqual(expected,Buffer.from(v,'hex'))))throw fail('Invalid Stripe webhook signature.',400);
 let event;try{event=JSON.parse(raw.toString('utf8'))}catch{throw fail('Invalid webhook JSON.',400)}
 if(event.livemode!==false)throw fail('Live payment events are not supported.',400);return event;
}
async function webhook(event){
 if(['charge.refunded','charge.dispute.created'].includes(event.type)){
  const intent=event.data?.object?.payment_intent;if(typeof intent!=='string'||!/^pi_\w+$/.test(intent))throw fail('Invalid payment intent.',400);
  return rpc('revoke',{p_intent:intent});
 }
 if(event.type!=='checkout.session.completed'&&event.type!=='checkout.session.async_payment_succeeded')return {ignored:true};
 const id=event.data?.object?.id;if(!/^cs_test_\w+$/.test(id||''))throw fail('Invalid Sandbox session.',400);
 const s=await stripe('checkout/sessions/'+encodeURIComponent(id)+'?expand[]=line_items&expand[]=payment_intent.latest_charge');
 const m=s.metadata||{},items=s.line_items?.data||[],pi=s.payment_intent,charge=pi?.latest_charge;
 if(s.id!==id||s.livemode!==false||s.mode!=='payment'||s.status!=='complete'||s.payment_status!=='paid'||s.currency!=='myr'||s.amount_total!==2000||s.amount_subtotal!==2000||s.total_details?.amount_discount>0||s.total_details?.amount_tax>0||!UUID.test(m.solve_order||'')||!UUID.test(m.solve_owner||'')||s.client_reference_id!==m.solve_owner||m.solve_package!=='100-text-replies-v1'||items.length!==1||s.line_items.has_more||items[0].quantity!==1||items[0].price?.id!==config().price||items[0].amount_total!==2000||items[0].currency!=='myr'||pi?.status!=='succeeded'||pi?.livemode!==false||pi?.amount_received!==2000||pi?.currency!=='myr'||!/^pi_\w+$/.test(pi?.id||'')||!charge||charge.refunded||charge.amount_refunded>0||charge.disputed)throw fail('Payment verification failed. No replies were added.',400);
 return rpc('fulfil',{p_id:m.solve_order,p_user:m.solve_owner,p_price:items[0].price.id,p_session:s.id,p_intent:pi.id});
}
module.exports={config,tester,rpc,state,balance,offer,configure,checkout,verifySignature,webhook};
