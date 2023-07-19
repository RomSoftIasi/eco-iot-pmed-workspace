var __awaiter=this&&this.__awaiter||function(e,r,t,n){function i(e){return e instanceof t?e:new t((function(r){r(e)}))}return new(t||(t=Promise))((function(t,s){function o(e){try{f(n.next(e))}catch(r){s(r)}}function a(e){try{f(n["throw"](e))}catch(r){s(r)}}function f(e){e.done?t(e.value):i(e.value).then(o,a)}f((n=n.apply(e,r||[])).next())}))};var __generator=this&&this.__generator||function(e,r){var t={label:0,sent:function(){if(s[0]&1)throw s[1];return s[1]},trys:[],ops:[]},n,i,s,o;return o={next:a(0),throw:a(1),return:a(2)},typeof Symbol==="function"&&(o[Symbol.iterator]=function(){return this}),o;function a(e){return function(r){return f([e,r])}}function f(o){if(n)throw new TypeError("Generator is already executing.");while(t)try{if(n=1,i&&(s=o[0]&2?i["return"]:o[0]?i["throw"]||((s=i["return"])&&s.call(i),0):i.next)&&!(s=s.call(i,o[1])).done)return s;if(i=0,s)o=[o[0]&2,s.value];switch(o[0]){case 0:case 1:s=o;break;case 4:t.label++;return{value:o[1],done:false};case 5:t.label++;i=o[1];o=[0];continue;case 7:o=t.ops.pop();t.trys.pop();continue;default:if(!(s=t.trys,s=s.length>0&&s[s.length-1])&&(o[0]===6||o[0]===2)){t=0;continue}if(o[0]===3&&(!s||o[1]>s[0]&&o[1]<s[3])){t.label=o[1];break}if(o[0]===6&&t.label<s[1]){t.label=s[1];s=o;break}if(s&&t.label<s[2]){t.label=s[2];t.ops.push(o);break}if(s[2])t.ops.pop();t.trys.pop();continue}o=r.call(e,t)}catch(a){o=[6,a];i=0}finally{n=s=0}if(o[0]&5)throw o[1];return{value:o[0]?o[1]:void 0,done:true}}};System.register(["./p-4a14b061.system.js","./p-43078e70.system.js","./p-0b5de7fa.system.js","./p-ff3c9f7a.system.js","./p-5d689c29.system.js","./p-ce1ea776.system.js","./p-1c52a3ad.system.js","./p-b9b6f1c7.system.js"],(function(e,r){"use strict";var t,n,i,s,o,a,f,l,h,c,u,p,d,g,m,v,y,b,w;return{setters:[function(e){t=e.c;n=e.r;i=e.e;s=e.f;o=e.h;a=e.i;f=e.H},function(e){l=e.a;h=e.b;c=e.c},function(e){u=e.g},function(e){p=e.c;d=e.j;g=e.g;m=e.r},function(e){v=e.d},function(e){y=e.c},function(e){b=e.s},function(e){w=e.S}],execute:function(){var x=this;var k=function(e){var r=e.previousElementSibling;var t=r!==null&&r.tagName==="ION-HEADER";return t?"translate":"scale"};var S=function(e,r,t){return e==="scale"?_(r,t):R(r,t)};var E=function(e){var r=e.querySelector("ion-spinner");var t=r.shadowRoot.querySelector("circle");var n=e.querySelector(".spinner-arrow-container");var i=e.querySelector(".arrow-container");var s=i?i.querySelector("ion-icon"):null;var o=y().duration(1e3).easing("ease-out");var a=y().addElement(n).keyframes([{offset:0,opacity:"0.3"},{offset:.45,opacity:"0.3"},{offset:.55,opacity:"1"},{offset:1,opacity:"1"}]);var f=y().addElement(t).keyframes([{offset:0,strokeDasharray:"1px, 200px"},{offset:.2,strokeDasharray:"1px, 200px"},{offset:.55,strokeDasharray:"100px, 200px"},{offset:1,strokeDasharray:"100px, 200px"}]);var l=y().addElement(r).keyframes([{offset:0,transform:"rotate(-90deg)"},{offset:1,transform:"rotate(210deg)"}]);if(i&&s){var h=y().addElement(i).keyframes([{offset:0,transform:"rotate(0deg)"},{offset:.3,transform:"rotate(0deg)"},{offset:.55,transform:"rotate(280deg)"},{offset:1,transform:"rotate(400deg)"}]);var c=y().addElement(s).keyframes([{offset:0,transform:"translateX(2px) scale(0)"},{offset:.3,transform:"translateX(2px) scale(0)"},{offset:.55,transform:"translateX(-1.5px) scale(1)"},{offset:1,transform:"translateX(-1.5px) scale(1)"}]);o.addAnimation([h,c])}return o.addAnimation([a,f,l])};var _=function(e,r){var t=r.clientHeight;var n=y().addElement(e).keyframes([{offset:0,transform:"scale(0) translateY(-"+t+"px)"},{offset:1,transform:"scale(1) translateY(100px)"}]);return E(e).addAnimation([n])};var R=function(e,r){var t=r.clientHeight;var n=y().addElement(e).keyframes([{offset:0,transform:"translateY(-"+t+"px)"},{offset:1,transform:"translateY(100px)"}]);return E(e).addAnimation([n])};var P=function(e){return y().duration(125).addElement(e).fromTo("transform","translateY(var(--ion-pulling-refresher-translate, 100px))","translateY(0px)")};var T=function(e,r){e.style.setProperty("opacity",r.toString())};var C=function(e,r,n,i){t((function(){T(e,n);r.forEach((function(e,r){return e.style.setProperty("opacity",r<=i?"0.99":"0")}))}))};var D=function(e,r){t((function(){e.style.setProperty("--refreshing-rotation-duration",r>=1?"0.5s":"2s");e.style.setProperty("opacity","1")}))};var N=function(e,r){if(!e){return Promise.resolve()}var n=j(e,200);t((function(){e.style.setProperty("transition","0.2s all ease-out");if(r===undefined){e.style.removeProperty("transform")}else{e.style.setProperty("transform","translate3d(0px, "+r+", 0px)")}}));return n};var M=function(e,r){return __awaiter(x,void 0,void 0,(function(){var t,n,i;return __generator(this,(function(s){switch(s.label){case 0:t=e.querySelector("ion-refresher-content");if(!t){return[2,Promise.resolve(false)]}return[4,new Promise((function(e){return p(t,e)}))];case 1:s.sent();n=e.querySelector("ion-refresher-content .refresher-pulling ion-spinner");i=e.querySelector("ion-refresher-content .refresher-refreshing ion-spinner");return[2,n!==null&&i!==null&&(r==="ios"&&l("mobile")&&e.style.webkitOverflowScrolling!==undefined||r==="md")]}}))}))};var j=function(e,r){if(r===void 0){r=0}return new Promise((function(t){q(e,r,t)}))};var q=function(e,r,t){if(r===void 0){r=0}var n;var i;var s={passive:true};var o=500;var a=function(){if(n){n()}};var f=function(r){if(r===undefined||e===r.target){a();t(r)}};if(e){e.addEventListener("webkitTransitionEnd",f,s);e.addEventListener("transitionend",f,s);i=setTimeout(f,r+o);n=function(){if(i){clearTimeout(i);i=undefined}e.removeEventListener("webkitTransitionEnd",f,s);e.removeEventListener("transitionend",f,s)}}return a};var Y="ion-refresher{left:0;top:0;display:none;position:absolute;width:100%;height:60px;pointer-events:none;z-index:-1}[dir=rtl] ion-refresher,:host-context([dir=rtl]) ion-refresher{left:unset;right:unset;right:0}ion-refresher.refresher-active{display:block}ion-refresher-content{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center;height:100%}.refresher-pulling,.refresher-refreshing{display:none;width:100%}.refresher-pulling-icon,.refresher-refreshing-icon{-webkit-transform-origin:center;transform-origin:center;-webkit-transition:200ms;transition:200ms;font-size:30px;text-align:center}[dir=rtl] .refresher-pulling-icon,:host-context([dir=rtl]) .refresher-pulling-icon,[dir=rtl] .refresher-refreshing-icon,:host-context([dir=rtl]) .refresher-refreshing-icon{-webkit-transform-origin:calc(100% - center);transform-origin:calc(100% - center)}.refresher-pulling-text,.refresher-refreshing-text{font-size:16px;text-align:center}ion-refresher-content .arrow-container{display:none}.refresher-pulling ion-refresher-content .refresher-pulling{display:block}.refresher-ready ion-refresher-content .refresher-pulling{display:block}.refresher-ready ion-refresher-content .refresher-pulling-icon{-webkit-transform:rotate(180deg);transform:rotate(180deg)}.refresher-refreshing ion-refresher-content .refresher-refreshing{display:block}.refresher-cancelling ion-refresher-content .refresher-pulling{display:block}.refresher-cancelling ion-refresher-content .refresher-pulling-icon{-webkit-transform:scale(0);transform:scale(0)}.refresher-completing ion-refresher-content .refresher-refreshing{display:block}.refresher-completing ion-refresher-content .refresher-refreshing-icon{-webkit-transform:scale(0);transform:scale(0)}.refresher-native .refresher-pulling-text,.refresher-native .refresher-refreshing-text{display:none}.refresher-ios .refresher-pulling-icon,.refresher-ios .refresher-refreshing-icon{color:var(--ion-text-color, #000)}.refresher-ios .refresher-pulling-text,.refresher-ios .refresher-refreshing-text{color:var(--ion-text-color, #000)}.refresher-ios .refresher-refreshing .spinner-lines-ios line,.refresher-ios .refresher-refreshing .spinner-lines-small-ios line,.refresher-ios .refresher-refreshing .spinner-crescent circle{stroke:var(--ion-text-color, #000)}.refresher-ios .refresher-refreshing .spinner-bubbles circle,.refresher-ios .refresher-refreshing .spinner-circles circle,.refresher-ios .refresher-refreshing .spinner-dots circle{fill:var(--ion-text-color, #000)}ion-refresher.refresher-native{display:block;z-index:1}ion-refresher.refresher-native ion-spinner{margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){ion-refresher.refresher-native ion-spinner{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}.refresher-native .refresher-refreshing ion-spinner{--refreshing-rotation-duration:2s;display:none;-webkit-animation:var(--refreshing-rotation-duration) ease-out refresher-rotate forwards;animation:var(--refreshing-rotation-duration) ease-out refresher-rotate forwards}.refresher-native .refresher-refreshing{display:none;-webkit-animation:250ms linear refresher-pop forwards;animation:250ms linear refresher-pop forwards}.refresher-native.refresher-refreshing .refresher-pulling ion-spinner,.refresher-native.refresher-completing .refresher-pulling ion-spinner{display:none}.refresher-native.refresher-refreshing .refresher-refreshing ion-spinner,.refresher-native.refresher-completing .refresher-refreshing ion-spinner{display:block}.refresher-native.refresher-pulling .refresher-pulling ion-spinner{display:block}.refresher-native.refresher-pulling .refresher-refreshing ion-spinner{display:none}@-webkit-keyframes refresher-pop{0%{-webkit-transform:scale(1);transform:scale(1);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}50%{-webkit-transform:scale(1.2);transform:scale(1.2);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}100%{-webkit-transform:scale(1);transform:scale(1)}}@keyframes refresher-pop{0%{-webkit-transform:scale(1);transform:scale(1);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}50%{-webkit-transform:scale(1.2);transform:scale(1.2);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}100%{-webkit-transform:scale(1);transform:scale(1)}}@-webkit-keyframes refresher-rotate{from{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(180deg);transform:rotate(180deg)}}@keyframes refresher-rotate{from{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(180deg);transform:rotate(180deg)}}";var L="ion-refresher{left:0;top:0;display:none;position:absolute;width:100%;height:60px;pointer-events:none;z-index:-1}[dir=rtl] ion-refresher,:host-context([dir=rtl]) ion-refresher{left:unset;right:unset;right:0}ion-refresher.refresher-active{display:block}ion-refresher-content{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center;height:100%}.refresher-pulling,.refresher-refreshing{display:none;width:100%}.refresher-pulling-icon,.refresher-refreshing-icon{-webkit-transform-origin:center;transform-origin:center;-webkit-transition:200ms;transition:200ms;font-size:30px;text-align:center}[dir=rtl] .refresher-pulling-icon,:host-context([dir=rtl]) .refresher-pulling-icon,[dir=rtl] .refresher-refreshing-icon,:host-context([dir=rtl]) .refresher-refreshing-icon{-webkit-transform-origin:calc(100% - center);transform-origin:calc(100% - center)}.refresher-pulling-text,.refresher-refreshing-text{font-size:16px;text-align:center}ion-refresher-content .arrow-container{display:none}.refresher-pulling ion-refresher-content .refresher-pulling{display:block}.refresher-ready ion-refresher-content .refresher-pulling{display:block}.refresher-ready ion-refresher-content .refresher-pulling-icon{-webkit-transform:rotate(180deg);transform:rotate(180deg)}.refresher-refreshing ion-refresher-content .refresher-refreshing{display:block}.refresher-cancelling ion-refresher-content .refresher-pulling{display:block}.refresher-cancelling ion-refresher-content .refresher-pulling-icon{-webkit-transform:scale(0);transform:scale(0)}.refresher-completing ion-refresher-content .refresher-refreshing{display:block}.refresher-completing ion-refresher-content .refresher-refreshing-icon{-webkit-transform:scale(0);transform:scale(0)}.refresher-native .refresher-pulling-text,.refresher-native .refresher-refreshing-text{display:none}.refresher-md .refresher-pulling-icon,.refresher-md .refresher-refreshing-icon{color:var(--ion-text-color, #000)}.refresher-md .refresher-pulling-text,.refresher-md .refresher-refreshing-text{color:var(--ion-text-color, #000)}.refresher-md .refresher-refreshing .spinner-lines-md line,.refresher-md .refresher-refreshing .spinner-lines-small-md line,.refresher-md .refresher-refreshing .spinner-crescent circle{stroke:var(--ion-text-color, #000)}.refresher-md .refresher-refreshing .spinner-bubbles circle,.refresher-md .refresher-refreshing .spinner-circles circle,.refresher-md .refresher-refreshing .spinner-dots circle{fill:var(--ion-text-color, #000)}ion-refresher.refresher-native{display:block;z-index:1}ion-refresher.refresher-native ion-spinner{margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;width:24px;height:24px;color:var(--ion-color-primary, #3880ff)}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){ion-refresher.refresher-native ion-spinner{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}ion-refresher.refresher-native .spinner-arrow-container{display:inherit}ion-refresher.refresher-native .arrow-container{display:block;position:absolute;width:24px;height:24px}ion-refresher.refresher-native .arrow-container ion-icon{margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;left:0;right:0;bottom:-4px;position:absolute;color:var(--ion-color-primary, #3880ff);font-size:12px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){ion-refresher.refresher-native .arrow-container ion-icon{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}ion-refresher.refresher-native.refresher-pulling ion-refresher-content .refresher-pulling,ion-refresher.refresher-native.refresher-ready ion-refresher-content .refresher-pulling{display:-ms-flexbox;display:flex}ion-refresher.refresher-native.refresher-refreshing ion-refresher-content .refresher-refreshing,ion-refresher.refresher-native.refresher-completing ion-refresher-content .refresher-refreshing,ion-refresher.refresher-native.refresher-cancelling ion-refresher-content .refresher-refreshing{display:-ms-flexbox;display:flex}ion-refresher.refresher-native .refresher-pulling-icon{-webkit-transform:translateY(calc(-100% - 10px));transform:translateY(calc(-100% - 10px))}ion-refresher.refresher-native .refresher-pulling-icon,ion-refresher.refresher-native .refresher-refreshing-icon{margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;border-radius:100%;padding-left:8px;padding-right:8px;padding-top:8px;padding-bottom:8px;display:-ms-flexbox;display:flex;border:1px solid var(--ion-color-step-200, #ececec);background:var(--ion-color-step-250, #ffffff);-webkit-box-shadow:0px 1px 6px rgba(0, 0, 0, 0.1);box-shadow:0px 1px 6px rgba(0, 0, 0, 0.1)}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){ion-refresher.refresher-native .refresher-pulling-icon,ion-refresher.refresher-native .refresher-refreshing-icon{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){ion-refresher.refresher-native .refresher-pulling-icon,ion-refresher.refresher-native .refresher-refreshing-icon{padding-left:unset;padding-right:unset;-webkit-padding-start:8px;padding-inline-start:8px;-webkit-padding-end:8px;padding-inline-end:8px}}";var z=e("ion_refresher",function(){function e(e){n(this,e);this.ionRefresh=i(this,"ionRefresh",7);this.ionPull=i(this,"ionPull",7);this.ionStart=i(this,"ionStart",7);this.appliedStyles=false;this.didStart=false;this.progress=0;this.pointerDown=false;this.needsCompletion=false;this.didRefresh=false;this.lastVelocityY=0;this.animations=[];this.nativeRefresher=false;this.state=1;this.pullMin=60;this.pullMax=this.pullMin+60;this.closeDuration="280ms";this.snapbackDuration="280ms";this.pullFactor=1;this.disabled=false}e.prototype.disabledChanged=function(){if(this.gesture){this.gesture.enable(!this.disabled)}};e.prototype.checkNativeRefresher=function(){return __awaiter(this,void 0,void 0,(function(){var e,r;return __generator(this,(function(t){switch(t.label){case 0:return[4,M(this.el,h(this))];case 1:e=t.sent();if(e&&!this.nativeRefresher){r=this.el.closest("ion-content");this.setupNativeRefresher(r)}else if(!e){this.destroyNativeRefresher()}return[2]}}))}))};e.prototype.destroyNativeRefresher=function(){if(this.scrollEl&&this.scrollListenerCallback){this.scrollEl.removeEventListener("scroll",this.scrollListenerCallback);this.scrollListenerCallback=undefined}this.nativeRefresher=false};e.prototype.resetNativeRefresher=function(e,r){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(t){switch(t.label){case 0:this.state=r;if(!(h(this)==="ios"))return[3,2];return[4,N(e,undefined)];case 1:t.sent();return[3,4];case 2:return[4,j(this.el.querySelector(".refresher-refreshing-icon"),200)];case 3:t.sent();t.label=4;case 4:this.didRefresh=false;this.needsCompletion=false;this.pointerDown=false;this.animations.forEach((function(e){return e.destroy()}));this.animations=[];this.progress=0;this.state=1;return[2]}}))}))};e.prototype.setupiOSNativeRefresher=function(e,n){return __awaiter(this,void 0,void 0,(function(){var i,o,a,f;var l=this;return __generator(this,(function(h){switch(h.label){case 0:this.elementToTransform=this.scrollEl;i=e.shadowRoot.querySelectorAll("svg");o=this.scrollEl.clientHeight*.16;a=i.length;t((function(){return i.forEach((function(e){return e.style.setProperty("animation","none")}))}));this.scrollListenerCallback=function(){if(!l.pointerDown&&l.state===1){return}s((function(){var r=l.scrollEl.scrollTop;var s=l.el.clientHeight;if(r>0){if(l.state===8){var f=d(0,r/(s*.5),1);t((function(){return T(n,1-f)}));return}t((function(){return T(e,0)}));return}if(l.pointerDown){if(!l.didStart){l.didStart=true;l.ionStart.emit()}if(l.pointerDown){l.ionPull.emit()}}var h=d(0,Math.abs(r)/s,.99);var c=l.progress=d(0,(Math.abs(r)-30)/o,1);var u=d(0,Math.floor(c*a),a-1);var p=l.state===8||u===a-1;if(p){if(l.pointerDown){D(n,l.lastVelocityY)}if(!l.didRefresh){l.beginRefresh();l.didRefresh=true;v({style:"light"});if(!l.pointerDown){N(l.elementToTransform,s+"px")}}}else{l.state=2;C(e,i,h,u)}}))};this.scrollEl.addEventListener("scroll",this.scrollListenerCallback);f=this;return[4,r.import("./p-403a82b9.system.js")];case 1:f.gesture=h.sent().createGesture({el:this.scrollEl,gestureName:"refresher",gesturePriority:31,direction:"y",threshold:5,onStart:function(){l.pointerDown=true;if(!l.didRefresh){N(l.elementToTransform,"0px")}if(o===0){o=l.scrollEl.clientHeight*.16}},onMove:function(e){l.lastVelocityY=e.velocityY},onEnd:function(){l.pointerDown=false;l.didStart=false;if(l.needsCompletion){l.resetNativeRefresher(l.elementToTransform,32);l.needsCompletion=false}else if(l.didRefresh){s((function(){return N(l.elementToTransform,l.el.clientHeight+"px")}))}}});this.disabledChanged();return[2]}}))}))};e.prototype.setupMDNativeRefresher=function(e,n,i){return __awaiter(this,void 0,void 0,(function(){var s,o,a,f;var l=this;return __generator(this,(function(h){switch(h.label){case 0:s=g(n).querySelector("circle");o=this.el.querySelector("ion-refresher-content .refresher-pulling-icon");a=g(i).querySelector("circle");if(s!==null&&a!==null){t((function(){s.style.setProperty("animation","none");i.style.setProperty("animation-delay","-655ms");a.style.setProperty("animation-delay","-655ms")}))}f=this;return[4,r.import("./p-403a82b9.system.js")];case 1:f.gesture=h.sent().createGesture({el:this.scrollEl,gestureName:"refresher",gesturePriority:31,direction:"y",threshold:5,canStart:function(){return l.state!==8&&l.state!==32&&l.scrollEl.scrollTop===0},onStart:function(e){e.data={animation:undefined,didStart:false,cancelled:false}},onMove:function(r){if(r.velocityY<0&&l.progress===0&&!r.data.didStart||r.data.cancelled){r.data.cancelled=true;return}if(!r.data.didStart){r.data.didStart=true;l.state=2;t((function(){return l.scrollEl.style.setProperty("--overflow","hidden")}));var n=k(e);var i=S(n,o,l.el);r.data.animation=i;i.progressStart(false,0);l.ionStart.emit();l.animations.push(i);return}l.progress=d(0,r.deltaY/180*.5,1);r.data.animation.progressStep(l.progress);l.ionPull.emit()},onEnd:function(e){if(!e.data.didStart){return}t((function(){return l.scrollEl.style.removeProperty("--overflow")}));if(l.progress<=.4){l.gesture.enable(false);e.data.animation.progressEnd(0,l.progress,500).onFinish((function(){l.animations.forEach((function(e){return e.destroy()}));l.animations=[];l.gesture.enable(true);l.state=1}));return}var r=u([0,0],[0,0],[1,1],[1,1],l.progress)[0];var n=P(o);l.animations.push(n);t((function(){return __awaiter(l,void 0,void 0,(function(){return __generator(this,(function(t){switch(t.label){case 0:o.style.setProperty("--ion-pulling-refresher-translate",r*100+"px");e.data.animation.progressEnd();return[4,n.play()];case 1:t.sent();this.beginRefresh();e.data.animation.destroy();return[2]}}))}))}))}});this.disabledChanged();return[2]}}))}))};e.prototype.setupNativeRefresher=function(e){return __awaiter(this,void 0,void 0,(function(){var r,t;return __generator(this,(function(n){if(this.scrollListenerCallback||!e||this.nativeRefresher||!this.scrollEl){return[2]}this.setCss(0,"",false,"");this.nativeRefresher=true;r=this.el.querySelector("ion-refresher-content .refresher-pulling ion-spinner");t=this.el.querySelector("ion-refresher-content .refresher-refreshing ion-spinner");if(h(this)==="ios"){this.setupiOSNativeRefresher(r,t)}else{this.setupMDNativeRefresher(e,r,t)}return[2]}))}))};e.prototype.componentDidUpdate=function(){this.checkNativeRefresher()};e.prototype.connectedCallback=function(){return __awaiter(this,void 0,void 0,(function(){var e,t,n;var i=this;return __generator(this,(function(s){switch(s.label){case 0:if(this.el.getAttribute("slot")!=="fixed"){console.error('Make sure you use: <ion-refresher slot="fixed">');return[2]}e=this.el.closest("ion-content");if(!e){console.error("<ion-refresher> must be used inside an <ion-content>");return[2]}return[4,new Promise((function(r){return p(e,r)}))];case 1:s.sent();t=this;return[4,e.getScrollElement()];case 2:t.scrollEl=s.sent();this.backgroundContentEl=g(e).querySelector("#background-content");return[4,M(this.el,h(this))];case 3:if(!s.sent())return[3,4];this.setupNativeRefresher(e);return[3,6];case 4:n=this;return[4,r.import("./p-403a82b9.system.js")];case 5:n.gesture=s.sent().createGesture({el:e,gestureName:"refresher",gesturePriority:31,direction:"y",threshold:20,passive:false,canStart:function(){return i.canStart()},onStart:function(){return i.onStart()},onMove:function(e){return i.onMove(e)},onEnd:function(){return i.onEnd()}});this.disabledChanged();s.label=6;case 6:return[2]}}))}))};e.prototype.disconnectedCallback=function(){this.destroyNativeRefresher();this.scrollEl=undefined;if(this.gesture){this.gesture.destroy();this.gesture=undefined}};e.prototype.complete=function(){return __awaiter(this,void 0,void 0,(function(){var e=this;return __generator(this,(function(r){if(this.nativeRefresher){this.needsCompletion=true;if(!this.pointerDown){m((function(){return m((function(){return e.resetNativeRefresher(e.elementToTransform,32)}))}))}}else{this.close(32,"120ms")}return[2]}))}))};e.prototype.cancel=function(){return __awaiter(this,void 0,void 0,(function(){var e=this;return __generator(this,(function(r){if(this.nativeRefresher){if(!this.pointerDown){m((function(){return m((function(){return e.resetNativeRefresher(e.elementToTransform,16)}))}))}}else{this.close(16,"")}return[2]}))}))};e.prototype.getProgress=function(){return Promise.resolve(this.progress)};e.prototype.canStart=function(){if(!this.scrollEl){return false}if(this.state!==1){return false}if(this.scrollEl.scrollTop>0){return false}return true};e.prototype.onStart=function(){this.progress=0;this.state=1};e.prototype.onMove=function(e){if(!this.scrollEl){return}var r=e.event;if(r.touches&&r.touches.length>1){return}if((this.state&56)!==0){return}var t=Number.isNaN(this.pullFactor)||this.pullFactor<0?1:this.pullFactor;var n=e.deltaY*t;if(n<=0){this.progress=0;this.state=1;if(this.appliedStyles){this.setCss(0,"",false,"");return}return}if(this.state===1){var i=this.scrollEl.scrollTop;if(i>0){this.progress=0;return}this.state=2}if(r.cancelable){r.preventDefault()}this.setCss(n,"0ms",true,"");if(n===0){this.progress=0;return}var s=this.pullMin;this.progress=n/s;if(!this.didStart){this.didStart=true;this.ionStart.emit()}this.ionPull.emit();if(n<s){this.state=2;return}if(n>this.pullMax){this.beginRefresh();return}this.state=4;return};e.prototype.onEnd=function(){if(this.state===4){this.beginRefresh()}else if(this.state===2){this.cancel()}};e.prototype.beginRefresh=function(){this.state=8;this.setCss(this.pullMin,this.snapbackDuration,true,"");this.ionRefresh.emit({complete:this.complete.bind(this)})};e.prototype.close=function(e,r){var t=this;setTimeout((function(){t.state=1;t.progress=0;t.didStart=false;t.setCss(0,"0ms",false,"")}),600);this.state=e;this.setCss(0,this.closeDuration,true,r)};e.prototype.setCss=function(e,r,n,i){var s=this;if(this.nativeRefresher){return}this.appliedStyles=e>0;t((function(){if(s.scrollEl&&s.backgroundContentEl){var t=s.scrollEl.style;var o=s.backgroundContentEl.style;t.transform=o.transform=e>0?"translateY("+e+"px) translateZ(0px)":"";t.transitionDuration=o.transitionDuration=r;t.transitionDelay=o.transitionDelay=i;t.overflow=n?"hidden":""}}))};e.prototype.render=function(){var e;var r=h(this);return o(f,{slot:"fixed",class:(e={},e[r]=true,e["refresher-"+r]=true,e["refresher-native"]=this.nativeRefresher,e["refresher-active"]=this.state!==1,e["refresher-pulling"]=this.state===2,e["refresher-ready"]=this.state===4,e["refresher-refreshing"]=this.state===8,e["refresher-cancelling"]=this.state===16,e["refresher-completing"]=this.state===32,e)})};Object.defineProperty(e.prototype,"el",{get:function(){return a(this)},enumerable:false,configurable:true});Object.defineProperty(e,"watchers",{get:function(){return{disabled:["disabledChanged"]}},enumerable:false,configurable:true});return e}());z.style={ios:Y,md:L};var H=e("ion_refresher_content",function(){function e(e){n(this,e)}e.prototype.componentWillLoad=function(){if(this.pullingIcon===undefined){var e=h(this);var r=this.el.style.webkitOverflowScrolling!==undefined?"lines":"arrow-down";this.pullingIcon=c.get("refreshingIcon",e==="ios"&&l("mobile")?c.get("spinner",r):"circular")}if(this.refreshingSpinner===undefined){var e=h(this);this.refreshingSpinner=c.get("refreshingSpinner",c.get("spinner",e==="ios"?"lines":"circular"))}};e.prototype.render=function(){var e=this.pullingIcon;var r=e!=null&&w[e]!==undefined;var t=h(this);return o(f,{class:t},o("div",{class:"refresher-pulling"},this.pullingIcon&&r&&o("div",{class:"refresher-pulling-icon"},o("div",{class:"spinner-arrow-container"},o("ion-spinner",{name:this.pullingIcon,paused:true}),t==="md"&&this.pullingIcon==="circular"&&o("div",{class:"arrow-container"},o("ion-icon",{name:"caret-back-sharp"})))),this.pullingIcon&&!r&&o("div",{class:"refresher-pulling-icon"},o("ion-icon",{icon:this.pullingIcon,lazy:false})),this.pullingText&&o("div",{class:"refresher-pulling-text",innerHTML:b(this.pullingText)})),o("div",{class:"refresher-refreshing"},this.refreshingSpinner&&o("div",{class:"refresher-refreshing-icon"},o("ion-spinner",{name:this.refreshingSpinner})),this.refreshingText&&o("div",{class:"refresher-refreshing-text",innerHTML:b(this.refreshingText)})))};Object.defineProperty(e.prototype,"el",{get:function(){return a(this)},enumerable:false,configurable:true});return e}())}}}));