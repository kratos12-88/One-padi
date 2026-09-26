import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import handler from './api/records.js';

const root=path.resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
await fs.access(path.join(root,'index.html')).catch(()=>{throw Error('Run npm run build before npm start')});
http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/api/records')return handler(req,res);
  try{
    const normalized=pathname==='/'?'/index.html':pathname;
    const resolved=/^\/apps\/[a-z]+\/?$/.test(normalized)?normalized.replace(/\/$/,'')+'/index.html':normalized;
    const file=path.resolve(root,'.'+decodeURIComponent(resolved));
    if(!file.startsWith(root+path.sep))throw Error();
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.end(await fs.readFile(file));
  }catch{res.statusCode=404;res.end('Not found')}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log(`OnePadi ready on port ${process.env.PORT||3000}`));
