System.register(["./p-4a14b061.system.js"],(function(n){"use strict";var t,e;return{setters:[function(n){t=n.g;e=n.s}],execute:function(){var r=n("g",(function(n){return o(n)}));var i=n("a",(function(n,t){if(typeof n==="string"){t=n;n=undefined}return r(n).includes(t)}));var o=function(n){if(n===void 0){n=window}if(typeof n==="undefined"){return[]}n.Ionic=n.Ionic||{};var t=n.Ionic.platforms;if(t==null){t=n.Ionic.platforms=a(n);t.forEach((function(t){return n.document.documentElement.classList.add("plt-"+t)}))}return t};var a=function(n){return Object.keys(M).filter((function(t){return M[t](n)}))};var u=function(n){return p(n)&&!h(n)};var c=function(n){if(N(n,/iPad/i)){return true}if(N(n,/Macintosh/i)&&p(n)){return true}return false};var s=function(n){return N(n,/iPhone/i)};var f=function(n){return N(n,/iPhone|iPod/i)||c(n)};var v=function(n){return N(n,/android|sink/i)};var d=function(n){return v(n)&&!N(n,/mobile/i)};var m=function(n){var t=n.innerWidth;var e=n.innerHeight;var r=Math.min(t,e);var i=Math.max(t,e);return r>390&&r<520&&(i>620&&i<800)};var l=function(n){var t=n.innerWidth;var e=n.innerHeight;var r=Math.min(t,e);var i=Math.max(t,e);return c(n)||d(n)||r>460&&r<820&&(i>780&&i<1400)};var p=function(n){return O(n,"(any-pointer:coarse)")};var g=function(n){return!p(n)};var h=function(n){return b(n)||y(n)};var b=function(n){return!!(n["cordova"]||n["phonegap"]||n["PhoneGap"])};var y=function(n){var t=n["Capacitor"];return!!(t&&t.isNative)};var w=function(n){return N(n,/electron/i)};var I=function(n){return!!(n.matchMedia("(display-mode: standalone)").matches||n.navigator.standalone)};var N=function(n,t){return t.test(n.navigator.userAgent)};var O=function(n,t){return n.matchMedia(t).matches};var M={ipad:c,iphone:s,ios:f,android:v,phablet:m,tablet:l,cordova:b,capacitor:y,electron:w,pwa:I,mobile:p,mobileweb:u,desktop:g,hybrid:h};var j=function(){function n(){this.m=new Map}n.prototype.reset=function(n){this.m=new Map(Object.entries(n))};n.prototype.get=function(n,t){var e=this.m.get(n);return e!==undefined?e:t};n.prototype.getBoolean=function(n,t){if(t===void 0){t=false}var e=this.m.get(n);if(e===undefined){return t}if(typeof e==="string"){return e==="true"}return!!e};n.prototype.getNumber=function(n,t){var e=parseFloat(this.m.get(n));return isNaN(e)?t!==undefined?t:NaN:e};n.prototype.set=function(n,t){this.m.set(n,t)};return n}();var E=n("c",new j);var C=function(n){try{var t=n.sessionStorage.getItem(k);return t!==null?JSON.parse(t):{}}catch(e){return{}}};var P=function(n,t){try{n.sessionStorage.setItem(k,JSON.stringify(t))}catch(e){return}};var S=function(n){var t={};n.location.search.slice(1).split("&").map((function(n){return n.split("=")})).map((function(n){var t=n[0],e=n[1];return[decodeURIComponent(t),decodeURIComponent(e)]})).filter((function(n){var t=n[0];return x(t,A)})).map((function(n){var t=n[0],e=n[1];return[t.slice(A.length),e]})).forEach((function(n){var e=n[0],r=n[1];t[e]=r}));return t};var x=function(n,t){return n.substr(0,t.length)===t};var A="ionic:";var k="ionic-persist-config";var B;var W=n("b",(function(n){return n&&t(n)||B}));var H=n("i",(function(n){if(n===void 0){n={}}if(typeof window==="undefined"){return}var t=window.document;var r=window;var a=r.Ionic=r.Ionic||{};o(r);var u=Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},C(r)),{persistConfig:false}),a.config),S(r)),n);E.reset(u);if(E.getBoolean("persistConfig")){P(r,u)}a.config=E;a.mode=B=E.get("mode",t.documentElement.getAttribute("mode")||(i(r,"ios")?"ios":"md"));E.set("mode",B);t.documentElement.setAttribute("mode",B);t.documentElement.classList.add(B);if(E.getBoolean("_testing")){E.set("animated",false)}var c=function(n){return n.tagName&&n.tagName.startsWith("ION-")};var s=function(n){return["ios","md"].includes(n)};e((function(n){while(n){var t=n.mode||n.getAttribute("mode");if(t){if(s(t)){return t}else if(c(n)){console.warn('Invalid ionic mode: "'+t+'", expected: "ios" or "md"')}}n=n.parentElement}return B}))}))}}}));