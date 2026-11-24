import {test} from 'node:test';import assert from 'node:assert/strict';import {regions,plans,score,filterListings,demo} from '../src/core.js';
test('14 régions, packs et tarifs',()=>{assert.equal(regions.length,14);assert.deepEqual(plans.essential,{price:100000,users:1,regions:7,runs:2});assert.equal(plans.pro.price,250000)});
test('filtrage Essential exclut les projets et zones non autorisées',()=>{const r=filterListings(demo,'essential',['Dakar']);assert.ok(r.length);assert.ok(r.every(a=>a.region==='Dakar'&&a.kind==='immobilier'));});
test('Pro voit les projets et recherche par texte',()=>{assert.equal(filterListings(demo,'pro',regions).length,demo.length);assert.equal(filterListings(demo,'pro',regions,'hôtelier').length,1)});
test('score borné',()=>{assert.ok(demo.every(a=>score(a)>=0&&score(a)<=100))});
