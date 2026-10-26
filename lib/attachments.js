function validateAttachments(input){
 if(input===undefined)return [];
 if(!Array.isArray(input)||input.length>3)throw Error('Attach up to 3 files per answer.');
 let total=0,textTotal=0;
 return input.map(a=>{
  if(!a||typeof a.name!=='string'||!a.name||a.name.length>160)throw Error('Invalid attachment name.');
  if(a.mime==='text/plain'){
   if(typeof a.text!=='string'||!a.text.trim()||a.text.length>20000||(textTotal+=a.text.length)>40000)throw Error('Attached text is too large or empty. Use fewer pages or rows.');
   return {name:a.name,mime:a.mime,text:a.text};
  }
  if(!['application/pdf','image/png','image/jpeg','image/webp'].includes(a.mime)||typeof a.data!=='string'||!a.data.length||a.data.length>2800000||a.data.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(a.data))throw Error('Invalid attachment. Use a supported document or picture.');
  const bytes=Buffer.from(a.data,'base64');total+=bytes.length;if(total>2*1024*1024)throw Error('PDFs and pictures must total 2 MB or less per answer.');
  const valid=a.mime==='application/pdf'?bytes.subarray(0,5).toString()==='%PDF-':a.mime==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):a.mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!valid)throw Error('File content does not match its type. Please export it again.');
  return {name:a.name,mime:a.mime,data:a.data};
 });
}
module.exports={validateAttachments};
