import {products,productUrl} from './catalog.js';
const host=document.querySelector('#onepadi-root');
if(host){
 const current=host.dataset.app;
 const product=products.find(p=>p.id===current);
 host.innerHTML=`<div class="onepadi-bar"><a class="onepadi-home" href="/" aria-label="OnePadi ecosystem home"><span class="onepadi-mark">●<i>↗</i></span><strong>onepadi</strong><span class="onepadi-slash">/</span><span class="onepadi-current">${product?.name??'Products'}</span></a><div class="onepadi-actions"><span>YOUR EVERYDAY, TOGETHER</span><details class="onepadi-menu"><summary>Switch product <b aria-hidden="true">⌄</b></summary><div class="onepadi-popup"><a class="onepadi-overview" href="/">← Ecosystem overview</a><div class="onepadi-list">${products.map(p=>`<a href="${productUrl(p.id)}" ${p.id===current?'aria-current="page"':''}><img src="${productUrl(p.id)}brand/logo.png" alt="" width="27" height="27">${p.name}<small>${p.kind}</small></a>`).join('')}</div></div></details></div></div>`;
 document.addEventListener('click',e=>{const a=e.target.closest('.onepadi-list a');if(a)localStorage.setItem('onepadi-last',a.href.split('/').filter(Boolean).pop())});
}
