if(!self.define){let e,t={};const n=(n,i)=>(n=new URL(n+".js",i).href,t[n]||new Promise((t=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=t,document.head.appendChild(e)}else e=n,importScripts(n),t()})).then((()=>{let e=t[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(t[o])return;let s={};const d=e=>n(e,o),l={module:{uri:o},exports:s,require:d};t[o]=Promise.all(i.map((e=>l[e]||d(e)))).then((e=>(r(...e),s)))}}define(["./workbox-460519b3"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"bundleed3f362a29251a448b3a.js",revision:null},{url:"bundleed3f362a29251a448b3a.js.LICENSE.txt",revision:"4e0e34f265fae8f33b01b27ae29d9d6f"},{url:"index.html",revision:"5148823b3a54d5db3641882dce3a6263"}],{})}));
//# sourceMappingURL=service-worker.js.map
