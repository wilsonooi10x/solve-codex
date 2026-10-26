const workshop=require('../lib/workshop');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control',req.method==='GET'?'public, max-age=0, s-maxage=3':'no-store');
 try{
 if(req.method==='GET'){const s=await workshop.state();return res.status(200).json(s)}
 if(req.method!=='POST')return res.status(405).json({error:'Use GET or POST.'});
 if(!workshop.admin(req.headers?.['x-solve-admin']))return res.status(401).json({error:'A valid facilitator admin code is required.'});
 if(!workshop.enabled())return res.status(503).json({error:'Enable workshop controls in Vercel first.'});
 let body=req.body;if(typeof body==='string')body=JSON.parse(body);const s=await workshop.update(body);return res.status(200).json(s);
 }catch(e){res.setHeader('Cache-Control','no-store');return res.status(e.status||503).json({error:e.message||'Workshop controls unavailable. AI stays locked until the controls reconnect.'})}
};
