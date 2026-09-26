import fs from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const ids=['chowcart','rentsmall','waygo','sureplug','workchop','lightpadi','pricepal','flipam','shoppadi','borrowbeta'];
await fs.rm(path.join(root,'dist'),{recursive:true,force:true});
await fs.cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
for(const id of ids){
  const target=path.join(root,'dist/apps',id);
  await fs.cp(path.join(root,'apps',id,'public'),target,{recursive:true});
  let html=await fs.readFile(path.join(target,'index.html'),'utf8');
  html=html.replaceAll('href="/brand/','href="/apps/'+id+'/brand/').replace('href="/style.css"','href="/apps/'+id+'/style.css"').replace('src="/app.js"','src="/apps/'+id+'/app.js"');
  html=html.replace('</head>','<link rel="stylesheet" href="/ecosystem.css"></head>');
  html=html.replace('<body>','<body><div id="onepadi-root" data-app="'+id+'"></div><script type="module" src="/ecosystem.js"></script>');
  await fs.writeFile(path.join(target,'index.html'),html);
  let js=await fs.readFile(path.join(target,'app.js'),'utf8');
  js=js.replaceAll("fetch('/api/records'","fetch('/api/records?app="+id+"'").replaceAll('src="/brand/logo.png"','src="/apps/'+id+'/brand/logo.png"');
  await fs.writeFile(path.join(target,'app.js'),js);
}
console.log('Built OnePadi portal and ten full product apps under /apps/.');
