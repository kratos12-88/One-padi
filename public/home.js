import {products,categories,productUrl} from './catalog.js';

const $=selector=>document.querySelector(selector);
const byId=Object.fromEntries(products.map(p=>[p.id,p]));
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let category='All products',search='';
let favorite=localStorage.getItem('onepadi-favorite');
let density=localStorage.getItem('onepadi-density')==='compact'?'compact':'comfortable';
let connected=false;
document.body.classList.toggle('compact-products',density==='compact');
const logo=p=>`<img src="${productUrl(p.id)}brand/logo.png" alt="" width="44" height="44" loading="lazy">`;
const link=p=>productUrl(p.id);

$('#year').textContent=new Date().getFullYear();
$('#today').textContent=new Date().toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'long'});
$('#side-products').innerHTML=products.map(p=>`<a href="${link(p)}" data-product="${p.id}"><span class="side-symbol" style="--product:${p.accent}">${logo(p)}</span>${p.name}<span class="outbound" aria-hidden="true">↗</span></a>`).join('');

function renderTabs(){
 $('#category-tabs').innerHTML=categories.map(c=>`<button type="button" data-filter="${c}" class="${category===c?'selected':''}" aria-pressed="${category===c}">${c}</button>`).join('');
}
function renderProducts(){
 const visible=products.filter(p=>(category==='All products'||p.category===category)&&`${p.name} ${p.tagline} ${p.kind} ${p.description} ${p.category}`.toLowerCase().includes(search));
 $('#product-count').textContent=`${visible.length.toString().padStart(2,'0')} / 10`;
 $('#no-results').hidden=visible.length>0;
 $('#product-grid').innerHTML=visible.map(p=>`<article class="product" style="--product:${p.accent}"><div class="product-head"><span>${p.icon} / ${p.category.toUpperCase()}</span><button type="button" class="favorite ${favorite===p.id?'saved':''}" data-favorite="${p.id}" aria-label="${favorite===p.id?'Remove '+p.name+' from quick access':'Add '+p.name+' to quick access'}" aria-pressed="${favorite===p.id}">${favorite===p.id?'★':'☆'}</button></div><div class="product-logo">${logo(p)}</div><div class="product-main"><span class="product-kind">${p.kind}</span><h3>${p.name}</h3><p>${p.description}</p></div><a class="product-bottom" href="${link(p)}" data-product="${p.id}"><span>${p.tagline}</span><strong>Open app ↗</strong></a></article>`).join('');
}
function renderContinue(){
 const ids=[favorite,localStorage.getItem('onepadi-last')].filter((id,i,all)=>byId[id]&&all.indexOf(id)===i);
 if(!ids.length){$('#continue').innerHTML='<p>Your recently opened and saved products will appear here. <a href="#products">Explore the collection →</a></p>';return}
 $('#continue').innerHTML=ids.map(id=>{const p=byId[id];return `<a class="continue-item" href="${link(p)}" data-product="${p.id}"><span class="continue-logo" style="--product:${p.accent}">${logo(p)}</span><span><small>${favorite===id?'QUICK ACCESS':'RECENTLY OPENED'}</small><strong>${p.name}</strong></span><b aria-hidden="true">↗</b></a>`}).join('');
}
renderTabs();renderProducts();renderContinue();
const guide={
 chowcart:['Share a bulk order','Filter food shares by category and area, choose how many shares you need, review the price and handling fee, then save your basket.'],
 pricepal:['Compare a complete basket','Set quantities for the same grocery list, compare each sample store total including delivery, and save a comparison.'],
 rentsmall:['Review the real move-in cost','Filter homes by area, open a property, compare monthly rent and other fees, then save a viewing preference.'],
 lightpadi:['Find a power option','Browse desk, charging and cold-storage options, choose hours and a date, then save a time-slot request.'],
 borrowbeta:['Borrow useful equipment','Choose equipment, rental days, start date and collection method. Review the rental rate plus refundable deposit before saving.'],
 waygo:['Plan a journey','Find a route and departure, choose seats and travel details, then save a journey request.'],
 workchop:['Find a local task','Browse tasks with clear budgets and scope, read the requirements, then save an application draft.'],
 sureplug:['Write down the deal','Create an item deal with agreed price, condition, delivery and inspection terms. Track the deal record through its stages.'],
 flipam:['Give an item another life','Browse preloved items and save an inspection request, or draft a listing with honest condition details.'],
 shoppadi:['Know your real gain','Record a sale, expense or customer debt. The ledger separates debts from sales and calculates profit after item costs.']
};
$('#guide-list').innerHTML=products.map((p,i)=>`<details class="guide-item"><summary><span class="guide-index">${String(i+1).padStart(2,'0')}</span><span class="guide-logo" style="--product:${p.accent}">${logo(p)}</span><span><strong>${p.name}</strong><small>${guide[p.id][0]}</small></span><b aria-hidden="true">＋</b></summary><div class="guide-content"><p>${guide[p.id][1]}</p><a href="${link(p)}" data-product="${p.id}">Open ${p.name} ↗</a><a href="${link(p)}#help" data-product="${p.id}">Read its help page →</a></div></details>`).join('');
const defaultSelect=$('#default-product');
defaultSelect.innerHTML+=[...products].sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
defaultSelect.value=favorite||'';
$('#display-density').value=density;
defaultSelect.addEventListener('change',event=>{favorite=event.target.value||null;if(favorite)localStorage.setItem('onepadi-favorite',favorite);else localStorage.removeItem('onepadi-favorite');renderProducts();renderContinue();$('#settings-saved').textContent=favorite?`${byId[favorite].name} is now in quick access.`:'Quick access preference cleared.'});
$('#display-density').addEventListener('change',event=>{density=event.target.value;localStorage.setItem('onepadi-density',density);document.body.classList.toggle('compact-products',density==='compact');$('#settings-saved').textContent=`${density==='compact'?'Compact':'Comfortable'} card spacing saved.`});
document.addEventListener('click',event=>{
 const filter=event.target.closest('[data-filter]');if(filter){category=filter.dataset.filter;renderTabs();renderProducts();return}
 const star=event.target.closest('[data-favorite]');if(star){favorite=favorite===star.dataset.favorite?null:star.dataset.favorite;if(favorite)localStorage.setItem('onepadi-favorite',favorite);else localStorage.removeItem('onepadi-favorite');defaultSelect.value=favorite||'';renderProducts();renderContinue();return}
 const open=event.target.closest('[data-product]');if(open){localStorage.setItem('onepadi-last',open.dataset.product)}
});
$('#search').addEventListener('input',event=>{search=event.target.value.trim().toLowerCase();renderProducts()});

