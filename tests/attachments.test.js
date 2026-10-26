const {test}=require('node:test');const assert=require('node:assert/strict');const {validateAttachments}=require('../lib/attachments');const ai=require('../lib/ai');
test('attachment validation enforces actual file signatures, total binary size and text limits',()=>{
 const pdf={name:'evidence.pdf',mime:'application/pdf',data:Buffer.from('%PDF-1.4\n').toString('base64')};assert.equal(validateAttachments([pdf])[0].name,'evidence.pdf');
 assert.throws(()=>validateAttachments([{...pdf,data:Buffer.from('fake').toString('base64')}]));assert.throws(()=>validateAttachments(Array(4).fill(pdf)));assert.throws(()=>validateAttachments([{name:'big.txt',mime:'text/plain',text:'x'.repeat(20001)}]));
 const big=Buffer.alloc(2*1024*1024);big.write('%PDF-');assert.equal(validateAttachments([{...pdf,data:big.toString('base64')}]).length,1);assert.throws(()=>validateAttachments([{...pdf,data:big.toString('base64')},pdf]));
});
test('AI adapters send documents, images and Office text in provider native formats',async()=>{
 const oldFetch=global.fetch,oldClaude=process.env.ANTHROPIC_API_KEY,oldOpenAI=process.env.OPENAI_API_KEY;let body;
 const attachments=[{name:'sales.pdf',mime:'application/pdf',data:'JVBERi0='},{name:'photo.png',mime:'image/png',data:'aGVsbG8='},{name:'sales.xlsx',mime:'text/plain',text:'A1: Revenue\tB1: 1200'}];
 try{process.env.ANTHROPIC_API_KEY='test';global.fetch=async(url,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({content:[{type:'tool_use',name:'submit_solve_turn',input:{ok:true}}]})}};await ai.generate({input:'Read evidence',schema:{type:'object'},attachments});const c=body.messages[0].content;assert.equal(c[1].type,'document');assert.equal(c[2].type,'image');assert.match(c[3].text,/B1: 1200/);
 delete process.env.ANTHROPIC_API_KEY;process.env.OPENAI_API_KEY='test';global.fetch=async(url,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'{"ok":true}'}]}]})}};await ai.generate({input:'Read evidence',attachments});assert.equal(body.input[0].content[1].type,'input_file');assert.equal(body.input[0].content[2].type,'input_image');assert.match(body.input[0].content[3].text,/Revenue/);
 }finally{global.fetch=oldFetch;if(oldClaude===undefined)delete process.env.ANTHROPIC_API_KEY;else process.env.ANTHROPIC_API_KEY=oldClaude;if(oldOpenAI===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldOpenAI}
});
