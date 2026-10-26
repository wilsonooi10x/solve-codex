// Dependency-free static build, shared by local checks and Vercel.
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const output=path.join(root,'public');
fs.mkdirSync(path.join(output,'assets','vendor'),{recursive:true});
for(const file of ['index.html','app.js','style.css','workflow.js','guided.js','questions.js','attachments.js','sync.js','onboarding.js','case-report.js','manifest.webmanifest']){
 fs.copyFileSync(path.join(root,file),path.join(output,file));
}
for(const file of fs.readdirSync(path.join(root,'assets')).filter(name=>name.endsWith('.png'))){
 fs.copyFileSync(path.join(root,'assets',file),path.join(output,'assets',file));
}
for(const file of fs.readdirSync(path.join(root,'assets','vendor'))){
 fs.copyFileSync(path.join(root,'assets','vendor',file),path.join(output,'assets','vendor',file));
}
console.log('SOLVE static build ready in public/');
