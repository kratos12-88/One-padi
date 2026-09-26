import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const cwd=path.resolve(import.meta.dirname,'..');
const ids=['chowcart','rentsmall','waygo','sureplug','workchop','lightpadi','pricepal','flipam','shoppadi','borrowbeta'];
const availablePort=()=>new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});

test('all ten apps and product APIs run in one origin with isolated records',async t=>{
 const port=await availablePort();const dir=await fs.mkdtemp(path.join(os.tmpdir(),'onepadi-'));
 const server=spawn(process.execPath,['server.mjs'],{cwd,env:{...process.env,PORT:String(port),DB_PATH:path.join(dir,'data.sqlite')},stdio:'pipe'});
 t.after(async()=>{server.kill();await fs.rm(dir,{recursive:true,force:true})});
 const base=`http://127.0.0.1:${port}`;
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,40))}
 assert.ok(ready,'server should start');
 const home=await (await fetch(base)).text();assert.match(home,/Ten products/i);assert.match(home,/onepadi/i);
 let cookie='';
 for(const id of ids){
  const html=await (await fetch(`${base}/apps/${id}/`)).text();
  assert.match(html,new RegExp(`/apps/${id}/app\\.js`));
  assert.match(html,/ecosystem\.js/);
  const script=await (await fetch(`${base}/apps/${id}/app.js`)).text();
  assert.ok(script.includes(`/api/records?app=${id}`));
  const logo=await fetch(`${base}/apps/${id}/brand/logo.png`);assert.equal(logo.status,200);
  const result=await fetch(`${base}/api/records?app=${id}`,{headers:cookie?{cookie}:{}});
  assert.equal(result.status,200,id);
  cookie||=result.headers.get('set-cookie')?.split(';')[0]||'';
  assert.deepEqual((await result.json()).records,[]);
 }
 const one=await fetch(`${base}/api/records?app=borrowbeta`,{method:'POST',headers:{cookie,'content-type':'application/json'},body:JSON.stringify({itemId:'drill',quantity:2,details:{date:new Date(Date.now()+86400000).toISOString().slice(0,10),pickup:'Collect from provider'}})});
 assert.equal(one.status,201);assert.equal((await one.json()).record.total,22000);
 const two=await fetch(`${base}/api/records?app=chowcart`,{method:'POST',headers:{cookie,'content-type':'application/json'},body:JSON.stringify({itemId:'rice',quantity:1,details:{}})});
 assert.equal(two.status,201);
 const borrow=await (await fetch(`${base}/api/records?app=borrowbeta`,{headers:{cookie}})).json();
 const chow=await (await fetch(`${base}/api/records?app=chowcart`,{headers:{cookie}})).json();
 assert.equal(borrow.records.length,1);assert.equal(chow.records.length,1);
 assert.equal(borrow.records[0].app,'borrowbeta');assert.equal(chow.records[0].app,'chowcart');
 const unknown=await fetch(`${base}/api/records?app=__proto__`);assert.equal(unknown.status,404);
});
