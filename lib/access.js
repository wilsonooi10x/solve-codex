const workshop=require('./workshop'),ai=require('./ai'),crypto=require('node:crypto');
async function authorize(req,res){
 const headers=req.headers||{};let state;try{state=await workshop.state()}catch{res.status(503).json({error:'Workshop controls cannot be checked. AI is paused; your notes are saved.'});return null}
 if(state.mode==='workshop'){res.status(403).json({error:'Workshop mode is active. Complete the worksheet yourself; AI opens only when the facilitator releases S.O.L.V.E OS.'});return null}
 const personal=headers['x-solve-api-key'],provider=headers['x-solve-provider'];
 if(personal){if(!['claude','openai'].includes(provider)||typeof personal!=='string'||personal.length<20||personal.length>512||!/^sk-[\w-]+$/.test(personal)){res.status(400).json({error:'Choose Claude or OpenAI and enter a valid personal API key.'});return null}return {apiKey:personal,provider}}
 if(state.configured){res.status(401).json({error:'Connect your own Claude or OpenAI API key using AI connection. Paid access codes are not enabled yet.'});return null}
 const code=process.env.SOLVE_ACCESS_CODE;if(!ai.configured()||!code){res.status(503).json({error:'AI needs activation. Add ANTHROPIC_API_KEY and SOLVE_ACCESS_CODE in Vercel, or connect a personal API key.'});return null}
 const hash=s=>crypto.createHash('sha256').update(String(s||'')).digest();if(!crypto.timingSafeEqual(hash(headers['x-solve-code']),hash(code))){res.status(401).json({error:'Enter your workshop AI access code under AI access, or connect a personal API key.'});return null}return {};
}
module.exports={authorize};
