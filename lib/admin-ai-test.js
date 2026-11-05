// Fixed, admin-only diagnostic. It never receives participant data or changes workshop state.
async function testOpenAI(){
 const key=process.env.OPENAI_API_KEY,model=process.env.SOLVE_AI_MODEL||'gpt-4.1-mini';
 if(!key){const error=Error('Add OPENAI_API_KEY to Production in Vercel, then redeploy before testing.');error.status=503;throw error}
 const started=Date.now();let response;
 try{response=await fetch('https://api.openai.com/v1/responses',{
  method:'POST',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
  body:JSON.stringify({model,store:false,max_output_tokens:160,instructions:'You are a practical SOLVE facilitator. Ask exactly one short State-stage question about the supplied sample problem. Do not invent facts. Return the required JSON object only.',input:'Connection test sample: A company says sales are declining but has not measured when the decline started.',text:{format:{type:'json_schema',name:'solve_admin_connection_test',strict:true,schema:{type:'object',properties:{question:{type:'string'}},required:['question'],additionalProperties:false}}}})
 })}catch{const error=Error('The OpenAI connection timed out or could not be reached. No automatic retry was made; check Usage before running another test.');error.status=502;throw error}
 if(!response.ok){const messages={401:'OpenAI rejected the server API key. Check OPENAI_API_KEY in Vercel and redeploy.',403:'OpenAI denied access. Check Responses Write permission and model access for this project.',404:'The configured OpenAI model was not found or is not available to this project. Check SOLVE_AI_MODEL.',429:'OpenAI could not process the test. Check API credit, billing and rate limits.',400:'OpenAI did not accept this test request for the configured model. Check the model and Responses API support.'};const error=Error(messages[response.status]||'OpenAI is unavailable. Please try again later.');error.status=502;throw error}
 let data,result;
 try{data=await response.json();if(data.status&&data.status!=='completed')throw Error();const text=(data.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('');result=JSON.parse(text);if(typeof result.question!=='string'||!result.question.trim()||result.question.length>600)throw Error()}catch{const error=Error('OpenAI responded, but the structured SOLVE test answer was incomplete. Check Usage before retrying.');error.status=502;throw error}
 const count=v=>Number.isSafeInteger(v)&&v>=0?v:null;
 return {ok:true,provider:'OpenAI',requestedModel:model,model:typeof data.model==='string'?data.model.slice(0,120):model,question:result.question.trim(),usage:{inputTokens:count(data.usage?.input_tokens),outputTokens:count(data.usage?.output_tokens),totalTokens:count(data.usage?.total_tokens)},durationMs:Date.now()-started,defaultServerKey:process.env.ANTHROPIC_API_KEY?'ANTHROPIC_API_KEY':process.env.SOLVE_AI_API_KEY?'SOLVE_AI_API_KEY':'OPENAI_API_KEY'};
}
module.exports={testOpenAI};
