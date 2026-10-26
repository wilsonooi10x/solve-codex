/* Shared question formatting keeps displayed numbers aligned with AI context and reports. */
(function(root){
 function parts(value){
  const text=String(value||'').trim();if(!text)return [];
  // Explicit numbered lists take precedence, including inline lists from older turns.
  const numbered=text.split(/(?:^|\s)(?:\d{1,2})[.)]\s+/).map(s=>s.trim()).filter(Boolean);
  if(/(?:^|\s)1[.)]\s+/.test(text)&&numbered.length>1){if(!/^1[.)]\s+/.test(text)){const intro=numbered.shift();numbered[0]=intro+' '+numbered[0]}return numbered;}
  const questions=text.match(/[^?？]+[?？]+(?:["”'])?|[^?？]+$/g)?.map(s=>s.trim()).filter(Boolean)||[text];
  // A trailing explanatory sentence belongs with the final question.
  if(questions.length>1&&!/[?？]/.test(questions.at(-1)))questions[questions.length-2]+=' '+questions.pop();
  return questions;
 }
 function format(value){const items=Array.isArray(value)?value.filter(v=>typeof v==='string'&&v.trim()).map(v=>v.trim().replace(/^\d+[.)]\s+/,'')):parts(value);return items.length>1?items.map((q,i)=>`${i+1}. ${q}`).join('\n'):items[0]||''}
 const api={parts,format};if(typeof module==='object'&&module.exports)module.exports=api;else root.SolveQuestions=api;
})(typeof window==='object'?window:globalThis);
