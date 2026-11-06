const payments=require('../lib/payments'),credits=require('../lib/credits'),workshop=require('../lib/workshop');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');try{
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Use GET or POST.'});
 let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({error:'Invalid JSON.'})}}
 if(req.headers?.['x-solve-admin']){
  if(!workshop.admin(req.headers['x-solve-admin']))return res.status(401).json({error:'A valid facilitator admin code is required.'});
  if(req.method==='GET')return res.status(200).json(await payments.state());
  if(body?.action!=='configure')return res.status(400).json({error:'Unknown paid control action.'});
  return res.status(200).json(await payments.configure(body));
 }
 const state=await workshop.state();if(!state.configured||state.mode!=='os')return res.status(403).json({error:'Paid checkout opens after S.O.L.V.E OS release.'});
 const user=await credits.identity(req.headers);
 if(req.method==='GET')return res.status(200).json(await payments.offer(user));
 return res.status(200).json(await payments.checkout(user,body?.requestId));
 }catch(e){res.status(e.status||503).json({error:e.publicMessage||'Paid wallet setup or update failed. Ask the facilitator to check the paid SQL migration and settings.'})}};
