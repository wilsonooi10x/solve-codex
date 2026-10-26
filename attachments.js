/* Read Office text locally; send PDFs and pictures as native AI inputs. Originals stay in memory only. */
window.SolveAttachments={async read(file){
 const name=file.name.slice(0,160),ext=name.split('.').pop().toLowerCase();
 if(file.size>2*1024*1024)throw Error(`${name}: maximum file size is 2 MB.`);
 const bytes=new Uint8Array(await file.arrayBuffer());
 const mime={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'}[ext];
 if(mime){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return {name,mime,data:btoa(binary),size:file.size}}
 let text='';
 if(['txt','csv'].includes(ext))text=new TextDecoder().decode(bytes);
 else if(['docx','xlsx','pptx'].includes(ext)){
  let expanded=0,count=0;const files=fflate.unzipSync(bytes,{filter:entry=>{if(++count>1500||(expanded+=entry.originalSize)>12*1024*1024)throw Error('Office file expands beyond the reading limit. Export the relevant pages as PDF.');return /^(word\/document|xl\/(sharedStrings|worksheets\/sheet\d+)|ppt\/slides\/slide\d+)\.xml$/.test(entry.name)}});
  const xml=path=>{const doc=new DOMParser().parseFromString(new TextDecoder().decode(files[path]),'application/xml');if(doc.querySelector('parsererror'))throw Error('Unreadable Office XML. Export this file as PDF.');return doc};
  const elements=(doc,tag)=>Array.from(doc.getElementsByTagNameNS('*',tag));
  const strings=files['xl/sharedStrings.xml']?elements(xml('xl/sharedStrings.xml'),'si').map(si=>elements(si,'t').map(t=>t.textContent).join('')):[];
  for(const path of Object.keys(files).filter(p=>p!=='xl/sharedStrings.xml').sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))){
   const doc=xml(path);text+='\n['+path+']\n';
   if(ext==='xlsx')text+=elements(doc,'row').map(row=>elements(row,'c').map(cell=>{const v=elements(cell,'v')[0]?.textContent||'';return `${cell.getAttribute('r')}: ${cell.getAttribute('t')==='s'?strings[Number(v)]||'':cell.getAttribute('t')==='inlineStr'?elements(cell,'t').map(t=>t.textContent).join(''):v}`}).join('\t')).join('\n');
   else text+=elements(doc,'p').map(p=>elements(p,'t').map(t=>t.textContent).join('')).join('\n');
  }
 }else throw Error('Use PDF, DOCX, XLSX, PPTX, CSV, TXT, PNG, JPG or WebP. Export older DOC/XLS/PPT files as PDF.');
 if(!text.trim())throw Error(`${name}: no readable text found. Try a PDF or picture.`);
 if(text.length>20000)throw Error(`${name}: too much text. Attach only the relevant pages, slides or rows.`);
 return {name,mime:'text/plain',text,size:file.size};
}};
