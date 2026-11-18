const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
test('participants have managed credits only and old personal selection cannot block or override funding',async t=>{
 const dom=new JSDOM('<header><button id="ai-connect-button">AI Connection</button></header><dialog id="ai-connection"></dialog>',{url:'https://solve.test',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window;
 w.sessionStorage.setItem('solve-ai-source-owner',JSON.stringify({source:'personal',provider:'claude'}));w.SolveWorkspace={accountId:'owner'};w.SolveAccount={getToken:async()=>'signed-account-token'};
 w.eval(fs.readFileSync('access.js','utf8'));assert.equal(w.document.querySelector('#ai-connect-button'),null);assert.equal(w.document.querySelector('#ai-connection'),null);assert.equal(w.sessionStorage.getItem('solve-ai-source-owner'),null);assert.equal(w.SolveAccess.hasPersonalKey(),false);
 const h=await w.SolveAccess.readyHeaders();assert.equal(h.Authorization,'Bearer signed-account-token');assert.equal(h['x-solve-api-key'],undefined);assert.equal(h['x-solve-provider'],undefined);
});
test('direct personal-key requests are rejected before AI or credit spending',async t=>{
 const workshop=require('../lib/workshop'),ai=require('../lib/ai'),credits=require('../lib/credits'),handler=require('../api/guide');const old={state:workshop.state,generate:ai.generate,runTurn:credits.runTurn};t.after(()=>Object.assign(workshop,{state:old.state})&&Object.assign(ai,{generate:old.generate})&&Object.assign(credits,{runTurn:old.runTurn}));
 workshop.state=async()=>({configured:true,mode:'os'});let calls=0;ai.generate=credits.runTurn=async()=>{calls++;throw Error('Must not run')};const res={setHeader(){},status(n){this.code=n;return this},json(v){this.body=v;return this}};
 await handler({method:'POST',headers:{'x-solve-api-key':'sk-personal-example','x-solve-provider':'openai'},body:{}},res);assert.equal(res.code,403);assert.match(res.body.error,/not supported/);assert.equal(calls,0);
});
