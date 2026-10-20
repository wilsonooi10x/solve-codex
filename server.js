const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{if(req.url.split('?')[0]==='/api/assist'){res.status=n=>{res.statusCode=n;return res};res.json=v=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(v))};let data='';for await(const chunk of req){data+=chunk;if(data.length>30000)return res.status(413).json({error:'Request too large'})}try{req.body=JSON.parse(data)}catch{req.body=null}return require('./api/assist')(req,res)}const file=files[req.url.split('?')[0]];if(!file){res.writeHead(404);return res.end('Not found');} res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');fs.createReadStream(path.join(__dirname,file)).pipe(res);}).listen(process.env.PORT || 3000,'0.0.0.0');
