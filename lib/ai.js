// Secrets are read only by the server. Anthropic takes precedence when configured.
function configured(){return Boolean(process.env.ANTHROPIC_API_KEY||process.env.SOLVE_AI_API_KEY||process.env.OPENAI_API_KEY)}
function parse(text){return JSON.parse(text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''))}
async function generate({instructions,input,schema,search=false,maxTokens=2600,attachments=[]}){
 const anthropic=Boolean(process.env.ANTHROPIC_API_KEY);
 const key=anthropic?process.env.ANTHROPIC_API_KEY:process.env.SOLVE_AI_API_KEY||process.env.OPENAI_API_KEY;
 let url,headers,body;
 if(anthropic){
  url='https://api.anthropic.com/v1/messages';headers={'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'};
  body={model:process.env.SOLVE_CLAUDE_MODEL||'claude-sonnet-4-6',max_tokens:maxTokens,system:instructions,messages:[{role:'user',content:attachments.length?[{type:'text',text:input},...attachments.map(a=>a.text?{type:'text',text:`Attachment: ${a.name}\n${a.text}`}:{type:a.mime==='application/pdf'?'document':'image',source:{type:'base64',media_type:a.mime,data:a.data}})]:input}]};
  if(schema){body.tools=[{name:'submit_solve_turn',description:'Return the structured SOLVE turn.',input_schema:schema}];body.tool_choice={type:'tool',name:'submit_solve_turn'}}
  else if(search)body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:3}];
 }else{
  url='https://api.openai.com/v1/responses';headers={'Content-Type':'application/json',Authorization:`Bearer ${key}`};
  body={model:process.env.SOLVE_AI_MODEL||'gpt-4.1-mini',instructions,input:attachments.length?[{role:'user',content:[{type:'input_text',text:input},...attachments.map(a=>a.text?{type:'input_text',text:`Attachment: ${a.name}\n${a.text}`} : a.mime==='application/pdf'?{type:'input_file',filename:a.name,file_data:`data:${a.mime};base64,${a.data}`}:{type:'input_image',image_url:`data:${a.mime};base64,${a.data}`})]}]:input,max_output_tokens:maxTokens};
  if(schema)body.text={format:{type:'json_schema',name:'solve_guided_turn',strict:true,schema}};
  if(search)body.tools=[{type:'web_search_preview'}];
 }
 const response=await fetch(url,{method:'POST',signal:AbortSignal.timeout(45000),headers,body:JSON.stringify(body)});
 if(!response.ok){const provider=anthropic?'Claude':'OpenAI';const error=new Error('AI provider request failed');error.publicMessage=response.status===401?`${provider} rejected the API key. Check the key in Vercel and redeploy.`:[402,429].includes(response.status)?`${provider} could not process this request. Check API credit, billing and rate limits, then retry.`:response.status===404?`${provider} model was not found. Check the model setting in Vercel.`:`${provider} is unavailable or access was denied. Check API access and billing, then retry.`;throw error}
 const data=await response.json();
 if(anthropic){if(data.stop_reason==='max_tokens'||data.stop_reason==='pause_turn')throw Error('Incomplete AI response');if(schema){const tool=(data.content||[]).find(c=>c.type==='tool_use'&&c.name==='submit_solve_turn');if(!tool?.input)throw Error('Missing structured response');return tool.input}const texts=(data.content||[]).filter(c=>c.type==='text').map(c=>c.text);for(const text of [...texts].reverse()){try{return parse(text)}catch{}}return parse(texts.join(''))}
 return parse((data.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join(''));
}
module.exports={configured,generate};
