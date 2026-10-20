// These are public client settings, protected by Supabase RLS, never a service-role key.
module.exports=(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
 if(!url||!key)return res.status(200).json({configured:false});
 try{const u=new URL(url);if(u.protocol!=='https:')throw Error();if(key.startsWith('sb_secret_'))throw Error();if(key.split('.').length===3){const payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());if(payload.role!=='anon')throw Error()}else if(!key.startsWith('sb_publishable_'))throw Error();return res.status(200).json({configured:true,url:u.origin,key})}catch{return res.status(503).json({error:'Cloud sync configuration is invalid. Use the public publishable/anon key, never a secret or service-role key.'})}
};