const currency=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
async function getRecords(p){
 let server=[];try{const response=await fetch(`/api/records?app=${p.id}`,{credentials:'same-origin'});if(response.ok){connected=true;const data=await response.json();server=(Array.isArray(data.records)?data.records:[]).map(r=>({...r,product:p.id,storage:'server'}))}}catch{}
 let demo=[];try{const stored=JSON.parse(localStorage.getItem(`${p.id}-demo-v1`)||'[]');demo=(Array.isArray(stored)?stored:[]).map(r=>({...r,product:p.id,storage:'browser'}))}catch{}
 return [...server,...demo];
}
async function refreshActivity(){
 $('#refresh').disabled=true;$('#activity-list').innerHTML='<p class="activity-message">Checking your product workspaces…</p>';
 // Seed the shared signed session cookie before concurrent reads from the remaining apps.
 const first=await getRecords(products[0]);
 const groups=[first,...await Promise.all(products.slice(1).map(getRecords))];
 const records=groups.flat().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 $('#storage-summary').textContent=connected?'Connected workspace available · browser demo records are included too.':'Browser demo mode · records on this device only.';
 $('#active-products').textContent=groups.filter(g=>g.length).length;
 $('#total-records').textContent=records.length;
 $('#last-activity').textContent=records.length?new Date(records[0].createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short'}):'None yet';
 if(!records.length){$('#activity-list').innerHTML='<div class="activity-empty"><span aria-hidden="true">✳</span><div><strong>Your activity starts here.</strong><p>Open any product and save a sample request or record. It will show up across OnePadi.</p></div><a href="#products">Find a product ↗</a></div>'}
 else $('#activity-list').innerHTML=records.slice(0,8).map(r=>{const p=byId[r.product];return `<a class="activity-row" href="${link(p)}#records" data-product="${p.id}"><span class="activity-icon" style="--product:${p.accent}">${logo(p)}</span><span class="activity-title"><strong>${escapeHtml(r.title)}</strong><small>${p.name} · ${escapeHtml(r.status)} · ${r.storage==='browser'?'Browser demo':'Private workspace'}</small></span><span class="activity-value">${currency(Number(r.total)||0)}<small>${new Date(r.createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</small></span><span class="activity-arrow" aria-hidden="true">↗</span></a>`}).join('');
 $('#refresh').disabled=false;
}
$('#refresh').addEventListener('click',refreshActivity);
$('#export-all').addEventListener('click',async()=>{
 const button=$('#export-all');button.disabled=true;$('#export-status').textContent='Collecting records…';
 try{
  const first=await getRecords(products[0]);const groups=[first,...await Promise.all(products.slice(1).map(getRecords))];
  const payload={product:'OnePadi',exportedAt:new Date().toISOString(),records:groups.flat()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`onepadi-records-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#export-status').textContent=`Downloaded ${payload.records.length} record${payload.records.length===1?'':'s'}.`;
 }catch{$('#export-status').textContent='Could not prepare the file. Please try again.'}finally{button.disabled=false}
});
refreshActivity();
