/* Read the participant list locally. Importing never approves accounts or calls AI. */
(function(root){
 const valid=value=>/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(value);
 function parse(text){const emails=[],invalid=[],seen=new Set();let duplicates=0;for(const raw of String(text).replace(/^\uFEFF/,'').split(/[\s,;<>"()]+/)){const value=raw.trim().toLowerCase();if(!value.includes('@'))continue;if(!valid(value)){invalid.push(raw);continue}if(seen.has(value)){duplicates++;continue}seen.add(value);emails.push(value)}return {emails,duplicates,invalid}}
 async function read(file,existing=''){
  if(!/\.(xlsx|csv|txt)$/i.test(file.name))throw Error('Choose an Excel .xlsx, CSV or TXT file. For older .xls files, save as .xlsx or CSV first.');
  const data=await root.SolveAttachments.read(file,{maxText:100000});const imported=parse(data.text);
  if(imported.invalid.length)throw Error('Check these email entries in the file: '+imported.invalid.slice(0,5).join(', ')+'. Your existing list has not changed.');
  if(!imported.emails.length)throw Error('No email addresses found. Include an Email column with the registered sign-in addresses.');
  const prior=parse(existing);if(prior.invalid.length)throw Error('Correct the invalid emails already in the box before importing.');
  const combined=parse([...prior.emails,...imported.emails].join('\n'));
  if(combined.emails.length>300)throw Error('This would exceed 300 unique emails. Split the list into batches of up to 300.');
  if(combined.emails.join('\n').length>20000)throw Error('This list is too long for one approval. Split it into smaller batches.');
  return {...combined,added:combined.emails.length-prior.emails.length,duplicates:imported.duplicates+combined.duplicates};
 }
 root.SolveParticipantImport={parse,read};
})(window);
