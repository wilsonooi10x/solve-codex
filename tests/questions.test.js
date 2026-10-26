const {test}=require('node:test'),assert=require('node:assert/strict');const Q=require('../questions');const handler=require('../api/guide');const ai=require('../lib/ai');
test('numbered question formatting preserves order, introductory text, decimals and legacy question marks',()=>{
 assert.deepEqual(Q.parts('1. Who owns this?\n2. What is the target?\n3. When is review?'),['Who owns this?','What is the target?','When is review?']);
 assert.deepEqual(Q.parts('Please clarify: 1. What changed? 2. When?'),['Please clarify: What changed?','When?']);
 assert.deepEqual(Q.parts('What changed? When did it start? Estimates are fine.'),['What changed?','When did it start? Estimates are fine.']);
 assert.deepEqual(Q.parts('Was the rate 3.5%?'),['Was the rate 3.5%?']);assert.equal(Q.format(['Who?','When?']),'1. Who?\n2. When?');assert.equal(Q.format('What happened?'),'What happened?');
});
test('guided API returns ordered subquestions and supplies exact displayed numbering with numbered answers to AI',async()=>{
 const oldGenerate=ai.generate,oldConfigured=ai.configured,oldCode=process.env.SOLVE_ACCESS_CODE;let received;ai.configured=()=>true;process.env.SOLVE_ACCESS_CODE='test';ai.generate=async input=>{received=input;return {fields:{},ready:false,questions:['Which outlet is affected?','When did the decline start?','What impact have you measured?'],question:'Combined text',summary:'Saved',assumptions:[]}};
 try{const res={setHeader(){},status(c){this.code=c;return this},json(v){this.body=v;return this}};const currentQuestion='1. Who owns the pilot?\n2. What is the due date?';await handler({method:'POST',headers:{'x-solve-code':'test'},body:{stage:'Validate',problem:{},currentQuestion,message:'1. Sarah\n2. 2026-11-06'}},res);assert.equal(res.code,200);assert.equal(res.body.question,'1. Which outlet is affected?\n2. When did the decline start?\n3. What impact have you measured?');const data=JSON.parse(received.input);assert.equal(data.context.currentQuestion,currentQuestion);assert.equal(data.message,'1. Sarah\n2. 2026-11-06');assert.match(received.instructions,/Do not treat question numbers as business measurements/);assert.equal(received.schema.properties.questions.maxItems,3);
 }finally{ai.generate=oldGenerate;ai.configured=oldConfigured;if(oldCode===undefined)delete process.env.SOLVE_ACCESS_CODE;else process.env.SOLVE_ACCESS_CODE=oldCode}
});
