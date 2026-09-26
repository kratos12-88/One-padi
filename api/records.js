// A single public endpoint dispatches to the unchanged, server-validated product handlers.
import chowcart from '../apps/chowcart/api/records.js';
import rentsmall from '../apps/rentsmall/api/records.js';
import waygo from '../apps/waygo/api/records.js';
import sureplug from '../apps/sureplug/api/records.js';
import workchop from '../apps/workchop/api/records.js';
import lightpadi from '../apps/lightpadi/api/records.js';
import pricepal from '../apps/pricepal/api/records.js';
import flipam from '../apps/flipam/api/records.js';
import shoppadi from '../apps/shoppadi/api/records.js';
import borrowbeta from '../apps/borrowbeta/api/records.js';

const handlers = Object.freeze({chowcart,rentsmall,waygo,sureplug,workchop,lightpadi,pricepal,flipam,shoppadi,borrowbeta});
export default function handler(req,res){
  const url = new URL(req.url,'http://localhost');
  const app = url.searchParams.get('app');
  if(!Object.hasOwn(handlers,app)){
    res.statusCode=404;res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({error:'Unknown product'}));return;
  }
  return handlers[app](req,res);
}
