import {products,categories,productUrl} from './catalog.js';

const $=selector=>document.querySelector(selector);
const byId=Object.fromEntries(products.map(p=>[p.id,p]));
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let category='All products',search='';
let favorite=localStorage.getItem('onepadi-favorite');
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
document.addEventListener('click',event=>{
 const filter=event.target.closest('[data-filter]');if(filter){category=filter.dataset.filter;renderTabs();renderProducts();return}
 const star=event.target.closest('[data-favorite]');if(star){favorite=favorite===star.dataset.favorite?null:star.dataset.favorite;if(favorite)localStorage.setItem('onepadi-favorite',favorite);else localStorage.removeItem('onepadi-favorite');renderProducts();renderContinue();return}
 const open=event.target.closest('[data-product]');if(open){localStorage.setItem('onepadi-last',open.dataset.product)}
});
$('#search').addEventListener('input',event=>{search=event.target.value.trim().toLowerCase();renderProducts()});

const currency=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
async function getRecords(p){
 try{const response=await fetch(`/api/records?app=${p.id}`,{credentials:'same-origin'});if(response.ok){const data=await response.json();return (Array.isArray(data.records)?data.records:[]).map(r=>({...r,product:p.id}))}}catch{}
 try{const stored=JSON.parse(localStorage.getItem(`${p.id}-demo-v1`)||'[]');return (Array.isArray(stored)?stored:[]).map(r=>({...r,product:p.id}))}catch{return []}
}
async function refreshActivity(){
 $('#refresh').disabled=true;$('#activity-list').innerHTML='<p class="activity-message">Checking your product workspaces…</p>';
 // Seed the shared signed session cookie before concurrent reads from the remaining apps.
 const first=await getRecords(products[0]);
 const groups=[first,...await Promise.all(products.slice(1).map(getRecords))];
 const records=groups.flat().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 $('#active-products').textContent=groups.filter(g=>g.length).length;
 $('#total-records').textContent=records.length;
 $('#last-activity').textContent=records.length?new Date(records[0].createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short'}):'None yet';
 if(!records.length){$('#activity-list').innerHTML='<div class="activity-empty"><span aria-hidden="true">✳</span><div><strong>Your activity starts here.</strong><p>Open any product and save a sample request or record. It will show up across OnePadi.</p></div><a href="#products">Find a product ↗</a></div>'}
 else $('#activity-list').innerHTML=records.slice(0,8).map(r=>{const p=byId[r.product];return `<a class="activity-row" href="${link(p)}#records" data-product="${p.id}"><span class="activity-icon" style="--product:${p.accent}">${logo(p)}</span><span class="activity-title"><strong>${escapeHtml(r.title)}</strong><small>${p.name} · ${escapeHtml(r.status)}</small></span><span class="activity-value">${currency(Number(r.total)||0)}<small>${new Date(r.createdAt).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</small></span><span class="activity-arrow" aria-hidden="true">↗</span></a>`}).join('');
 $('#refresh').disabled=false;
}
$('#refresh').addEventListener('click',refreshActivity);
refreshActivity();
