const {test}=require('node:test');const assert=require('node:assert/strict');const handler=require('../api/assist');
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.body=v;return this}}}
test('AI configuration, authentication, input and draft filtering',async()=>{
 delete process.env.SOLVE_AI_API_KEY;delete process.env.OPENAI_API_KEY;delete process.env.SOLVE_ACCESS_CODE;
 let r=response();await handler({method:'POST'},r);assert.equal(r.code,503);
 process.env.SOLVE_AI_API_KEY='test-key';process.env.SOLVE_ACCESS_CODE='test-code';
 const req={method:'POST',headers:{'x-solve-code':'wrong'},body:{mode:'problem',text:'Orders are late'}};
 r=response();await handler(req,r);assert.equal(r.code,401);
 req.headers['x-solve-code']='test-code';req.body={mode:'business',text:'http://127.0.0.1'};r=response();await handler(req,r);assert.equal(r.code,400);
 req.body={mode:'problem',text:'Orders are late'};const original=global.fetch;
 try{global.fetch=async()=>({ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify({fields:{title:'Late orders',actual:'99',decision:'Move to scale',root:'Hypothesis: capacity constraints'},summary:'Check the dispatch process.',questions:['Where does delay begin?'],assumptions:['Capacity may be constrained'],sources:[]})}]}]})});r=response();await handler(req,r);assert.equal(r.code,200);assert.equal(r.body.fields.title,'Late orders');assert.equal(r.body.fields.actual,undefined);assert.equal(r.body.fields.decision,undefined);
 global.fetch=async()=>({ok:true,json:async()=>({output:[]})});r=response();await handler(req,r);assert.equal(r.code,502);
 }finally{global.fetch=original;delete process.env.SOLVE_AI_API_KEY;delete process.env.SOLVE_ACCESS_CODE}
});
