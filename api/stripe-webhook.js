const payments=require('../lib/payments');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});try{
 let raw=req.rawBody;
 if(!Buffer.isBuffer(raw)){const chunks=[];let size=0;for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>65536)return res.status(413).json({error:'Webhook too large.'});chunks.push(b)}raw=Buffer.concat(chunks)}
 const event=payments.verifySignature(raw,req.headers?.['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);
 await payments.webhook(event);return res.status(200).json({received:true});
 }catch(e){return res.status(e.status||503).json({error:e.publicMessage||'Webhook processing failed. Stripe should retry this event.'})}};
module.exports.config={api:{bodyParser:false}};
