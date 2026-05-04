const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/dist-js-Co_H9z1w.js","assets/core-CZB1OitF.js"])))=>i.map(i=>d[i]);
import{$ as Jn,A as Ka,B as Za,F as ie,G as $a,H as ol,J as lt,K as ll,L as An,M as gi,P as Tt,R as ct,S as Qt,T as ji,V as Si,X as Mi,a as cl,ct as Nt,et as Ji,h as ul,j as wr,k as Cr,l as Ec,lt as Lt,m as bc,n as dl,o as Ac,ot as It,q as hl,rt as zt,st as vn,t as Rc,tt as Pr,z as wc}from"./task-DH3NSo8N.js";import{n as Cc,r as Pc}from"./index-xTiza4PP.js";import{t as Ic}from"./session-B-HyXCmF.js";import{t as Dc}from"./timer-B9sxD6Av.js";var cr=zt("default");async function pa(){try{if(ul()){const{isPermissionGranted:e,requestPermission:t}=await cl(async()=>{const{isPermissionGranted:i,requestPermission:r}=await import("./dist-js-Co_H9z1w.js");return{isPermissionGranted:i,requestPermission:r}},__vite__mapDeps([0,1]));let n=await e();return n||(n=await t()==="granted"),cr.value=n?"granted":"denied",n}else if("Notification"in window){const e=await Notification.requestPermission();return cr.value=e,e==="granted"}else return cr.value="unavailable",!1}catch(e){return console.warn("[Notification] 请求权限失败:",e),cr.value="unavailable",!1}}async function Lc(e,t,n){try{if(ul()){const{sendNotification:i,isPermissionGranted:r}=await cl(async()=>{const{sendNotification:a,isPermissionGranted:o}=await import("./dist-js-Co_H9z1w.js");return{sendNotification:a,isPermissionGranted:o}},__vite__mapDeps([0,1]));let s=await r();s||(s=await pa()),s&&i({title:e,body:t,icon:n?.icon})}else if("Notification"in window&&Notification.permission==="granted"){const i=new Notification(e,{body:t,icon:n?.icon,tag:n?.tag,silent:!1});n?.onClick&&(i.onclick=n.onClick)}else if(await pa()&&"Notification"in window){const i=new Notification(e,{body:t,icon:n?.icon,tag:n?.tag});n?.onClick&&(i.onclick=n.onClick)}}catch(i){console.warn("[Notification] 发送通知失败:",i)}}function Nc(){return{permissionState:cr,requestPermission:pa,sendNotification:Lc}}var Qn=null,os=null,ma=zt(.5);function Ts(){return Qn||(Qn=new AudioContext,os=Qn.createGain(),os.gain.value=ma.value,os.connect(Qn.destination)),Qn.state==="suspended"&&Qn.resume(),Qn}function Gi(e,t,n="sine",i=0){try{const r=Ts(),s=r.createOscillator(),a=r.createGain();s.type=n,s.frequency.setValueAtTime(e,r.currentTime+i),a.gain.setValueAtTime(0,r.currentTime+i),a.gain.linearRampToValueAtTime(ma.value*.3,r.currentTime+i+.05),a.gain.linearRampToValueAtTime(ma.value*.3,r.currentTime+i+t-.1),a.gain.linearRampToValueAtTime(0,r.currentTime+i+t),s.connect(a),a.connect(os||r.destination),s.start(r.currentTime+i),s.stop(r.currentTime+i+t)}catch{}}function Uc(){try{Ts(),[523.25,659.25,783.99].forEach((e,t)=>{Gi(e,.3,"sine",t*.15)})}catch{}}function Fc(){try{Ts(),Gi(800,.5,"sine",0),Gi(1200,.4,"sine",.1)}catch{}}function Oc(){try{Ts(),[523.25,659.25,783.99,1046.5].forEach((e,t)=>{Gi(e,.8,"sine",t*.08)}),Gi(261.63,1,"triangle",0)}catch{}}function Bc(){try{[523.25,587.33,659.25,783.99,1046.5].forEach((e,t)=>{Gi(e,.2,"sine",t*.1)})}catch{}}var $n=typeof window<"u",Cs=$n?window:null,pr=$n?document:null,St={OBJECT:0,ATTRIBUTE:1,CSS:2,TRANSFORM:3,CSS_VAR:4},Ze={NUMBER:0,UNIT:1,COLOR:2,COMPLEX:3},nn={NONE:0,AUTO:1,FORCE:2},Ut={replace:0,none:1,blend:2},ja=Symbol(),mr=Symbol(),fl=Symbol(),ys=Symbol(),Vc=Symbol(),Et=1e-11,_a=1e12,tn=1e3;var pl=(()=>{const e=new Map;return e.set("x","translateX"),e.set("y","translateY"),e.set("z","translateZ"),e})(),ps=["perspective","translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skew","skewX","skewY"],zc=ps.reduce((e,t)=>({...e,[t]:t+"("}),{}),$t=()=>{},kc=/\)\s*[-.\d]/,Gc=/(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i,Hc=/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i,Wc=/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i,Xc=/hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i,qc=/hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i,Ja=/[-+]?\d*\.?\d+(?:e[-+]?\d)?/gi,Yc=/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([a-z]+|%)$/i,Kc=/([a-z])([A-Z])/g,Zc=/var\(\s*(--[\w-]+)(?:\s*,\s*([^)]+))?\s*\)/,ms={id:null,keyframes:null,playbackEase:null,playbackRate:1,frameRate:240,loop:0,reversed:!1,alternate:!1,autoplay:!0,persist:!1,duration:tn,delay:0,loopDelay:0,ease:"out(2)",composition:Ut.replace,modifier:e=>e,onBegin:$t,onBeforeUpdate:$t,onUpdate:$t,onLoop:$t,onPause:$t,onComplete:$t,onRender:$t},va={current:null,root:pr},ht={defaults:ms,precision:4,timeScale:1,tickThreshold:200,editor:null},ml={version:"4.4.1",engine:null};$n&&(Cs.AnimeJS||(Cs.AnimeJS=[]),Cs.AnimeJS.push(ml));var _l=e=>e.replace(Kc,"$1-$2").toLowerCase(),Kn=(e,t)=>e.indexOf(t)===0,Hi=Date.now,Wi=Array.isArray,Ps=e=>e&&e.constructor===Object,$c=e=>typeof e=="number"&&!isNaN(e),_r=e=>typeof e=="string",vr=e=>typeof e=="function",gt=e=>typeof e>"u",hr=e=>gt(e)||e===null,vl=e=>$n&&e instanceof SVGElement,gl=e=>Gc.test(e),Sl=e=>Kn(e,"rgb"),Ml=e=>Kn(e,"hsl"),jc=e=>gl(e)||(Sl(e)||Ml(e))&&(e[e.length-1]===")"||!kc.test(e)),ls=e=>!ht.defaults.hasOwnProperty(e),Jc=["opacity","rotate","overflow","color"],Qc=(e,t)=>{if(Jc.includes(t))return!1;if(e.getAttribute(t)||t in e){if(t==="scale"){const n=e.parentNode;return n&&n.tagName==="filter"}return!0}},oi=Math.pow,si=Math.sqrt,xl=Math.sin,Tl=Math.cos,eu=Math.abs,Ir=Math.exp,tu=Math.floor,nu=Math.asin,Ln=Math.PI,Qa=Math.round,et=(e,t,n)=>e<t?t:e>n?n:e,vt=(e,t)=>{if(t<0)return e;if(!t)return Qa(e);const n=10**t;return Qa(e*n)/n},ci=(e,t,n)=>e+(t-e)*n,Ca=e=>e===1/0?_a:e===-1/0?-_a:e,fr=e=>e<=1e-11?Et:Ca(vt(e,11)),kt=e=>Wi(e)?[...e]:e,iu=(e,t)=>{const n={...e};for(let i in t){const r=e[i];n[i]=gt(r)?t[i]:r}return n},Rt=(e,t,n,i="_prev",r="_next")=>{let s=e._head,a=r;for(n&&(s=e._tail,a=i);s;){const o=s[a];t(s),s=o}},ur=(e,t,n="_prev",i="_next")=>{const r=t[n],s=t[i];r?r[i]=s:e._head=s,s?s[n]=r:e._tail=r,t[n]=null,t[i]=null},Vi=(e,t,n,i="_prev",r="_next")=>{let s=e._tail;for(;s&&n&&n(s,t);)s=s[i];const a=s?s[r]:e._head;s?s[r]=t:e._head=t,a?a[i]=t:e._tail=t,t[i]=s,t[r]=a},ru=(e,t,n)=>{const i=e.style.transform;if(i){const r=e[ys];let s=0;const a=i.length;let o;for(;s<a;){for(;s<a&&i.charCodeAt(s)===32;)s++;if(s>=a)break;const l=s;for(;s<a&&i.charCodeAt(s)!==40;)s++;if(s>=a)break;const u=i.substring(l,s);let h=1;const d=s+1;let m=-1,S=-1;for(s++;s<a&&h>0;){const p=i.charCodeAt(s);p===40?h++:p===41?h--:p===44&&h===1&&(m===-1?m=s:S===-1&&(S=s)),s++}const M=s-1;u==="translate"||u==="translate3d"?(m===-1?r.translateX=i.substring(d,M).trim():(r.translateX=i.substring(d,m).trim(),S===-1?r.translateY=i.substring(m+1,M).trim():(r.translateY=i.substring(m+1,S).trim(),r.translateZ=i.substring(S+1,M).trim())),o=i.substring(d,M)):u==="scale"||u==="scale3d"?m===-1?r.scale=i.substring(d,M).trim():(r.scaleX=i.substring(d,m).trim(),S===-1?r.scaleY=i.substring(m+1,M).trim():(r.scaleY=i.substring(m+1,S).trim(),r.scaleZ=i.substring(S+1,M).trim())):r[u]=i.substring(d,M)}if(t==="translate3d"&&o)return n&&(n[t]=o),o;const c=r[t];if(!gt(c))return n&&(n[t]=c),c}return t==="translate3d"?"0px, 0px, 0px":t==="rotate3d"?"0, 0, 0, 0deg":Kn(t,"scale")?"1":Kn(t,"rotate")||Kn(t,"skew")?"0deg":"0px"},yl=e=>{let t="";for(let n=0,i=ps.length;n<i;n++){const r=ps[n],s=e[r];if(s!==void 0){if(r==="translateX"){const a=e.translateY;if(a!==void 0){const o=e.translateZ;o!==void 0?(t+=`translate3d(${s},${a},${o}) `,n+=2):(t+=`translate(${s},${a}) `,n+=1);continue}}if(r==="scaleX"&&e.scale===void 0){const a=e.scaleY;if(a!==void 0){const o=e.scaleZ;o!==void 0?(t+=`scale3d(${s},${a},${o}) `,n+=2):(t+=`scale(${s},${a}) `,n+=1);continue}}t+=`${zc[r]}${s}) `}r==="rotateZ"&&e.rotate3d!==void 0&&(t+=`rotate3d(${e.rotate3d}) `)}return e.matrix!==void 0&&(t+=`matrix(${e.matrix}) `),e.matrix3d!==void 0&&(t+=`matrix3d(${e.matrix3d}) `),t},su=e=>{const t=Hc.exec(e)||Wc.exec(e),n=gt(t[4])?1:+t[4];return[+t[1],+t[2],+t[3],n]},au=e=>{const t=e.length,n=t===4||t===5;return[+("0x"+e[1]+e[n?1:2]),+("0x"+e[n?2:3]+e[n?2:4]),+("0x"+e[n?3:5]+e[n?3:6]),t===5||t===9?+(+("0x"+e[n?4:7]+e[n?4:8])/255).toFixed(3):1]},Is=(e,t,n)=>(n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*(2/3-n)*6:e),ou=e=>{const t=Xc.exec(e)||qc.exec(e),n=+t[1]/360,i=+t[2]/100,r=+t[3]/100,s=gt(t[4])?1:+t[4];let a,o,c;if(i===0)a=o=c=r;else{const l=r<.5?r*(1+i):r+i-r*i,u=2*r-l;a=vt(Is(u,l,n+1/3)*255,0),o=vt(Is(u,l,n)*255,0),c=vt(Is(u,l,n-1/3)*255,0)}return[a,o,c,s]},lu=e=>Sl(e)?su(e):gl(e)?au(e):Ml(e)?ou(e):[0,0,0,1],ut=(e,t)=>gt(e)?t:e,Rn=(e,t,n,i,r,s)=>{let a;if(vr(e))a=()=>{const o=e(t,n,i,s);return isNaN(+o)?o||0:+o};else if(_r(e)&&Kn(e,"var("))a=()=>{const o=e.match(Zc),c=o[1],l=o[2];let u=getComputedStyle(t)?.getPropertyValue(c);return(!u||u.trim()==="")&&l&&(u=l.trim()),u||0};else return e;return r&&(r.func=a),a()},El=(e,t)=>e[mr]?e[fl]&&Qc(e,t)?St.ATTRIBUTE:ps.includes(t)||pl.get(t)?St.TRANSFORM:Kn(t,"--")?St.CSS_VAR:t in e.style?St.CSS:t in e?St.OBJECT:St.ATTRIBUTE:St.OBJECT,eo=(e,t,n)=>{const i=e.style[t];i&&n&&(n[t]=i);const r=i||getComputedStyle(e[Vc]||e).getPropertyValue(t);return r==="auto"?"0":r},Qi=(e,t,n,i)=>{const r=gt(n)?El(e,t):n;if(r===St.OBJECT){const s=e[t];return s&&i&&(i[t]=s),s||0}if(r===St.ATTRIBUTE){const s=e.getAttribute(t);return s&&i&&(i[t]=s),s}return r===St.TRANSFORM?ru(e,t,i):r===St.CSS_VAR?eo(e,t,i).trimStart():eo(e,t,i)},Ds=(e,t,n)=>n==="-"?e-t:n==="+"?e+t:e*t,Pa=()=>({t:Ze.NUMBER,n:0,u:null,o:null,d:null,s:null}),an=(e,t)=>{if(t.t=Ze.NUMBER,t.n=0,t.u=null,t.o=null,t.d=null,t.s=null,!e)return t;const n=+e;if(isNaN(n)){let i=e;i[1]==="="&&(t.o=i[0],i=i.slice(2));const r=i.includes(" ")?!1:Yc.exec(i);if(r)return t.t=Ze.UNIT,t.n=+r[1],t.u=r[2],t;if(t.o)return t.n=+i,t;if(jc(i))return t.t=Ze.COLOR,t.d=lu(i),t;{const s=i.match(Ja);return t.t=Ze.COMPLEX,t.d=s?s.map(Number):[],t.s=i.split(Ja)||[],t}}else return t.n=n,t},to=(e,t)=>(t.t=e._valueType,t.n=e._toNumber,t.u=e._unit,t.o=null,t.d=kt(e._toNumbers),t.s=kt(e._strings),t),ei=Pa(),bl=(e,t,n)=>{const i=e._modifier,r=e._fromNumbers,s=e._toNumbers,a=vt(et(i(ci(r[0],s[0],t)),0,255),0),o=vt(et(i(ci(r[1],s[1],t)),0,255),0),c=vt(et(i(ci(r[2],s[2],t)),0,255),0),l=et(i(vt(ci(r[3],s[3],t),n)),0,1);if(e._composition!==Ut.none){const u=e._numbers;u[0]=a,u[1]=o,u[2]=c,u[3]=l}return`rgba(${a},${o},${c},${l})`},Al=(e,t,n)=>{const i=e._modifier,r=e._fromNumbers,s=e._toNumbers,a=e._strings,o=e._composition!==Ut.none;let c=a[0];for(let l=0,u=s.length;l<u;l++){const h=i(vt(ci(r[l],s[l],t),n)),d=a[l+1];c+=`${d?h+d:h}`,o&&(e._numbers[l]=h)}return c},cs=(e,t,n,i,r)=>{const s=e.parent,a=e.duration,o=e.completed,c=e.iterationDuration,l=e.iterationCount,u=e._currentIteration,h=e._loopDelay,d=e._reversed,m=e._alternate,S=e._hasChildren,M=e._delay,p=e._currentTime,f=M+c,x=t-M,b=et(p,-M,a),E=et(x,-M,a),C=x-p,R=E>0,I=E>=a,v=a<=Et,y=r===nn.FORCE;let Y=0,A=x,H=0;l>1&&(e._currentIteration=et(~~(E/(c+(I?0:h))),0,l),I&&e._currentIteration--,Y=e._currentIteration%2,A=E%(c+h)||0);const j=d^(m&&Y),F=e._ease;let O=I?j?0:a:j?c-A:A;F&&(O=c*F(O/c)||0);const z=(s?s.backwards:x<p)?!j:!!j;if(e._currentTime=x,e._iterationTime=O,e.backwards=z,R&&!e.began?(e.began=!0,!n&&!(s&&(z||!s.began))&&e.onBegin(e)):x<=0&&(e.began=!1),!n&&!S&&R&&e._currentIteration!==u&&e.onLoop(e),y||r===nn.AUTO&&(t>=M&&t<=f||t<=M&&b>M||t>=f&&b!==a)||O>=f&&b!==a||O<=M&&b>0||t<=b&&b===a&&o||I&&!o&&v){if(R&&(e.computeDeltaTime(b),n||e.onBeforeUpdate(e)),!S){const V=y||(z?C*-1:C)>=ht.tickThreshold,ee=e._offset+(s?s._offset:0)+M+O;let q=e._head,ne,de,be,We,Pe=0;for(;q;){const Z=q._composition,se=q._currentTime,me=q._changeDuration,he=q._absoluteStartTime+q._changeDuration,ve=q._nextRep,Me=q._prevRep,ye=Z!==Ut.none;if((V||(se!==me||ee<=he+(ve?ve._delay:0))&&(se!==0||ee>=q._absoluteStartTime))&&(!ye||!q._isOverridden&&(!q._isOverlapped||ee<=he)&&(!ve||ve._isOverridden||ee<=ve._absoluteStartTime)&&(!Me||Me._isOverridden||ee>=Me._absoluteStartTime+Me._changeDuration+q._delay))){const Xe=q._currentTime=et(O-q._startTime,0,me),Ie=q._ease(Xe/q._updateDuration),tt=q._modifier,Ke=q._valueType,st=q._tweenType,at=st===St.OBJECT,ot=Ke===Ze.NUMBER,P=ot&&at||Ie===0||Ie===1?-1:ht.precision;let Je,De;if(ot?Je=De=tt(vt(ci(q._fromNumber,q._toNumber,Ie),P)):Ke===Ze.UNIT?(De=tt(vt(ci(q._fromNumber,q._toNumber,Ie),P)),Je=`${De}${q._unit}`):Ke===Ze.COLOR?Je=bl(q,Ie,P):Ke===Ze.COMPLEX&&(Je=Al(q,Ie,P)),ye&&(q._number=De),!i&&Z!==Ut.blend){const Ue=q.property;ne=q.target,at?ne[Ue]=Je:st===St.ATTRIBUTE?ne.setAttribute(Ue,Je):(de=ne.style,st===St.TRANSFORM?(ne!==be&&(be=ne,We=ne[ys]),We[Ue]=Je,Pe=1):st===St.CSS?de[Ue]=Je:st===St.CSS_VAR&&de.setProperty(Ue,Je)),R&&(H=1)}else q._value=Je}Pe&&q._renderTransforms&&(de.transform=yl(We),Pe=0),q=q._next}!n&&H&&e.onRender(e)}!n&&R&&e.onUpdate(e)}return s&&v?!n&&(s.began&&!z&&x>0&&!o||z&&x<=1e-11&&o)&&(e.onComplete(e),e.completed=!z):R&&I?l===1/0?e._startTime+=e.duration:e._currentIteration>=l-1&&(e.paused=!0,!o&&!S&&(e.completed=!0,!n&&!(s&&(z||!s.began))&&(e.onComplete(e),e._resolve(e)))):e.completed=!1,H},Fi=(e,t,n,i,r)=>{const s=e._currentIteration;if(cs(e,t,n,i,r),e._hasChildren){const a=e,o=a.backwards,c=i?t:a._iterationTime,l=Hi();let u=0,h=!0;if(!i&&a._currentIteration!==s){const d=a.iterationDuration;Rt(a,m=>{if(!o)!m.completed&&!m.backwards&&m._currentTime<m.iterationDuration&&cs(m,d,n,1,nn.FORCE),m.began=!1,m.completed=!1;else{const S=m.duration,M=m._offset+m._delay,p=M+S;!n&&S<=1e-11&&(!M||p===d)&&m.onComplete(m)}}),n||a.onLoop(a)}Rt(a,d=>{const m=vt((c-d._offset)*d._speed,12),S=d._fps<a._fps?d.requestTick(l):r;u+=cs(d,m,n,i,S),!d.completed&&h&&(h=!1)},o),!n&&u&&a.onRender(a),(h||o)&&a._currentTime>=a.duration&&(a.paused=!0,a.completed||(a.completed=!0,n||(a.onComplete(a),a._resolve(a))))}},no={},cu=(e,t,n)=>{if(n===St.TRANSFORM){const i=pl.get(e);return i||e}else if(n===St.CSS||n===St.ATTRIBUTE&&vl(t)&&e in t.style){const i=no[e];if(i)return i;{const r=e&&_l(e);return no[e]=r,r}}else return e},Rl=(e,t=!1)=>{if(e._hasChildren)Rt(e,n=>Rl(n,t),!0);else{const n=e;n.pause(),Rt(n,i=>{const r=i.property,s=i.target,a=i._tweenType,o=i._inlineValue,c=hr(o)||o==="";if(a===St.OBJECT)!t&&!c&&(s[r]=o);else if(s[mr])if(a===St.ATTRIBUTE)t||(c?s.removeAttribute(r):s.setAttribute(r,o));else{const l=s.style;if(a===St.TRANSFORM){const u=s[ys];c?delete u[r]:u[r]=o,i._renderTransforms&&(Object.keys(u).length?l.transform=yl(u):l.removeProperty("transform"))}else c?l.removeProperty(_l(r)):l[r]=o}s[mr]&&n._tail===i&&n.targets.forEach(l=>{l.getAttribute&&l.getAttribute("style")===""&&l.removeAttribute("style")})})}return e},wl=class{constructor(e=0){this.deltaTime=0,this._currentTime=e,this._lastTickTime=e,this._startTime=e,this._lastTime=e,this._scheduledTime=0,this._frameDuration=tn/240,this._fps=240,this._speed=1,this._hasChildren=!1,this._head=null,this._tail=null}get fps(){return this._fps}set fps(e){const t=this._frameDuration,n=+e,i=n<1e-11?Et:n,r=tn/i;i>ms.frameRate&&(ms.frameRate=i),this._fps=i,this._frameDuration=r,this._scheduledTime+=r-t}get speed(){return this._speed}set speed(e){const t=+e;this._speed=t<1e-11?Et:t}requestTick(e){const t=this._scheduledTime;if(this._lastTickTime=e,e<t)return nn.NONE;const n=this._frameDuration,i=e-t;return this._scheduledTime+=i<n?n:i,nn.AUTO}computeDeltaTime(e){const t=e-this._lastTime;return this.deltaTime=t,this._lastTime=e,t}},zi={animation:null,update:$t},uu=e=>{let t=zi.animation;return t||(t={duration:Et,computeDeltaTime:$t,_offset:0,_delay:0,_head:null,_tail:null},zi.animation=t,zi.update=()=>{e.forEach(n=>{for(let i in n){const r=n[i],s=r._head;if(s){const a=s._valueType,o=a===Ze.COMPLEX||a===Ze.COLOR?kt(s._fromNumbers):null;let c=s._fromNumber,l=r._tail;for(;l&&l!==s;){if(o)for(let u=0,h=l._numbers.length;u<h;u++)o[u]+=l._numbers[u];else c+=l._number;l=l._prevAdd}s._toNumber=c,s._toNumbers=o}}}),cs(t,1,1,0,nn.FORCE)}),t},Cl=$n?requestAnimationFrame:setImmediate,du=$n?cancelAnimationFrame:clearImmediate,hu=class extends wl{constructor(e){super(e),this.useDefaultMainLoop=!0,this.pauseOnDocumentHidden=!0,this.defaults=ms,this.paused=!0,this.reqId=0}update(){const e=this._currentTime=Hi();if(this.requestTick(e)){this.computeDeltaTime(e);const t=this._speed,n=this._fps;let i=this._head;for(;i;){const r=i._next;i.paused?(ur(this,i),this._hasChildren=!!this._tail,i._running=!1,i.completed&&!i._cancelled&&i.cancel()):Fi(i,(e-i._startTime)*i._speed*t,0,0,i._fps<n?i.requestTick(e):nn.AUTO),i=r}zi.update()}}wake(){return this.useDefaultMainLoop&&!this.reqId&&(this.requestTick(Hi()),this.reqId=Cl(Pl)),this}pause(){if(this.reqId)return this.paused=!0,fu()}resume(){if(this.paused)return this.paused=!1,Rt(this,e=>e.resetTime()),this.wake()}get speed(){return this._speed*(ht.timeScale===1?1:tn)}set speed(e){this._speed=e*ht.timeScale,Rt(this,t=>t.speed=t._speed)}get timeUnit(){return ht.timeScale===1?"ms":"s"}set timeUnit(e){const n=e==="s",i=n?.001:1;if(ht.timeScale!==i){ht.timeScale=i,ht.tickThreshold=200*i;const r=n?.001:tn;this.defaults.duration*=r,this._speed*=r}}get precision(){return ht.precision}set precision(e){ht.precision=e}},Gt=(()=>{const e=new hu(Hi());return $n&&(ml.engine=e,pr.addEventListener("visibilitychange",()=>{e.pauseOnDocumentHidden&&(pr.hidden?e.pause():e.resume())})),e})(),Pl=()=>{Gt._head?(Gt.reqId=Cl(Pl),Gt.update()):Gt.reqId=0},fu=()=>(du(Gt.reqId),Gt.reqId=0,Gt),_s={_rep:new WeakMap,_add:new Map},Ia=(e,t,n="_rep")=>{const i=_s[n];let r=i.get(e);return r||(r={},i.set(e,r)),r[t]?r[t]:r[t]={_head:null,_tail:null}},pu=(e,t)=>e._isOverridden||e._absoluteStartTime>t._absoluteStartTime,us=e=>{e._isOverlapped=1,e._isOverridden=1,e._changeDuration=Et,e._currentTime=Et},Il=(e,t)=>{const n=e._composition;if(n===Ut.replace){const i=e._absoluteStartTime;Vi(t,e,pu,"_prevRep","_nextRep");const r=e._prevRep;if(r){const s=r.parent,a=r._absoluteStartTime+r._changeDuration;if(e.parent.id!==s.id&&s.iterationCount>1&&a+(s.duration-s.iterationDuration)>i){us(r);let l=r._prevRep;for(;l&&l.parent.id===s.id;)us(l),l=l._prevRep}const o=i-e._delay;if(a>o){const l=r._startTime,u=vt(o-(a-(l+r._updateDuration))-l,12);r._changeDuration=u,r._currentTime=u,r._isOverlapped=1,u<1e-11&&us(r)}let c=!0;if(Rt(s,l=>{l._isOverlapped||(c=!1)}),c){const l=s.parent;if(l){let u=!0;Rt(l,h=>{h!==s&&Rt(h,d=>{d._isOverlapped||(u=!1)})}),u&&l.cancel()}else s.cancel()}}}else if(n===Ut.blend){const i=Ia(e.target,e.property,"_add"),r=uu(_s._add);let s=i._head;s||(s={...e},s._composition=Ut.replace,s._updateDuration=Et,s._startTime=0,s._numbers=kt(e._fromNumbers),s._number=0,s._next=null,s._prev=null,Vi(i,s),Vi(r,s));const a=e._toNumber;if(e._fromNumber=s._fromNumber-a,e._toNumber=0,e._numbers=kt(e._fromNumbers),e._number=0,s._fromNumber=a,e._toNumbers){const o=kt(e._toNumbers);o&&o.forEach((c,l)=>{e._fromNumbers[l]=s._fromNumbers[l]-c,e._toNumbers[l]=0}),s._fromNumbers=o}Vi(i,e,null,"_prevAdd","_nextAdd")}return e},mu=e=>{const t=e._composition;if(t!==Ut.none){const n=e.target,i=e.property,r=_s._rep.get(n)[i];if(ur(r,e,"_prevRep","_nextRep"),t===Ut.blend){const s=_s._add,a=s.get(n);if(!a)return;const o=a[i],c=zi.animation;ur(o,e,"_prevAdd","_nextAdd");const l=o._head;if(l&&l===o._tail){ur(o,l,"_prevAdd","_nextAdd"),ur(c,l);let u=!0;for(let h in a)if(a[h]._head){u=!1;break}u&&s.delete(n)}}}return e},io=e=>(e.paused=!0,e.began=!1,e.completed=!1,e),ga=e=>(e._cancelled&&(e._hasChildren?Rt(e,ga):Rt(e,t=>{t._composition!==Ut.none&&Il(t,Ia(t.target,t.property))}),e._cancelled=0),e),ro=0,_u=(e,t)=>e._priority>t._priority,vu=class extends wl{constructor(e={},t=null,n=0){super(0),++ro;const{id:i,delay:r,duration:s,reversed:a,alternate:o,loop:c,loopDelay:l,autoplay:u,frameRate:h,playbackRate:d,priority:m,onComplete:S,onLoop:M,onPause:p,onBegin:f,onBeforeUpdate:x,onUpdate:b}=e;va.current&&va.current.register(this);const E=t?0:Gt._lastTickTime,C=t?t.defaults:ht.defaults,R=vr(r)||gt(r)?C.delay:+r,I=vr(s)||gt(s)?1/0:+s,v=ut(c,C.loop),y=ut(l,C.loopDelay);let Y=v===!0||v===1/0||v<0?1/0:v+1,A=0;t?A=n:(Gt.reqId||Gt.requestTick(Hi()),A=(Gt._lastTickTime-Gt._startTime)*ht.timeScale),this.id=gt(i)?ro:i,this.parent=t,this.duration=Ca((I+y)*Y-y)||1e-11,this.backwards=!1,this.paused=!0,this.began=!1,this.completed=!1,this.onBegin=f||C.onBegin,this.onBeforeUpdate=x||C.onBeforeUpdate,this.onUpdate=b||C.onUpdate,this.onLoop=M||C.onLoop,this.onPause=p||C.onPause,this.onComplete=S||C.onComplete,this.iterationDuration=I,this.iterationCount=Y,this._autoplay=t?!1:ut(u,C.autoplay),this._offset=A,this._delay=R,this._loopDelay=y,this._iterationTime=0,this._currentIteration=0,this._resolve=$t,this._running=!1,this._reversed=+ut(a,C.reversed),this._reverse=this._reversed,this._cancelled=0,this._alternate=ut(o,C.alternate),this._prev=null,this._next=null,this._lastTickTime=E,this._startTime=E,this._lastTime=E,this._fps=ut(h,C.frameRate),this._speed=ut(d,C.playbackRate),this._priority=+ut(m,1)}get cancelled(){return!!this._cancelled}set cancelled(e){e?this.cancel():this.reset(!0).play()}get currentTime(){return et(vt(this._currentTime,ht.precision),-this._delay,this.duration)}set currentTime(e){const t=this.paused;this.pause().seek(+e),t||this.resume()}get iterationCurrentTime(){return et(vt(this._iterationTime,ht.precision),0,this.iterationDuration)}set iterationCurrentTime(e){this.currentTime=this.iterationDuration*this._currentIteration+e}get progress(){return et(vt(this._currentTime/this.duration,10),0,1)}set progress(e){this.currentTime=this.duration*e}get iterationProgress(){return et(vt(this._iterationTime/this.iterationDuration,10),0,1)}set iterationProgress(e){const t=this.iterationDuration;this.currentTime=t*this._currentIteration+t*e}get currentIteration(){return this._currentIteration}set currentIteration(e){this.currentTime=this.iterationDuration*et(+e,0,this.iterationCount-1)}get reversed(){return!!this._reversed}set reversed(e){e?this.reverse():this.play()}get speed(){return super.speed}set speed(e){super.speed=e,this.resetTime()}reset(e=!1){return ga(this),this._reversed&&!this._reverse&&(this.reversed=!1),this._iterationTime=this.iterationDuration,Fi(this,0,1,~~e,nn.FORCE),io(this),this._hasChildren&&Rt(this,io),this}init(e=!1){this.fps=this._fps,this.speed=this._speed,!e&&this._hasChildren&&Fi(this,this.duration,1,~~e,nn.FORCE),this.reset(e);const t=this._autoplay;return t===!0?this.resume():t&&!gt(t.linked)&&t.link(this),this}resetTime(){const e=1/(this._speed*Gt._speed);return this._startTime=Hi()-(this._currentTime+this._delay)*e,this}pause(){return this.paused?this:(this.paused=!0,this.onPause(this),this)}resume(){return this.paused?(this.paused=!1,this.duration<=1e-11&&!this._hasChildren?Fi(this,Et,0,0,nn.FORCE):(this._running||(Vi(Gt,this,_u),Gt._hasChildren=!0,this._running=!0),this.resetTime(),this._startTime-=12,Gt.wake()),this):this}restart(){return this.reset().resume()}seek(e,t=0,n=0){ga(this),this.completed=!1;const i=this.paused;return this.paused=!0,Fi(this,e+this._delay,~~t,~~n,nn.AUTO),i?this:this.resume()}alternate(){const e=this._reversed,t=this.iterationCount,n=this.iterationDuration,i=t===1/0?tu(_a/n):t;return this._reversed=+(this._alternate&&!(i%2)?e:!e),t===1/0?this.iterationProgress=this._reversed?1-this.iterationProgress:this.iterationProgress:this.seek(n*i-this._currentTime),this.resetTime(),this}play(){return this._reversed&&this.alternate(),this.resume()}reverse(){return this._reversed||this.alternate(),this.resume()}cancel(){return this._hasChildren?Rt(this,e=>e.cancel(),!0):Rt(this,mu),this._cancelled=1,this.pause()}stretch(e){const t=this.duration,n=fr(e);if(t===n)return this;const i=e/t,r=e<=Et;return this.duration=r?Et:n,this.iterationDuration=r?Et:fr(this.iterationDuration*i),this._offset*=i,this._delay*=i,this._loopDelay*=i,this}revert(){Fi(this,0,1,0,nn.AUTO);const e=this._autoplay;return e&&e.linked&&e.linked===this&&e.revert(),this.cancel()}complete(e=0){return this.seek(this.duration,e).cancel()}then(e=$t){const t=this.then,n=()=>{this.then=null,e(this),this.then=t,this._resolve=$t};return new Promise(i=>(this._resolve=()=>i(n()),this.completed&&this._resolve(),this))}};function so(e){const t=_r(e)?va.root.querySelectorAll(e):e;if(t instanceof NodeList||t instanceof HTMLCollection)return t}function gu(e){if(hr(e))return[];if(!$n)return Wi(e)&&e.flat(1/0)||[e];if(Wi(e)){const n=e.flat(1/0),i=[];for(let r=0,s=n.length;r<s;r++){const a=n[r];if(!hr(a)){const o=so(a);if(o)for(let c=0,l=o.length;c<l;c++){const u=o[c];if(!hr(u)){let h=!1;for(let d=0,m=i.length;d<m;d++)if(i[d]===u){h=!0;break}h||i.push(u)}}else{let c=!1;for(let l=0,u=i.length;l<u;l++)if(i[l]===a){c=!0;break}c||i.push(a)}}}return i}const t=so(e);return t?Array.from(t):[e]}function Su(e){const t=gu(e),n=t.length;if(n)for(let i=0;i<n;i++){const r=t[i];if(!r[ja]){r[ja]=!0;const s=vl(r);(r.nodeType||s)&&(r[mr]=!0,r[fl]=s,r[ys]={})}}return t}var Ls={deg:1,rad:180/Ln,turn:360},ao={},oo=(e,t,n,i=!1)=>{const r=t.u,s=t.n;if(t.t===Ze.UNIT&&r===n)return t;const a=s+r+n,o=ao[a];if(!gt(o)&&!i)t.n=o;else{let c;if(r in Ls)c=s*Ls[r]/Ls[n];else{const u=e.cloneNode(),h=e.parentNode,d=h&&h!==pr?h:pr.body;d.appendChild(u);const m=u.style;m.width=100+r;const S=u.offsetWidth||100;m.width=100+n;const M=S/(u.offsetWidth||100);d.removeChild(u),c=M*s}t.n=c,ao[a]=c}return t.t,Ze.UNIT,t.u=n,t},Zn=e=>e,er=(e=1.68)=>t=>oi(t,+e),Sa={in:e=>t=>e(t),out:e=>t=>1-e(1-t),inOut:e=>t=>t<.5?e(t*2)/2:1-e(t*-2+2)/2,outIn:e=>t=>t<.5?(1-e(1-t*2))/2:(e(t*2-1)+1)/2},Mu=Ln/2,lo=Ln*2,co={"":er,Quad:er(2),Cubic:er(3),Quart:er(4),Quint:er(5),Sine:e=>1-Tl(e*Mu),Circ:e=>1-si(1-e*e),Expo:e=>e?oi(2,10*e-10):0,Bounce:e=>{let t,n=4;for(;e<((t=oi(2,--n))-1)/11;);return 1/oi(4,3-n)-7.5625*oi((t*3-2)/22-e,2)},Back:(e=1.7)=>t=>(+e+1)*t*t*t-+e*t*t,Elastic:(e=1,t=.3)=>{const n=et(+e,1,10),i=et(+t,Et,2),r=i/lo*nu(1/n),s=lo/i;return a=>a===0||a===1?a:-n*oi(2,-10*(1-a))*xl((1-a-r)*s)}},Ns=(()=>{const e={linear:Zn,none:Zn};for(let t in Sa)for(let n in co){const i=co[n],r=Sa[t];e[t+n]=n===""||n==="Back"||n==="Elastic"?(s,a)=>r(i(s,a)):r(i)}return e})(),Dr={linear:Zn,none:Zn},xu=e=>{if(Dr[e])return Dr[e];if(e.indexOf("(")<=-1){const t=Sa[e]||e.includes("Back")||e.includes("Elastic")?Ns[e]():Ns[e];return t?Dr[e]=t:Zn}else{const t=e.slice(0,-1).split("("),n=Ns[t[0]];return n?Dr[e]=n(...t[1].split(",")):Zn}},uo=["steps(","irregular(","linear(","cubicBezier("],ho=e=>{if(_r(e)){for(let t=0,n=uo.length;t<n;t++)if(Kn(e,uo[t]))return console.warn(`String syntax for \`ease: "${e}"\` has been removed from the core and replaced by importing and passing the easing function directly: \`ease: ${e}\``),Zn}return vr(e)?e:_r(e)?xu(e):Zn},Be=Pa(),Ge=Pa(),xi={},Lr={func:null},Us={func:null},Nr=[null],Ti=[null,null],Ur={to:null},Tu=0,fo=0,zn,gn,yu=(e,t)=>{const n={};if(Wi(e)){const i=[].concat(...e.map(r=>Object.keys(r))).filter(ls);for(let r=0,s=i.length;r<s;r++){const a=i[r];n[a]=e.map(o=>{const c={};for(let l in o){const u=o[l];ls(l)?l===a&&(c.to=u):c[l]=u}return c})}}else{const i=ut(t.duration,ht.defaults.duration);Object.keys(e).map(r=>({o:parseFloat(r)/100,p:e[r]})).sort((r,s)=>r.o-s.o).forEach(r=>{const s=r.o,a=r.p;for(let o in a)if(ls(o)){let c=n[o];c||(c=n[o]=[]);const l=s*i;let u=c.length,h=c[u-1];const d={to:a[o]};let m=0;for(let S=0;S<u;S++)m+=c[S].duration;u===1&&(d.from=h.to),a.ease&&(d.ease=a.ease),d.duration=l-(u?m:0),c.push(d)}return r});for(let r in n){const s=n[r];let a;for(let o=0,c=s.length;o<c;o++){const l=s[o],u=l.ease;l.ease=a||void 0,a=u}s[0].duration||s.shift()}}return n},Eu=class extends vu{constructor(e,t,n,i,r=!1,s=0,a){super(t,n,i),++fo;const o=Su(e),c=o.length,l=t.keyframes,u=l?iu(yu(l,t),t):t,{id:h,delay:d,duration:m,ease:S,playbackEase:M,modifier:p,composition:f,onRender:x}=u,b=n?n.defaults:ht.defaults,E=ut(S,b.ease),C=ut(M,b.playbackEase),R=C?ho(C):null,I=!gt(E.ease),v=I?E.ease:ut(S,R?"linear":b.ease),y=I?E.settlingDuration:ut(m,b.duration),Y=ut(d,b.delay),A=p||b.modifier,H=gt(f)&&c>=1e3?Ut.none:gt(f)?b.composition:f,j=this._offset+(n?n._offset:0);I&&(E.parent=this);let F=NaN,O=NaN,z=0,V=0;for(let ee=0;ee<c;ee++){const q=o[ee],ne=s||ee,de=a||o;let be=NaN,We=NaN;for(let Pe in u)if(ls(Pe)){const Z=El(q,Pe),se=cu(Pe,q,Z);let me=u[Pe];const he=Wi(me);if(r&&!he&&(Ti[0]=me,Ti[1]=me,me=Ti),he){const tt=me.length,Ke=!Ps(me[0]);tt===2&&Ke?(Ur.to=me,Nr[0]=Ur,zn=Nr):tt>2&&Ke?(zn=[],me.forEach((st,at)=>{at?at===1?(Ti[1]=st,zn.push(Ti)):zn.push(st):Ti[0]=st})):zn=me}else Nr[0]=me,zn=Nr;let ve=null,Me=null,ye=NaN,Xe=0,Ie=0;for(let tt=zn.length;Ie<tt;Ie++){const Ke=zn[Ie];Ps(Ke)?gn=Ke:(Ur.to=Ke,gn=Ur),Lr.func=null,Us.func=null;const st=Rn(ut(gn.composition,H),q,ne,de,null,null),at=$c(st)?st:Ut[st];!ve&&at!==Ut.none&&(ve=Ia(q,se));const ot=ve?ve._tail:null,P=n&&ot&&ot.parent.parent===n?ot:Me,Je=Rn(gn.to,q,ne,de,Lr,P);let De;Ps(Je)&&!gt(Je.to)?(gn=Je,De=Je.to):De=Je;const Ue=Rn(gn.from,q,ne,de,null,P),fe=gn.ease||v,nt=Rn(fe,q,ne,de,null,P),xe=vr(nt)||_r(nt)?nt:fe,T=!gt(xe)&&!gt(xe.ease),_=T?xe.ease:xe,U=T?xe.settlingDuration:Rn(ut(gn.duration,tt>1?Rn(y,q,ne,de,null,P)/tt:y),q,ne,de,null,P),Q=Rn(ut(gn.delay,Ie?0:Y),q,ne,de,null,P),te=gn.modifier||A,oe=!gt(Ue),ue=!gt(De),D=Wi(De),G=D||oe&&ue,N=Me?Xe+Q:Q,$=vt(j+N,12);!V&&(oe||D)&&(V=1);let J=Me;if(at!==Ut.none){let w=ve._head;for(;w&&!w._isOverridden&&w._absoluteStartTime<=$;)if(J=w,w=w._nextRep,w&&w._absoluteStartTime>=$)for(;w;)us(w),w=w._nextRep}if(G){an(D?Rn(De[0],q,ne,de,Us,P):Ue,Be),an(D?Rn(De[1],q,ne,de,Lr,P):De,Ge);const w=Qi(q,se,Z,xi);Be.t===Ze.NUMBER&&(J?J._valueType===Ze.UNIT&&(Be.t=Ze.UNIT,Be.u=J._unit):(an(w,ei),ei.t===Ze.UNIT&&(Be.t=Ze.UNIT,Be.u=ei.u)))}else ue?an(De,Ge):Me?to(Me,Ge):an(n&&J&&J.parent.parent===n?J._value:Qi(q,se,Z,xi),Ge),oe?an(Ue,Be):Me?to(Me,Be):an(n&&J&&J.parent.parent===n?J._value:Qi(q,se,Z,xi),Be);if(Be.o&&(Be.n=Ds(J?J._toNumber:an(Qi(q,se,Z,xi),ei).n,Be.n,Be.o)),Ge.o&&(Ge.n=Ds(Be.n,Ge.n,Ge.o)),Be.t!==Ge.t){if(Be.t===Ze.COMPLEX||Ge.t===Ze.COMPLEX){const w=Be.t===Ze.COMPLEX?Be:Ge,K=Be.t===Ze.COMPLEX?Ge:Be;K.t=Ze.COMPLEX,K.s=kt(w.s),K.d=w.d.map(()=>K.n)}else if(Be.t===Ze.UNIT||Ge.t===Ze.UNIT){const w=Be.t===Ze.UNIT?Be:Ge,K=Be.t===Ze.UNIT?Ge:Be;K.t=Ze.UNIT,K.u=w.u}else if(Be.t===Ze.COLOR||Ge.t===Ze.COLOR){const w=Be.t===Ze.COLOR?Be:Ge,K=Be.t===Ze.COLOR?Ge:Be;K.t=Ze.COLOR,K.s=w.s,K.d=[0,0,0,1]}}if(Be.u!==Ge.u){let w=Ge.u?Be:Ge;w=oo(q,w,Ge.u?Ge.u:Be.u,!1)}if(Ge.d&&Be.d&&Ge.d.length!==Be.d.length){const w=Be.d.length>Ge.d.length?Be:Ge,K=w===Be?Ge:Be;K.d=w.d.map((ae,ce)=>gt(K.d[ce])?0:K.d[ce]),K.s=kt(w.s)}const Te=vt(+U||1e-11,12);let Ae=xi[se];hr(Ae)||(xi[se]=null);const Ce={parent:this,id:Tu++,property:se,target:q,_value:null,_toFunc:Lr.func,_fromFunc:Us.func,_ease:ho(_),_fromNumbers:kt(Be.d),_toNumbers:kt(Ge.d),_strings:kt(Ge.s),_fromNumber:Be.n,_toNumber:Ge.n,_numbers:kt(Be.d),_number:Be.n,_unit:Ge.u,_modifier:te,_currentTime:0,_startTime:N,_delay:+Q,_updateDuration:Te,_changeDuration:Te,_absoluteStartTime:$,_tweenType:Z,_valueType:Ge.t,_composition:at,_isOverlapped:0,_isOverridden:0,_renderTransforms:0,_inlineValue:Ae,_prevRep:null,_nextRep:null,_prevAdd:null,_nextAdd:null,_prev:null,_next:null};at!==Ut.none&&Il(Ce,ve);const ze=Ce._valueType;ze===Ze.COMPLEX?Ce._value=Al(Ce,1,-1):ze===Ze.COLOR?Ce._value=bl(Ce,1,-1):ze===Ze.UNIT?Ce._value=`${te(Ce._toNumber)}${Ce._unit}`:Ce._value=te(Ce._toNumber),isNaN(ye)&&(ye=Ce._startTime),Xe=vt(N+Te,12),Me=Ce,z++,Vi(this,Ce)}(isNaN(O)||ye<O)&&(O=ye),(isNaN(F)||Xe>F)&&(F=Xe),Z===St.TRANSFORM&&(be=z-Ie,We=z)}if(!isNaN(be)){let Pe=0;Rt(this,Z=>{Pe>=be&&Pe<We&&(Z._renderTransforms=1,Z._composition===Ut.blend&&Rt(zi.animation,se=>{se.id===Z.id&&(se._renderTransforms=1)})),Pe++})}}c||console.warn("No target found. Make sure the element you're trying to animate is accessible before creating your animation."),O?(Rt(this,ee=>{ee._startTime-ee._delay||(ee._delay-=O),ee._startTime-=O}),F-=O):O=0,F||(F=Et,this.iterationCount=0),this.targets=o,this.id=gt(h)?fo:h,this.duration=F===1e-11?Et:Ca((F+this._loopDelay)*this.iterationCount-this._loopDelay)||1e-11,this.onRender=x||b.onRender,this._ease=R,this._delay=O,this.iterationDuration=F,!this._autoplay&&V&&this.onRender(this)}stretch(e){const t=this.duration;if(t===fr(e))return this;const n=e/t;return Rt(this,i=>{i._updateDuration=fr(i._updateDuration*n),i._changeDuration=fr(i._changeDuration*n),i._currentTime*=n,i._startTime*=n,i._absoluteStartTime*=n}),super.stretch(e)}refresh(){return Rt(this,e=>{const t=e._toFunc,n=e._fromFunc;(t||n)&&(n?(an(n(),Be),Be.u!==e._unit&&e.target[mr]&&oo(e.target,Be,e._unit,!0),e._fromNumbers=kt(Be.d),e._fromNumber=Be.n):t&&(an(Qi(e.target,e.property,e._tweenType),ei),e._fromNumbers=kt(ei.d),e._fromNumber=ei.n),t&&(an(t(),Ge),e._toNumbers=kt(Ge.d),e._strings=kt(Ge.s),e._toNumber=Ge.o?Ds(e._fromNumber,Ge.n,Ge.o):Ge.n))}),this.duration===1e-11&&this.restart(),this}revert(){return super.revert(),Rl(this)}then(e){return super.then(e)}},Fr=(e,t)=>ht.editor?ht.editor.addAnimation(e,t):new Eu(e,t,null,0,!1).init(),qt=tn*10,bu=class{constructor(e={}){const t=!gt(e.bounce)||!gt(e.duration);this.timeStep=.02,this.restThreshold=5e-4,this.restDuration=200,this.maxDuration=6e4,this.maxRestSteps=this.restDuration/this.timeStep/tn,this.maxIterations=this.maxDuration/this.timeStep/tn,this.bn=et(ut(e.bounce,.5),-1,1),this.pd=et(ut(e.duration,628),10*ht.timeScale,qt*ht.timeScale),this.m=et(ut(e.mass,1),1,qt),this.s=et(ut(e.stiffness,100),Et,qt),this.d=et(ut(e.damping,10),Et,qt),this.v=et(ut(e.velocity,0),-qt,qt),this.w0=0,this.zeta=0,this.wd=0,this.b=0,this.completed=!1,this.solverDuration=0,this.settlingDuration=0,this.parent=null,this.onComplete=e.onComplete||$t,t&&this.calculateSDFromBD(),this.compute(),this.ease=n=>{const i=n*this.settlingDuration,r=this.completed,s=this.pd;return i>=s&&!r&&(this.completed=!0,this.onComplete(this.parent)),i<s&&r&&(this.completed=!1),n===0||n===1?n:this.solve(n*this.solverDuration)}}solve(e){const{zeta:t,w0:n,wd:i,b:r}=this;let s=e;return t<1?s=Ir(-s*t*n)*(1*Tl(i*s)+r*xl(i*s)):t===1?s=(1+r*s)*Ir(-s*n):s=((1+r)*Ir((-t*n+i)*s)+(1-r)*Ir((-t*n-i)*s))/2,1-s}calculateSDFromBD(){const e=ht.timeScale===1?this.pd/tn:this.pd;this.m=1,this.v=0,this.s=oi(2*Ln/e,2),this.bn>=0?this.d=(1-this.bn)*4*Ln/e:this.d=4*Ln/(e*(1+this.bn)),this.s=vt(et(this.s,Et,qt),3),this.d=vt(et(this.d,Et,300),3)}calculateBDFromSD(){const e=2*Ln/si(this.s);this.pd=e*(ht.timeScale===1?tn:1),this.d/(2*si(this.s))<=1?this.bn=1-this.d*e/(4*Ln):this.bn=4*Ln/(this.d*e)-1,this.bn=vt(et(this.bn,-1,1),3),this.pd=vt(et(this.pd,10*ht.timeScale,qt*ht.timeScale),3)}compute(){const{maxRestSteps:e,maxIterations:t,restThreshold:n,timeStep:i,m:r,d:s,s:a,v:o}=this,c=this.w0=et(si(a/r),Et,tn),l=this.zeta=s/(2*si(a*r));l<1?(this.wd=c*si(1-l*l),this.b=(l*c+-o)/this.wd):l===1?(this.wd=0,this.b=-o+c):(this.wd=c*si(l*l-1),this.b=(l*c+-o)/this.wd);let u=0,h=0,d=0;for(;h<=e&&d<=t;)eu(1-this.solve(u))<n?h++:h=0,this.solverDuration=u,u+=i,d++;this.settlingDuration=vt(this.solverDuration*tn,0)*ht.timeScale}get bounce(){return this.bn}set bounce(e){this.bn=et(ut(e,1),-1,1),this.calculateSDFromBD(),this.compute()}get duration(){return this.pd}set duration(e){this.pd=et(ut(e,1),10*ht.timeScale,qt*ht.timeScale),this.calculateSDFromBD(),this.compute()}get stiffness(){return this.s}set stiffness(e){this.s=et(ut(e,100),Et,qt),this.calculateBDFromSD(),this.compute()}get damping(){return this.d}set damping(e){this.d=et(ut(e,10),Et,qt),this.calculateBDFromSD(),this.compute()}get mass(){return this.m}set mass(e){this.m=et(ut(e,1),1,qt),this.compute()}get velocity(){return this.v}set velocity(e){this.v=et(ut(e,0),-qt,qt),this.compute()}},Au=e=>(console.warn("createSpring() is deprecated use spring() instead"),new bu(e));var Ma=1e3,Nn=1001,xa=1002,Wt=1003,Ru=1004,wu=1005,jt=1006,Cu=1007,Da=1008,ui=1009,Pu=1010,Iu=1011,Dl=1012,Du=1013,di=1014,Es=1015,hi=1016,Ll=1017,Nl=1018,Ul=1020,Lu=35902,Nu=35899,Uu=1021,Fu=1022,gr=1023,Sr=1026,Fl=1027,Ou=1028,Ol=1029,vs=1030,Bl=1031,Vl=1033,Bu=33776,Vu=33777,zu=33778,ku=33779,Gu=35840,Hu=35841,Wu=35842,Xu=35843,qu=36196,Yu=37492,Ku=37496,Zu=37488,$u=37489,ju=37490,Ju=37491,Qu=37808,ed=37809,td=37810,nd=37811,id=37812,rd=37813,sd=37814,ad=37815,od=37816,ld=37817,cd=37818,ud=37819,dd=37820,hd=37821,fd=36492,pd=36494,md=36495,_d=36283,vd=36284,gd=36285,Sd=36286,gs=2300,Ta=2301,Fs=2302,po=2303,mo=2400,_o=2401,vo=2402,Md=3200;var dn="srgb",ya="srgb-linear",Ss="linear",Ms="srgb",Os=7680;var xd=35044;var Xi=2e3;function Td(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function yd(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function xs(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function Ed(){const e=xs("canvas");return e.style.display="block",e}var go={},qi=null;function So(...e){const t="THREE."+e.shift();qi?qi("log",t,...e):console.log(t,...e)}function zl(e){const t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){const n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function Ne(...e){e=zl(e);const t="THREE."+e.shift();if(qi)qi("warn",t,...e);else{const n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Ve(...e){e=zl(e);const t="THREE."+e.shift();if(qi)qi("error",t,...e);else{const n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Ea(...e){const t=e.join(" ");t in go||(go[t]=!0,Ne(...e))}function bd(e,t,n){return new Promise(function(i,r){function s(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:r();break;case e.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}var Ad={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},fi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,s=i.length;r<s;r++)i[r].call(this,e);e.target=null}}},Bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Bs=Math.PI/180,ba=180/Math.PI;function xr(){const e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Bt[e&255]+Bt[e>>8&255]+Bt[e>>16&255]+Bt[e>>24&255]+"-"+Bt[t&255]+Bt[t>>8&255]+"-"+Bt[t>>16&15|64]+Bt[t>>24&255]+"-"+Bt[n&63|128]+Bt[n>>8&255]+"-"+Bt[n>>16&255]+Bt[n>>24&255]+Bt[i&255]+Bt[i>>8&255]+Bt[i>>16&255]+Bt[i>>24&255]).toLowerCase()}function je(e,t,n){return Math.max(t,Math.min(n,e))}function Rd(e,t){return(e%t+t)%t}function Vs(e,t,n){return(1-n)*e+n*t}function tr(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("Invalid component type.")}}function Yt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("Invalid component type.")}}var ft=class kl{static#e=kl.prototype.isVector2=!0;constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const n=this.x,i=this.y,r=t.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=je(this.x,t.x,n.x),this.y=je(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=je(this.x,t,n),this.y=je(this.y,t,n),this}clampLength(t,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(t)/n;return Math.acos(je(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-t.x,a=this.y-t.y;return this.x=s*i-a*r+t.x,this.y=s*r+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},pi=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,s,a){let o=n[i+0],c=n[i+1],l=n[i+2],u=n[i+3],h=r[s+0],d=r[s+1],m=r[s+2],S=r[s+3];if(u!==S||o!==h||c!==d||l!==m){let M=o*h+c*d+l*m+u*S;M<0&&(h=-h,d=-d,m=-m,S=-S,M=-M);let p=1-a;if(M<.9995){const f=Math.acos(M),x=Math.sin(f);p=Math.sin(p*f)/x,a=Math.sin(a*f)/x,o=o*p+h*a,c=c*p+d*a,l=l*p+m*a,u=u*p+S*a}else{o=o*p+h*a,c=c*p+d*a,l=l*p+m*a,u=u*p+S*a;const f=1/Math.sqrt(o*o+c*c+l*l+u*u);o*=f,c*=f,l*=f,u*=f}}e[t]=o,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,s){const a=n[i],o=n[i+1],c=n[i+2],l=n[i+3],u=r[s],h=r[s+1],d=r[s+2],m=r[s+3];return e[t]=a*m+l*u+o*d-c*h,e[t+1]=o*m+l*h+c*u-a*d,e[t+2]=c*m+l*d+a*h-o*u,e[t+3]=l*m-a*u-o*h-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,s=e._order,a=Math.cos,o=Math.sin,c=a(n/2),l=a(i/2),u=a(r/2),h=o(n/2),d=o(i/2),m=o(r/2);switch(s){case"XYZ":this._x=h*l*u+c*d*m,this._y=c*d*u-h*l*m,this._z=c*l*m+h*d*u,this._w=c*l*u-h*d*m;break;case"YXZ":this._x=h*l*u+c*d*m,this._y=c*d*u-h*l*m,this._z=c*l*m-h*d*u,this._w=c*l*u+h*d*m;break;case"ZXY":this._x=h*l*u-c*d*m,this._y=c*d*u+h*l*m,this._z=c*l*m+h*d*u,this._w=c*l*u-h*d*m;break;case"ZYX":this._x=h*l*u-c*d*m,this._y=c*d*u+h*l*m,this._z=c*l*m-h*d*u,this._w=c*l*u+h*d*m;break;case"YZX":this._x=h*l*u+c*d*m,this._y=c*d*u+h*l*m,this._z=c*l*m-h*d*u,this._w=c*l*u-h*d*m;break;case"XZY":this._x=h*l*u-c*d*m,this._y=c*d*u-h*l*m,this._z=c*l*m+h*d*u,this._w=c*l*u+h*d*m;break;default:Ne("Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],s=t[1],a=t[5],o=t[9],c=t[2],l=t[6],u=t[10],h=n+a+u;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(l-o)*d,this._y=(r-c)*d,this._z=(s-i)*d}else if(n>a&&n>u){const d=2*Math.sqrt(1+n-a-u);this._w=(l-o)/d,this._x=.25*d,this._y=(i+s)/d,this._z=(r+c)/d}else if(a>u){const d=2*Math.sqrt(1+a-n-u);this._w=(r-c)/d,this._x=(i+s)/d,this._y=.25*d,this._z=(o+l)/d}else{const d=2*Math.sqrt(1+u-n-a);this._w=(s-i)/d,this._x=(r+c)/d,this._y=(o+l)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,s=e._w,a=t._x,o=t._y,c=t._z,l=t._w;return this._x=n*l+s*a+i*c-r*o,this._y=i*l+s*o+r*a-n*c,this._z=r*l+s*c+n*o-i*a,this._w=s*l-n*a-i*o-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,s=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,s=-s,a=-a);let o=1-t;if(a<.9995){const c=Math.acos(a),l=Math.sin(c);o=Math.sin(o*c)/l,t=Math.sin(t*c)/l,this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+r*t,this._w=this._w*o+s*t,this._onChangeCallback()}else this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+r*t,this._w=this._w*o+s*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class Gl{static#e=Gl.prototype.isVector3=!0;constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(Mo.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(Mo.setFromAxisAngle(t,n))}applyMatrix3(t){const n=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const n=this.x,i=this.y,r=this.z,s=t.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(t){const n=this.x,i=this.y,r=this.z,s=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*r-o*i),u=2*(o*n-s*r),h=2*(s*i-a*n);return this.x=n+c*l+a*h-o*u,this.y=i+c*u+o*l-s*h,this.z=r+c*h+s*u-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const n=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=je(this.x,t.x,n.x),this.y=je(this.y,t.y,n.y),this.z=je(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=je(this.x,t,n),this.y=je(this.y,t,n),this.z=je(this.z,t,n),this}clampLength(t,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){const i=t.x,r=t.y,s=t.z,a=n.x,o=n.y,c=n.z;return this.x=r*c-s*o,this.y=s*a-i*c,this.z=i*o-r*a,this}projectOnVector(t){const n=t.lengthSq();if(n===0)return this.set(0,0,0);const i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return zs.copy(this).projectOnVector(t),this.sub(zs)}reflect(t){return this.sub(zs.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(t)/n;return Math.acos(je(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const n=this.x-t.x,i=this.y-t.y,r=this.z-t.z;return n*n+i*i+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){const r=Math.sin(n)*t;return this.x=r*Math.sin(i),this.y=Math.cos(n)*t,this.z=r*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){const n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){const n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),r=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},zs=new W,Mo=new pi,ke=class Hl{static#e=Hl.prototype.isMatrix3=!0;constructor(t,n,i,r,s,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,r,s,a,o,c,l)}set(t,n,i,r,s,a,o,c,l){const u=this.elements;return u[0]=t,u[1]=r,u[2]=o,u[3]=n,u[4]=s,u[5]=c,u[6]=i,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const i=t.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],u=i[4],h=i[7],d=i[2],m=i[5],S=i[8],M=r[0],p=r[3],f=r[6],x=r[1],b=r[4],E=r[7],C=r[2],R=r[5],I=r[8];return s[0]=a*M+o*x+c*C,s[3]=a*p+o*b+c*R,s[6]=a*f+o*E+c*I,s[1]=l*M+u*x+h*C,s[4]=l*p+u*b+h*R,s[7]=l*f+u*E+h*I,s[2]=d*M+m*x+S*C,s[5]=d*p+m*b+S*R,s[8]=d*f+m*E+S*I,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8];return n*a*u-n*o*l-i*s*u+i*o*c+r*s*l-r*a*c}invert(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],h=u*a-o*l,d=o*c-u*s,m=l*s-a*c,S=n*h+i*d+r*m;if(S===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/S;return t[0]=h*M,t[1]=(r*l-u*i)*M,t[2]=(o*i-r*a)*M,t[3]=d*M,t[4]=(u*n-r*c)*M,t[5]=(r*s-o*n)*M,t[6]=m*M,t[7]=(i*c-l*n)*M,t[8]=(a*n-i*s)*M,this}transpose(){let t;const n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,r,s,a,o){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*a+l*o)+a+t,-r*l,r*c,-r*(-l*a+c*o)+o+n,0,0,1),this}scale(t,n){return this.premultiply(ks.makeScale(t,n)),this}rotate(t){return this.premultiply(ks.makeRotation(-t)),this}translate(t,n){return this.premultiply(ks.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){const n=this.elements,i=t.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){const i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},ks=new ke,xo=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),To=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function wd(){const e={enabled:!0,workingColorSpace:ya,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer==="srgb"&&(r.r=Un(r.r),r.g=Un(r.g),r.b=Un(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer==="srgb"&&(r.r=ki(r.r),r.g=ki(r.g),r.b=ki(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===""?Ss:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Ea("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Ea("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(r,s)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[ya]:{primaries:t,whitePoint:i,transfer:Ss,toXYZ:xo,fromXYZ:To,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:dn},outputColorSpaceConfig:{drawingBufferColorSpace:dn}},[dn]:{primaries:t,whitePoint:i,transfer:Ms,toXYZ:xo,fromXYZ:To,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:dn}}}),e}var $e=wd();function Un(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function ki(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var yi,Cd=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{yi===void 0&&(yi=xs("canvas")),yi.width=e.width,yi.height=e.height;const i=yi.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=yi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=xs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let s=0;s<r.length;s++)r[s]=Un(r[s]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Un(t[n]/255)*255):t[n]=Un(t[n]);return{data:t,width:e.width,height:e.height}}else return Ne("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Pd=0,La=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Pd++}),this.uuid=xr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let s=0,a=i.length;s<a;s++)i[s].isDataTexture?r.push(Gs(i[s].image)):r.push(Gs(i[s]))}else r=Gs(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function Gs(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?Cd.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(Ne("Texture: Unable to serialize Texture."),{})}var Id=0,Hs=new W,pn=class ds extends fi{constructor(t=ds.DEFAULT_IMAGE,n=ds.DEFAULT_MAPPING,i=Nn,r=Nn,s=jt,a=Da,o=gr,c=ui,l=ds.DEFAULT_ANISOTROPY,u=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Id++}),this.uuid=xr(),this.name="",this.source=new La(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ft(0,0),this.repeat=new ft(1,1),this.center=new ft(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Hs).x}get height(){return this.source.getSize(Hs).y}get depth(){return this.source.getSize(Hs).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const n in t){const i=t[n];if(i===void 0){Ne(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){Ne(`Texture.setValues(): property '${n}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[n]=i}}toJSON(t){const n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ma:t.x=t.x-Math.floor(t.x);break;case Nn:t.x=t.x<0?0:1;break;case xa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ma:t.y=t.y-Math.floor(t.y);break;case Nn:t.y=t.y<0?0:1;break;case xa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=300;pn.DEFAULT_ANISOTROPY=1;var wt=class Wl{static#e=Wl.prototype.isVector4=!0;constructor(t=0,n=0,i=0,r=1){this.x=t,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,r){return this.x=t,this.y=n,this.z=i,this.w=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const n=this.x,i=this.y,r=this.z,s=this.w,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,r,s;const c=t.elements,l=c[0],u=c[4],h=c[8],d=c[1],m=c[5],S=c[9],M=c[2],p=c[6],f=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-M)<.01&&Math.abs(S-p)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+M)<.1&&Math.abs(S+p)<.1&&Math.abs(l+m+f-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const b=(l+1)/2,E=(m+1)/2,C=(f+1)/2,R=(u+d)/4,I=(h+M)/4,v=(S+p)/4;return b>E&&b>C?b<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(b),r=R/i,s=I/i):E>C?E<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(E),i=R/r,s=v/r):C<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(C),i=I/s,r=v/s),this.set(i,r,s,n),this}let x=Math.sqrt((p-S)*(p-S)+(h-M)*(h-M)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(p-S)/x,this.y=(h-M)/x,this.z=(d-u)/x,this.w=Math.acos((l+m+f-1)/2),this}setFromMatrixPosition(t){const n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=je(this.x,t.x,n.x),this.y=je(this.y,t.y,n.y),this.z=je(this.z,t.z,n.z),this.w=je(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=je(this.x,t,n),this.y=je(this.y,t,n),this.z=je(this.z,t,n),this.w=je(this.w,t,n),this}clampLength(t,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Dd=class extends fi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new wt(0,0,e,t),this.scissorTest=!1,this.viewport=new wt(0,0,e,t),this.textures=[];const i=new pn({width:e,height:t,depth:n.depth}),r=n.count;for(let s=0;s<r;s++)this.textures[s]=i.clone(),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new La(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this}dispose(){this.dispatchEvent({type:"dispose"})}},Tn=class extends Dd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Xl=class extends pn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Ld=class extends pn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ft=class Aa{static#e=Aa.prototype.isMatrix4=!0;constructor(t,n,i,r,s,a,o,c,l,u,h,d,m,S,M,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,r,s,a,o,c,l,u,h,d,m,S,M,p)}set(t,n,i,r,s,a,o,c,l,u,h,d,m,S,M,p){const f=this.elements;return f[0]=t,f[4]=n,f[8]=i,f[12]=r,f[1]=s,f[5]=a,f[9]=o,f[13]=c,f[2]=l,f[6]=u,f[10]=h,f[14]=d,f[3]=m,f[7]=S,f[11]=M,f[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Aa().fromArray(this.elements)}copy(t){const n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){const n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){const n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinant()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinant()===0)return this.identity();const n=this.elements,i=t.elements,r=1/Ei.setFromMatrixColumn(t,0).length(),s=1/Ei.setFromMatrixColumn(t,1).length(),a=1/Ei.setFromMatrixColumn(t,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){const n=this.elements,i=t.x,r=t.y,s=t.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(r),l=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(t.order==="XYZ"){const d=a*u,m=a*h,S=o*u,M=o*h;n[0]=c*u,n[4]=-c*h,n[8]=l,n[1]=m+S*l,n[5]=d-M*l,n[9]=-o*c,n[2]=M-d*l,n[6]=S+m*l,n[10]=a*c}else if(t.order==="YXZ"){const d=c*u,m=c*h,S=l*u,M=l*h;n[0]=d+M*o,n[4]=S*o-m,n[8]=a*l,n[1]=a*h,n[5]=a*u,n[9]=-o,n[2]=m*o-S,n[6]=M+d*o,n[10]=a*c}else if(t.order==="ZXY"){const d=c*u,m=c*h,S=l*u,M=l*h;n[0]=d-M*o,n[4]=-a*h,n[8]=S+m*o,n[1]=m+S*o,n[5]=a*u,n[9]=M-d*o,n[2]=-a*l,n[6]=o,n[10]=a*c}else if(t.order==="ZYX"){const d=a*u,m=a*h,S=o*u,M=o*h;n[0]=c*u,n[4]=S*l-m,n[8]=d*l+M,n[1]=c*h,n[5]=M*l+d,n[9]=m*l-S,n[2]=-l,n[6]=o*c,n[10]=a*c}else if(t.order==="YZX"){const d=a*c,m=a*l,S=o*c,M=o*l;n[0]=c*u,n[4]=M-d*h,n[8]=S*h+m,n[1]=h,n[5]=a*u,n[9]=-o*u,n[2]=-l*u,n[6]=m*h+S,n[10]=d-M*h}else if(t.order==="XZY"){const d=a*c,m=a*l,S=o*c,M=o*l;n[0]=c*u,n[4]=-h,n[8]=l*u,n[1]=d*h+M,n[5]=a*u,n[9]=m*h-S,n[2]=S*h-m,n[6]=o*u,n[10]=M*h+d}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Nd,t,Ud)}lookAt(t,n,i){const r=this.elements;return Kt.subVectors(t,n),Kt.lengthSq()===0&&(Kt.z=1),Kt.normalize(),kn.crossVectors(i,Kt),kn.lengthSq()===0&&(Math.abs(i.z)===1?Kt.x+=1e-4:Kt.z+=1e-4,Kt.normalize(),kn.crossVectors(i,Kt)),kn.normalize(),Or.crossVectors(Kt,kn),r[0]=kn.x,r[4]=Or.x,r[8]=Kt.x,r[1]=kn.y,r[5]=Or.y,r[9]=Kt.y,r[2]=kn.z,r[6]=Or.z,r[10]=Kt.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const i=t.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],u=i[1],h=i[5],d=i[9],m=i[13],S=i[2],M=i[6],p=i[10],f=i[14],x=i[3],b=i[7],E=i[11],C=i[15],R=r[0],I=r[4],v=r[8],y=r[12],Y=r[1],A=r[5],H=r[9],j=r[13],F=r[2],O=r[6],z=r[10],V=r[14],ee=r[3],q=r[7],ne=r[11],de=r[15];return s[0]=a*R+o*Y+c*F+l*ee,s[4]=a*I+o*A+c*O+l*q,s[8]=a*v+o*H+c*z+l*ne,s[12]=a*y+o*j+c*V+l*de,s[1]=u*R+h*Y+d*F+m*ee,s[5]=u*I+h*A+d*O+m*q,s[9]=u*v+h*H+d*z+m*ne,s[13]=u*y+h*j+d*V+m*de,s[2]=S*R+M*Y+p*F+f*ee,s[6]=S*I+M*A+p*O+f*q,s[10]=S*v+M*H+p*z+f*ne,s[14]=S*y+M*j+p*V+f*de,s[3]=x*R+b*Y+E*F+C*ee,s[7]=x*I+b*A+E*O+C*q,s[11]=x*v+b*H+E*z+C*ne,s[15]=x*y+b*j+E*V+C*de,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){const t=this.elements,n=t[0],i=t[4],r=t[8],s=t[12],a=t[1],o=t[5],c=t[9],l=t[13],u=t[2],h=t[6],d=t[10],m=t[14],S=t[3],M=t[7],p=t[11],f=t[15],x=c*m-l*d,b=o*m-l*h,E=o*d-c*h,C=a*m-l*u,R=a*d-c*u,I=a*h-o*u;return n*(M*x-p*b+f*E)-i*(S*x-p*C+f*R)+r*(S*b-M*C+f*I)-s*(S*E-M*R+p*I)}transpose(){const t=this.elements;let n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){const r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=n,r[14]=i),this}invert(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],h=t[9],d=t[10],m=t[11],S=t[12],M=t[13],p=t[14],f=t[15],x=n*o-i*a,b=n*c-r*a,E=n*l-s*a,C=i*c-r*o,R=i*l-s*o,I=r*l-s*c,v=u*M-h*S,y=u*p-d*S,Y=u*f-m*S,A=h*p-d*M,H=h*f-m*M,j=d*f-m*p,F=x*j-b*H+E*A+C*Y-R*y+I*v;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/F;return t[0]=(o*j-c*H+l*A)*O,t[1]=(r*H-i*j-s*A)*O,t[2]=(M*I-p*R+f*C)*O,t[3]=(d*R-h*I-m*C)*O,t[4]=(c*Y-a*j-l*y)*O,t[5]=(n*j-r*Y+s*y)*O,t[6]=(p*E-S*I-f*b)*O,t[7]=(u*I-d*E+m*b)*O,t[8]=(a*H-o*Y+l*v)*O,t[9]=(i*Y-n*H-s*v)*O,t[10]=(S*R-M*E+f*x)*O,t[11]=(h*E-u*R-m*x)*O,t[12]=(o*y-a*A-c*v)*O,t[13]=(n*A-i*y+r*v)*O,t[14]=(M*b-S*C-p*x)*O,t[15]=(u*C-h*b+d*x)*O,this}scale(t){const n=this.elements,i=t.x,r=t.y,s=t.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){const n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=t.x,o=t.y,c=t.z,l=s*a,u=s*o;return this.set(l*a+i,l*o-r*c,l*c+r*o,0,l*o+r*c,u*o+i,u*c-r*a,0,l*c-r*o,u*c+r*a,s*c*c+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,r,s,a){return this.set(1,i,s,0,t,1,a,0,n,r,1,0,0,0,0,1),this}compose(t,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,c=n._w,l=s+s,u=a+a,h=o+o,d=s*l,m=s*u,S=s*h,M=a*u,p=a*h,f=o*h,x=c*l,b=c*u,E=c*h,C=i.x,R=i.y,I=i.z;return r[0]=(1-(M+f))*C,r[1]=(m+E)*C,r[2]=(S-b)*C,r[3]=0,r[4]=(m-E)*R,r[5]=(1-(d+f))*R,r[6]=(p+x)*R,r[7]=0,r[8]=(S+b)*I,r[9]=(p-x)*I,r[10]=(1-(d+M))*I,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,n,i){const r=this.elements;t.x=r[12],t.y=r[13],t.z=r[14];const s=this.determinant();if(s===0)return i.set(1,1,1),n.identity(),this;let a=Ei.set(r[0],r[1],r[2]).length();const o=Ei.set(r[4],r[5],r[6]).length(),c=Ei.set(r[8],r[9],r[10]).length();s<0&&(a=-a),on.copy(this);const l=1/a,u=1/o,h=1/c;return on.elements[0]*=l,on.elements[1]*=l,on.elements[2]*=l,on.elements[4]*=u,on.elements[5]*=u,on.elements[6]*=u,on.elements[8]*=h,on.elements[9]*=h,on.elements[10]*=h,n.setFromRotationMatrix(on),i.x=a,i.y=o,i.z=c,this}makePerspective(t,n,i,r,s,a,o=Xi,c=!1){const l=this.elements,u=2*s/(n-t),h=2*s/(i-r),d=(n+t)/(n-t),m=(i+r)/(i-r);let S,M;if(c)S=s/(a-s),M=a*s/(a-s);else if(o===2e3)S=-(a+s)/(a-s),M=-2*a*s/(a-s);else if(o===2001)S=-a/(a-s),M=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=m,l[13]=0,l[2]=0,l[6]=0,l[10]=S,l[14]=M,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,n,i,r,s,a,o=Xi,c=!1){const l=this.elements,u=2/(n-t),h=2/(i-r),d=-(n+t)/(n-t),m=-(i+r)/(i-r);let S,M;if(c)S=1/(a-s),M=a/(a-s);else if(o===2e3)S=-2/(a-s),M=-(a+s)/(a-s);else if(o===2001)S=-1/(a-s),M=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=m,l[2]=0,l[6]=0,l[10]=S,l[14]=M,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const n=this.elements,i=t.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){const i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}},Ei=new W,on=new Ft,Nd=new W(0,0,0),Ud=new W(1,1,1),kn=new W,Or=new W,Kt=new W,yo=new Ft,Eo=new pi,Mr=class ql{constructor(t=0,n=0,i=0,r=ql.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,r=this._order){return this._x=t,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){const r=t.elements,s=r[0],a=r[4],o=r[8],c=r[1],l=r[5],u=r[9],h=r[2],d=r[6],m=r[10];switch(n){case"XYZ":this._y=Math.asin(je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(je(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,m),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,m),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(je(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,m),this._y=0);break;default:Ne("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return yo.makeRotationFromQuaternion(t),this.setFromRotationMatrix(yo,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return Eo.setFromEuler(this),this.setFromQuaternion(Eo,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Mr.DEFAULT_ORDER="XYZ";var Yl=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Fd=0,bo=new W,bi=new pi,wn=new Ft,Br=new W,nr=new W,Od=new W,Bd=new pi,Ao=new W(1,0,0),Ro=new W(0,1,0),wo=new W(0,0,1),Co={type:"added"},Vd={type:"removed"},Ai={type:"childadded",child:null},Ws={type:"childremoved",child:null},On=class hs extends fi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Fd++}),this.uuid=xr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=hs.DEFAULT_UP.clone();const t=new W,n=new Mr,i=new pi,r=new W(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ft},normalMatrix:{value:new ke}}),this.matrix=new Ft,this.matrixWorld=new Ft,this.matrixAutoUpdate=hs.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=hs.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return bi.setFromAxisAngle(t,n),this.quaternion.multiply(bi),this}rotateOnWorldAxis(t,n){return bi.setFromAxisAngle(t,n),this.quaternion.premultiply(bi),this}rotateX(t){return this.rotateOnAxis(Ao,t)}rotateY(t){return this.rotateOnAxis(Ro,t)}rotateZ(t){return this.rotateOnAxis(wo,t)}translateOnAxis(t,n){return bo.copy(t).applyQuaternion(this.quaternion),this.position.add(bo.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(Ao,t)}translateY(t){return this.translateOnAxis(Ro,t)}translateZ(t){return this.translateOnAxis(wo,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(wn.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Br.copy(t):Br.set(t,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),nr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wn.lookAt(nr,Br,this.up):wn.lookAt(Br,nr,this.up),this.quaternion.setFromRotationMatrix(wn),r&&(wn.extractRotation(r.matrixWorld),bi.setFromRotationMatrix(wn),this.quaternion.premultiply(bi.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Ve("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Co),Ai.child=t,this.dispatchEvent(Ai),Ai.child=null):Ve("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(Vd),Ws.child=t,this.dispatchEvent(Ws),Ws.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),wn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),wn.multiply(t.parent.matrixWorld)),t.applyMatrix4(wn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Co),Ai.child=t,this.dispatchEvent(Ai),Ai.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const s=this.children[i].getObjectByProperty(t,n);if(s!==void 0)return s}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,t,Od),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,Bd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(t){t(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(t)}traverseAncestors(t){const n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const n=t.x,i=t.y,r=t.z,s=this.matrix.elements;s[12]+=n-s[0]*n-s[4]*i-s[8]*r,s[13]+=i-s[1]*n-s[5]*i-s[9]*r,s[14]+=r-s[2]*n-s[6]*i-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(t){const n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(t),r.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(t.shapes,h)}else s(t.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(t.materials,this.material[c]));r.material=o}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];r.animations.push(s(t.animations,c))}}if(n){const o=a(t.geometries),c=a(t.materials),l=a(t.textures),u=a(t.images),h=a(t.shapes),d=a(t.skeletons),m=a(t.animations),S=a(t.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),m.length>0&&(i.animations=m),S.length>0&&(i.nodes=S)}return i.object=r,i;function a(o){const c=[];for(const l in o){const u=o[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){const r=t.children[i];this.add(r.clone())}return this}};On.DEFAULT_UP=new W(0,1,0);On.DEFAULT_MATRIX_AUTO_UPDATE=!0;On.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Vr=class extends On{constructor(){super(),this.isGroup=!0,this.type="Group"}},zd={type:"move"},Xs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Vr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Vr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Vr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,s=null;const a=this._targetRay,o=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){s=!0;for(const S of e.hand.values()){const M=t.getJointPose(S,n),p=this._getHandJoint(c,S);M!==null&&(p.matrix.fromArray(M.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=M.radius),p.visible=M!==null}const l=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],h=l.position.distanceTo(u.position),d=.02,m=.005;c.inputState.pinching&&h>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else o!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,o.eventsEnabled&&o.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(zd)))}return a!==null&&(a.visible=i!==null),o!==null&&(o.visible=r!==null),c!==null&&(c.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Vr;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Kl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gn={h:0,s:0,l:0},zr={h:0,s:0,l:0};function qs(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var rt=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=$e.workingColorSpace){if(e=Rd(e,1),t=je(t,0,1),n=je(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,s=2*n-r;this.r=qs(s,r,e+1/3),this.g=qs(s,r,e),this.b=qs(s,r,e-1/3)}return $e.colorSpaceToWorking(this,i),this}setStyle(e,t=dn){function n(r){r!==void 0&&parseFloat(r)<1&&Ne("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const s=i[1],a=i[2];switch(s){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ne("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],s=r.length;if(s===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(r,16),t);Ne("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dn){const n=Kl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ne("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Un(e.r),this.g=Un(e.g),this.b=Un(e.b),this}copyLinearToSRGB(e){return this.r=ki(e.r),this.g=ki(e.g),this.b=ki(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dn){return $e.workingToColorSpace(Vt.copy(this),e),Math.round(je(Vt.r*255,0,255))*65536+Math.round(je(Vt.g*255,0,255))*256+Math.round(je(Vt.b*255,0,255))}getHexString(e=dn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Vt.copy(this),t);const n=Vt.r,i=Vt.g,r=Vt.b,s=Math.max(n,i,r),a=Math.min(n,i,r);let o,c;const l=(a+s)/2;if(a===s)o=0,c=0;else{const u=s-a;switch(c=l<=.5?u/(s+a):u/(2-s-a),s){case n:o=(i-r)/u+(i<r?6:0);break;case i:o=(r-n)/u+2;break;case r:o=(n-i)/u+4;break}o/=6}return e.h=o,e.s=c,e.l=l,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Vt.copy(this),t),e.r=Vt.r,e.g=Vt.g,e.b=Vt.b,e}getStyle(e=dn){$e.workingToColorSpace(Vt.copy(this),e);const t=Vt.r,n=Vt.g,i=Vt.b;return e!=="srgb"?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Gn),this.setHSL(Gn.h+e,Gn.s+t,Gn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Gn),e.getHSL(zr);const n=Vs(Gn.h,zr.h,t),i=Vs(Gn.s,zr.s,t),r=Vs(Gn.l,zr.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Vt=new rt;rt.NAMES=Kl;var kd=class extends On{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mr,this.environmentIntensity=1,this.environmentRotation=new Mr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},ln=new W,Cn=new W,Ys=new W,Pn=new W,Ri=new W,wi=new W,Po=new W,Ks=new W,Zs=new W,$s=new W,js=new wt,Js=new wt,Qs=new wt,ir=class Oi{constructor(t=new W,n=new W,i=new W){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,r){r.subVectors(i,n),ln.subVectors(t,n),r.cross(ln);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,n,i,r,s){ln.subVectors(r,n),Cn.subVectors(i,n),Ys.subVectors(t,n);const a=ln.dot(ln),o=ln.dot(Cn),c=ln.dot(Ys),l=Cn.dot(Cn),u=Cn.dot(Ys),h=a*l-o*o;if(h===0)return s.set(0,0,0),null;const d=1/h,m=(l*c-o*u)*d,S=(a*u-o*c)*d;return s.set(1-m-S,S,m)}static containsPoint(t,n,i,r){return this.getBarycoord(t,n,i,r,Pn)===null?!1:Pn.x>=0&&Pn.y>=0&&Pn.x+Pn.y<=1}static getInterpolation(t,n,i,r,s,a,o,c){return this.getBarycoord(t,n,i,r,Pn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Pn.x),c.addScaledVector(a,Pn.y),c.addScaledVector(o,Pn.z),c)}static getInterpolatedAttribute(t,n,i,r,s,a){return js.setScalar(0),Js.setScalar(0),Qs.setScalar(0),js.fromBufferAttribute(t,n),Js.fromBufferAttribute(t,i),Qs.fromBufferAttribute(t,r),a.setScalar(0),a.addScaledVector(js,s.x),a.addScaledVector(Js,s.y),a.addScaledVector(Qs,s.z),a}static isFrontFacing(t,n,i,r){return ln.subVectors(i,n),Cn.subVectors(t,n),ln.cross(Cn).dot(r)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,r){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,n,i,r){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ln.subVectors(this.c,this.b),Cn.subVectors(this.a,this.b),ln.cross(Cn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Oi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return Oi.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,r,s){return Oi.getInterpolation(t,this.a,this.b,this.c,n,i,r,s)}containsPoint(t){return Oi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Oi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){const i=this.a,r=this.b,s=this.c;let a,o;Ri.subVectors(r,i),wi.subVectors(s,i),Ks.subVectors(t,i);const c=Ri.dot(Ks),l=wi.dot(Ks);if(c<=0&&l<=0)return n.copy(i);Zs.subVectors(t,r);const u=Ri.dot(Zs),h=wi.dot(Zs);if(u>=0&&h<=u)return n.copy(r);const d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return a=c/(c-u),n.copy(i).addScaledVector(Ri,a);$s.subVectors(t,s);const m=Ri.dot($s),S=wi.dot($s);if(S>=0&&m<=S)return n.copy(s);const M=m*l-c*S;if(M<=0&&l>=0&&S<=0)return o=l/(l-S),n.copy(i).addScaledVector(wi,o);const p=u*S-m*h;if(p<=0&&h-u>=0&&m-S>=0)return Po.subVectors(s,r),o=(h-u)/(h-u+(m-S)),n.copy(r).addScaledVector(Po,o);const f=1/(p+M+d);return a=M*f,o=d*f,n.copy(i).addScaledVector(Ri,a).addScaledVector(wi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Tr=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(cn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(cn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=cn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let s=0,a=r.count;s<a;s++)e.isMesh===!0?e.getVertexPosition(s,cn):cn.fromBufferAttribute(r,s),cn.applyMatrix4(e.matrixWorld),this.expandByPoint(cn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),kr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),kr.copy(n.boundingBox)),kr.applyMatrix4(e.matrixWorld),this.union(kr)}const i=e.children;for(let r=0,s=i.length;r<s;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,cn),cn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(rr),Gr.subVectors(this.max,rr),Ci.subVectors(e.a,rr),Pi.subVectors(e.b,rr),Ii.subVectors(e.c,rr),Hn.subVectors(Pi,Ci),Wn.subVectors(Ii,Pi),ti.subVectors(Ci,Ii);let t=[0,-Hn.z,Hn.y,0,-Wn.z,Wn.y,0,-ti.z,ti.y,Hn.z,0,-Hn.x,Wn.z,0,-Wn.x,ti.z,0,-ti.x,-Hn.y,Hn.x,0,-Wn.y,Wn.x,0,-ti.y,ti.x,0];return!ea(t,Ci,Pi,Ii,Gr)||(t=[1,0,0,0,1,0,0,0,1],!ea(t,Ci,Pi,Ii,Gr))?!1:(Hr.crossVectors(Hn,Wn),t=[Hr.x,Hr.y,Hr.z],ea(t,Ci,Pi,Ii,Gr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,cn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(cn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(In[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),In[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),In[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),In[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),In[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),In[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),In[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),In[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(In),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},In=[new W,new W,new W,new W,new W,new W,new W,new W],cn=new W,kr=new Tr,Ci=new W,Pi=new W,Ii=new W,Hn=new W,Wn=new W,ti=new W,rr=new W,Gr=new W,Hr=new W,ni=new W;function ea(e,t,n,i,r){for(let s=0,a=e.length-3;s<=a;s+=3){ni.fromArray(e,s);const o=r.x*Math.abs(ni.x)+r.y*Math.abs(ni.y)+r.z*Math.abs(ni.z),c=t.dot(ni),l=n.dot(ni),u=i.dot(ni);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var At=new W,Wr=new ft,Gd=0,yn=class extends fi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Gd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=xd,this.updateRanges=[],this.gpuType=Es,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Wr.fromBufferAttribute(this,t),Wr.applyMatrix3(e),this.setXY(t,Wr.x,Wr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyMatrix3(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyMatrix4(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyNormalMatrix(e),this.setXYZ(t,At.x,At.y,At.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.transformDirection(e),this.setXYZ(t,At.x,At.y,At.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=tr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Yt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=tr(t,this.array)),t}setX(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=tr(t,this.array)),t}setY(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=tr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=tr(t,this.array)),t}setW(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Yt(t,this.array),n=Yt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Yt(t,this.array),n=Yt(n,this.array),i=Yt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=Yt(t,this.array),n=Yt(n,this.array),i=Yt(i,this.array),r=Yt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}},Zl=class extends yn{constructor(e,t,n){super(new Uint16Array(e),t,n)}},$l=class extends yn{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Fn=class extends yn{constructor(e,t,n){super(new Float32Array(e),t,n)}},Hd=new Tr,sr=new W,ta=new W,Na=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Hd.setFromPoints(e).getCenter(n);let i=0;for(let r=0,s=e.length;r<s;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;sr.subVectors(e,this.center);const t=sr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(sr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ta.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(sr.copy(e.center).add(ta)),this.expandByPoint(sr.copy(e.center).sub(ta))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Wd=0,en=new Ft,na=new On,Di=new W,Zt=new Tr,ar=new Tr,Dt=new W,mi=class jl extends fi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=xr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Td(t)?$l:Zl)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new ke().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return en.makeRotationFromQuaternion(t),this.applyMatrix4(en),this}rotateX(t){return en.makeRotationX(t),this.applyMatrix4(en),this}rotateY(t){return en.makeRotationY(t),this.applyMatrix4(en),this}rotateZ(t){return en.makeRotationZ(t),this.applyMatrix4(en),this}translate(t,n,i){return en.makeTranslation(t,n,i),this.applyMatrix4(en),this}scale(t,n,i){return en.makeScale(t,n,i),this.applyMatrix4(en),this}lookAt(t){return na.lookAt(t),na.updateMatrix(),this.applyMatrix4(na.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Di).negate(),this.translate(Di.x,Di.y,Di.z),this}setFromPoints(t){const n=this.getAttribute("position");if(n===void 0){const i=[];for(let r=0,s=t.length;r<s;r++){const a=t[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Fn(i,3))}else{const i=Math.min(t.length,n.count);for(let r=0;r<i;r++){const s=t[r];n.setXYZ(r,s.x,s.y,s.z||0)}t.length>n.count&&Ne("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Tr);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];Zt.setFromBufferAttribute(s),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,Zt.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,Zt.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(Zt.min),this.boundingBox.expandByPoint(Zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ve('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Na);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new W,1/0);return}if(t){const i=this.boundingSphere.center;if(Zt.setFromBufferAttribute(t),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];ar.setFromBufferAttribute(o),this.morphTargetsRelative?(Dt.addVectors(Zt.min,ar.min),Zt.expandByPoint(Dt),Dt.addVectors(Zt.max,ar.max),Zt.expandByPoint(Dt)):(Zt.expandByPoint(ar.min),Zt.expandByPoint(ar.max))}Zt.getCenter(i);let r=0;for(let s=0,a=t.count;s<a;s++)Dt.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(Dt));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Dt.fromBufferAttribute(o,l),c&&(Di.fromBufferAttribute(t,l),Dt.add(Di)),r=Math.max(r,i.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ve('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Ve("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new yn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let v=0;v<i.count;v++)o[v]=new W,c[v]=new W;const l=new W,u=new W,h=new W,d=new ft,m=new ft,S=new ft,M=new W,p=new W;function f(v,y,Y){l.fromBufferAttribute(i,v),u.fromBufferAttribute(i,y),h.fromBufferAttribute(i,Y),d.fromBufferAttribute(s,v),m.fromBufferAttribute(s,y),S.fromBufferAttribute(s,Y),u.sub(l),h.sub(l),m.sub(d),S.sub(d);const A=1/(m.x*S.y-S.x*m.y);isFinite(A)&&(M.copy(u).multiplyScalar(S.y).addScaledVector(h,-m.y).multiplyScalar(A),p.copy(h).multiplyScalar(m.x).addScaledVector(u,-S.x).multiplyScalar(A),o[v].add(M),o[y].add(M),o[Y].add(M),c[v].add(p),c[y].add(p),c[Y].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let v=0,y=x.length;v<y;++v){const Y=x[v],A=Y.start,H=Y.count;for(let j=A,F=A+H;j<F;j+=3)f(t.getX(j+0),t.getX(j+1),t.getX(j+2))}const b=new W,E=new W,C=new W,R=new W;function I(v){C.fromBufferAttribute(r,v),R.copy(C);const y=o[v];b.copy(y),b.sub(C.multiplyScalar(C.dot(y))).normalize(),E.crossVectors(R,y);const Y=E.dot(c[v])<0?-1:1;a.setXYZW(v,b.x,b.y,b.z,Y)}for(let v=0,y=x.length;v<y;++v){const Y=x[v],A=Y.start,H=Y.count;for(let j=A,F=A+H;j<F;j+=3)I(t.getX(j+0)),I(t.getX(j+1)),I(t.getX(j+2))}}computeVertexNormals(){const t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new yn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let d=0,m=i.count;d<m;d++)i.setXYZ(d,0,0,0);const r=new W,s=new W,a=new W,o=new W,c=new W,l=new W,u=new W,h=new W;if(t)for(let d=0,m=t.count;d<m;d+=3){const S=t.getX(d+0),M=t.getX(d+1),p=t.getX(d+2);r.fromBufferAttribute(n,S),s.fromBufferAttribute(n,M),a.fromBufferAttribute(n,p),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),o.fromBufferAttribute(i,S),c.fromBufferAttribute(i,M),l.fromBufferAttribute(i,p),o.add(u),c.add(u),l.add(u),i.setXYZ(S,o.x,o.y,o.z),i.setXYZ(M,c.x,c.y,c.z),i.setXYZ(p,l.x,l.y,l.z)}else for(let d=0,m=n.count;d<m;d+=3)r.fromBufferAttribute(n,d+0),s.fromBufferAttribute(n,d+1),a.fromBufferAttribute(n,d+2),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)Dt.fromBufferAttribute(t,n),Dt.normalize(),t.setXYZ(n,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function t(o,c){const l=o.array,u=o.itemSize,h=o.normalized,d=new l.constructor(c.length*u);let m=0,S=0;for(let M=0,p=c.length;M<p;M++){o.isInterleavedBufferAttribute?m=c[M]*o.data.stride+o.offset:m=c[M]*u;for(let f=0;f<u;f++)d[S++]=l[m++]}return new yn(d,u,h)}if(this.index===null)return Ne("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new jl,i=this.index.array,r=this.attributes;for(const o in r){const c=r[o],l=t(c,i);n.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let u=0,h=l.length;u<h;u++){const d=l[u],m=t(d,i);c.push(m)}n.morphAttributes[o]=c}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];n.addGroup(l.start,l.count,l.materialIndex)}return n}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const c in i){const l=i[c];t.data.attributes[c]=l.toJSON(t.data)}const r={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){const m=l[h];u.push(m.toJSON(t.data))}u.length>0&&(r[c]=u,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone());const r=t.attributes;for(const l in r){const u=r[l];this.setAttribute(l,u.clone(n))}const s=t.morphAttributes;for(const l in s){const u=[],h=s[l];for(let d=0,m=h.length;d<m;d++)u.push(h[d].clone(n));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let l=0,u=a.length;l<u;l++){const h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Xd=0,bs=class extends fi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=xr(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new rt(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Os,this.stencilZFail=Os,this.stencilZPass=Os,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Ne(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Ne(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const s=[];for(const a in r){const o=r[a];delete o.metadata,s.push(o)}return s}if(t){const r=i(e.textures),s=i(e.images);r.length>0&&(n.textures=r),s.length>0&&(n.images=s)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Dn=new W,ia=new W,Xr=new W,Xn=new W,ra=new W,qr=new W,sa=new W,qd=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Dn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Dn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Dn.copy(this.origin).addScaledVector(this.direction,t),Dn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){ia.copy(e).add(t).multiplyScalar(.5),Xr.copy(t).sub(e).normalize(),Xn.copy(this.origin).sub(ia);const r=e.distanceTo(t)*.5,s=-this.direction.dot(Xr),a=Xn.dot(this.direction),o=-Xn.dot(Xr),c=Xn.lengthSq(),l=Math.abs(1-s*s);let u,h,d,m;if(l>0)if(u=s*o-a,h=s*a-o,m=r*l,u>=0)if(h>=-m)if(h<=m){const S=1/l;u*=S,h*=S,d=u*(u+s*h+2*a)+h*(s*u+h+2*o)+c}else h=r,u=Math.max(0,-(s*h+a)),d=-u*u+h*(h+2*o)+c;else h=-r,u=Math.max(0,-(s*h+a)),d=-u*u+h*(h+2*o)+c;else h<=-m?(u=Math.max(0,-(-s*r+a)),h=u>0?-r:Math.min(Math.max(-r,-o),r),d=-u*u+h*(h+2*o)+c):h<=m?(u=0,h=Math.min(Math.max(-r,-o),r),d=h*(h+2*o)+c):(u=Math.max(0,-(s*r+a)),h=u>0?r:Math.min(Math.max(-r,-o),r),d=-u*u+h*(h+2*o)+c);else h=s>0?-r:r,u=Math.max(0,-(s*h+a)),d=-u*u+h*(h+2*o)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(ia).addScaledVector(Xr,h),d}intersectSphere(e,t){Dn.subVectors(e.center,this.origin);const n=Dn.dot(this.direction),i=Dn.dot(Dn)-n*n,r=e.radius*e.radius;if(i>r)return null;const s=Math.sqrt(r-i),a=n-s,o=n+s;return o<0?null:a<0?this.at(o,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,s,a,o;const c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,i=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,i=(e.min.x-h.x)*c),l>=0?(r=(e.min.y-h.y)*l,s=(e.max.y-h.y)*l):(r=(e.max.y-h.y)*l,s=(e.min.y-h.y)*l),n>s||r>i||((r>n||isNaN(n))&&(n=r),(s<i||isNaN(i))&&(i=s),u>=0?(a=(e.min.z-h.z)*u,o=(e.max.z-h.z)*u):(a=(e.max.z-h.z)*u,o=(e.min.z-h.z)*u),n>o||a>i)||((a>n||n!==n)&&(n=a),(o<i||i!==i)&&(i=o),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Dn)!==null}intersectTriangle(e,t,n,i,r){ra.subVectors(t,e),qr.subVectors(n,e),sa.crossVectors(ra,qr);let s=this.direction.dot(sa),a;if(s>0){if(i)return null;a=1}else if(s<0)a=-1,s=-s;else return null;Xn.subVectors(this.origin,e);const o=a*this.direction.dot(qr.crossVectors(Xn,qr));if(o<0)return null;const c=a*this.direction.dot(ra.cross(Xn));if(c<0||o+c>s)return null;const l=-a*Xn.dot(sa);return l<0?null:this.at(l/s,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Jl=class extends bs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new rt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mr,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Io=new Ft,ii=new qd,Yr=new Na,Do=new W,Kr=new W,Zr=new W,$r=new W,aa=new W,jr=new W,Lo=new W,Jr=new W,En=class extends On{constructor(e=new mi,t=new Jl){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){const n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let i=0,r=n.length;i<r;i++){const s=n[i].name||String(i);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=i}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,s=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){jr.set(0,0,0);for(let o=0,c=r.length;o<c;o++){const l=a[o],u=r[o];l!==0&&(aa.fromBufferAttribute(u,e),s?jr.addScaledVector(aa,l):jr.addScaledVector(aa.sub(t),l))}t.add(jr)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Yr.copy(n.boundingSphere),Yr.applyMatrix4(r),ii.copy(e.ray).recast(e.near),!(Yr.containsPoint(ii.origin)===!1&&(ii.intersectSphere(Yr,Do)===null||ii.origin.distanceToSquared(Do)>(e.far-e.near)**2))&&(Io.copy(r).invert(),ii.copy(e.ray).applyMatrix4(Io),!(n.boundingBox!==null&&ii.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ii)))}_computeIntersections(e,t,n){let i;const r=this.geometry,s=this.material,a=r.index,o=r.attributes.position,c=r.attributes.uv,l=r.attributes.uv1,u=r.attributes.normal,h=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(s))for(let m=0,S=h.length;m<S;m++){const M=h[m],p=s[M.materialIndex],f=Math.max(M.start,d.start),x=Math.min(a.count,Math.min(M.start+M.count,d.start+d.count));for(let b=f,E=x;b<E;b+=3){const C=a.getX(b),R=a.getX(b+1),I=a.getX(b+2);i=Qr(this,p,e,n,c,l,u,C,R,I),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=M.materialIndex,t.push(i))}}else{const m=Math.max(0,d.start),S=Math.min(a.count,d.start+d.count);for(let M=m,p=S;M<p;M+=3){const f=a.getX(M),x=a.getX(M+1),b=a.getX(M+2);i=Qr(this,s,e,n,c,l,u,f,x,b),i&&(i.faceIndex=Math.floor(M/3),t.push(i))}}else if(o!==void 0)if(Array.isArray(s))for(let m=0,S=h.length;m<S;m++){const M=h[m],p=s[M.materialIndex],f=Math.max(M.start,d.start),x=Math.min(o.count,Math.min(M.start+M.count,d.start+d.count));for(let b=f,E=x;b<E;b+=3){const C=b,R=b+1,I=b+2;i=Qr(this,p,e,n,c,l,u,C,R,I),i&&(i.faceIndex=Math.floor(b/3),i.face.materialIndex=M.materialIndex,t.push(i))}}else{const m=Math.max(0,d.start),S=Math.min(o.count,d.start+d.count);for(let M=m,p=S;M<p;M+=3){const f=M,x=M+1,b=M+2;i=Qr(this,s,e,n,c,l,u,f,x,b),i&&(i.faceIndex=Math.floor(M/3),t.push(i))}}}};function Yd(e,t,n,i,r,s,a,o){let c;if(t.side===1?c=i.intersectTriangle(a,s,r,!0,o):c=i.intersectTriangle(r,s,a,t.side===0,o),c===null)return null;Jr.copy(o),Jr.applyMatrix4(e.matrixWorld);const l=n.ray.origin.distanceTo(Jr);return l<n.near||l>n.far?null:{distance:l,point:Jr.clone(),object:e}}function Qr(e,t,n,i,r,s,a,o,c,l){e.getVertexPosition(o,Kr),e.getVertexPosition(c,Zr),e.getVertexPosition(l,$r);const u=Yd(e,t,n,i,Kr,Zr,$r,Lo);if(u){const h=new W;ir.getBarycoord(Lo,Kr,Zr,$r,h),r&&(u.uv=ir.getInterpolatedAttribute(r,o,c,l,h,new ft)),s&&(u.uv1=ir.getInterpolatedAttribute(s,o,c,l,h,new ft)),a&&(u.normal=ir.getInterpolatedAttribute(a,o,c,l,h,new W),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:c,c:l,normal:new W,materialIndex:0};ir.getNormal(Kr,Zr,$r,d.normal),u.face=d,u.barycoord=h}return u}var Kd=class extends pn{constructor(e=null,t=1,n=1,i,r,s,a,o,c=Wt,l=Wt,u,h){super(null,s,a,o,c,l,i,r,u,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},oa=new W,Zd=new W,$d=new ke,ai=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=oa.subVectors(n,t).cross(Zd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const i=e.delta(oa),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(s<0||s>1)?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||$d.getNormalMatrix(e),i=this.coplanarPoint(oa).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ri=new Na,jd=new ft(.5,.5),es=new W,Ql=class{constructor(e=new ai,t=new ai,n=new ai,i=new ai,r=new ai,s=new ai){this.planes=[e,t,n,i,r,s]}set(e,t,n,i,r,s){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(s),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Xi,n=!1){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],c=r[3],l=r[4],u=r[5],h=r[6],d=r[7],m=r[8],S=r[9],M=r[10],p=r[11],f=r[12],x=r[13],b=r[14],E=r[15];if(i[0].setComponents(c-s,d-l,p-m,E-f).normalize(),i[1].setComponents(c+s,d+l,p+m,E+f).normalize(),i[2].setComponents(c+a,d+u,p+S,E+x).normalize(),i[3].setComponents(c-a,d-u,p-S,E-x).normalize(),n)i[4].setComponents(o,h,M,b).normalize(),i[5].setComponents(c-o,d-h,p-M,E-b).normalize();else if(i[4].setComponents(c-o,d-h,p-M,E-b).normalize(),t===2e3)i[5].setComponents(c+o,d+h,p+M,E+b).normalize();else if(t===2001)i[5].setComponents(o,h,M,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ri.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ri.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ri)}intersectsSprite(e){return ri.center.set(0,0,0),ri.radius=.7071067811865476+jd.distanceTo(e.center),ri.applyMatrix4(e.matrixWorld),this.intersectsSphere(ri)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(es.x=i.normal.x>0?e.max.x:e.min.x,es.y=i.normal.y>0?e.max.y:e.min.y,es.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(es)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ec=class extends pn{constructor(e=[],t=301,n,i,r,s,a,o,c,l){super(e,t,n,i,r,s,a,o,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Yi=class extends pn{constructor(e,t,n=di,i,r,s,a=Wt,o=Wt,c,l=Sr,u=1){if(l!==1026&&l!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super({width:e,height:t,depth:u},i,r,s,a,o,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new La(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Jd=class extends Yi{constructor(e,t=di,n=301,i,r,s=Wt,a=Wt,o,c=Sr){const l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,i,r,s,a,o,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},tc=class extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ua=class nc extends mi{constructor(t=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const c=[],l=[],u=[],h=[];let d=0,m=0;S("z","y","x",-1,-1,i,n,t,a,s,0),S("z","y","x",1,-1,i,n,-t,a,s,1),S("x","z","y",1,1,t,i,n,r,a,2),S("x","z","y",1,-1,t,i,-n,r,a,3),S("x","y","z",1,-1,t,n,i,r,s,4),S("x","y","z",-1,-1,t,n,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new Fn(l,3)),this.setAttribute("normal",new Fn(u,3)),this.setAttribute("uv",new Fn(h,2));function S(M,p,f,x,b,E,C,R,I,v,y){const Y=E/I,A=C/v,H=E/2,j=C/2,F=R/2,O=I+1,z=v+1;let V=0,ee=0;const q=new W;for(let ne=0;ne<z;ne++){const de=ne*A-j;for(let be=0;be<O;be++)q[M]=(be*Y-H)*x,q[p]=de*b,q[f]=F,l.push(q.x,q.y,q.z),q[M]=0,q[p]=0,q[f]=R>0?1:-1,u.push(q.x,q.y,q.z),h.push(be/I),h.push(1-ne/v),V+=1}for(let ne=0;ne<v;ne++)for(let de=0;de<I;de++){const be=d+de+O*ne,We=d+de+O*(ne+1),Pe=d+(de+1)+O*(ne+1),Z=d+(de+1)+O*ne;c.push(be,We,Z),c.push(We,Pe,Z),ee+=6}o.addGroup(m,ee,y),m+=ee,d+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new nc(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Fa=class ic extends mi{constructor(t=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:r};const s=t/2,a=n/2,o=Math.floor(i),c=Math.floor(r),l=o+1,u=c+1,h=t/o,d=n/c,m=[],S=[],M=[],p=[];for(let f=0;f<u;f++){const x=f*d-a;for(let b=0;b<l;b++){const E=b*h-s;S.push(E,-x,0),M.push(0,0,1),p.push(b/o),p.push(1-f/c)}}for(let f=0;f<c;f++)for(let x=0;x<o;x++){const b=x+l*f,E=x+l*(f+1),C=x+1+l*(f+1),R=x+1+l*f;m.push(b,E,R),m.push(E,C,R)}this.setIndex(m),this.setAttribute("position",new Fn(S,3)),this.setAttribute("normal",new Fn(M,3)),this.setAttribute("uv",new Fn(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ic(t.width,t.height,t.widthSegments,t.heightSegments)}};function Ki(e){const t={};for(const n in e){t[n]={};for(const i in e[n]){const r=e[n][i];if(No(r))r.isRenderTargetTexture?(Ne("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=r.clone();else if(Array.isArray(r))if(No(r[0])){const s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();t[n][i]=s}else t[n][i]=r.slice();else t[n][i]=r}}return t}function Ht(e){const t={};for(let n=0;n<e.length;n++){const i=Ki(e[n]);for(const r in i)t[r]=i[r]}return t}function No(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Qd(e){const t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function rc(e){const t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:$e.workingColorSpace}var eh={clone:Ki,merge:Ht},th=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,nh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fn=class extends bs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=th,this.fragmentShader=nh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ki(e.uniforms),this.uniformsGroups=Qd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const r=this.uniforms[i].value;r&&r.isTexture?t.uniforms[i]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[i]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[i]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[i]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[i]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[i]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[i]={type:"m4",value:r.toArray()}:t.uniforms[i]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ih=class extends fn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},rh=class extends bs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Md,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},sh=class extends bs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ts(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}var yr=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let s;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break e}s=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let o=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(i=r,r=t[--n-1],e>=r)break e}s=n,n=0;break t}break n}for(;n<s;){const a=n+s>>>1;e<t[a]?s=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let s=0;s!==i;++s)t[s]=n[r+s];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ah=class extends yr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:mo,endingEnd:mo}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,s=e+1,a=i[r],o=i[s];if(a===void 0)switch(this.getSettings_().endingStart){case _o:r=e,a=2*t-n;break;case vo:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(o===void 0)switch(this.getSettings_().endingEnd){case _o:s=e,o=2*n-t;break;case vo:s=1,o=n+i[1]-i[0];break;default:s=e-1,o=t}const c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(o-n),this._offsetPrev=r*l,this._offsetNext=s*l}interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,c=o-a,l=this._offsetPrev,u=this._offsetNext,h=this._weightPrev,d=this._weightNext,m=(n-t)/(i-t),S=m*m,M=S*m,p=-h*M+2*h*S-h*m,f=(1+h)*M+(-1.5-2*h)*S+(-.5+h)*m+1,x=(-1-d)*M+(1.5+d)*S+.5*m,b=d*M-d*S;for(let E=0;E!==a;++E)r[E]=p*s[l+E]+f*s[c+E]+x*s[o+E]+b*s[u+E];return r}},oh=class extends yr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,c=o-a,l=(n-t)/(i-t),u=1-l;for(let h=0;h!==a;++h)r[h]=s[c+h]*u+s[o+h]*l;return r}},lh=class extends yr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},ch=class extends yr{interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=e*a,c=o-a,l=this.settings||this.DefaultSettings_,u=l.inTangents,h=l.outTangents;if(!u||!h){const S=(n-t)/(i-t),M=1-S;for(let p=0;p!==a;++p)r[p]=s[c+p]*M+s[o+p]*S;return r}const d=a*2,m=e-1;for(let S=0;S!==a;++S){const M=s[c+S],p=s[o+S],f=m*d+S*2,x=h[f],b=h[f+1],E=e*d+S*2,C=u[E],R=u[E+1];let I=(n-t)/(i-t),v,y,Y,A,H;for(let j=0;j<8;j++){v=I*I,y=v*I,Y=1-I,A=Y*Y,H=A*Y;const F=H*t+3*A*I*x+3*Y*v*C+y*i-n;if(Math.abs(F)<1e-10)break;const O=3*A*(x-t)+6*Y*I*(C-x)+3*v*(i-C);if(Math.abs(O)<1e-10)break;I=I-F/O,I=Math.max(0,Math.min(1,I))}r[S]=H*M+3*A*I*b+3*Y*v*R+y*p}return r}},bn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ts(t,this.TimeBufferType),this.values=ts(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ts(e.times,Array),values:ts(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new lh(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new oh(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ah(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new ch(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.settings=this.settings),t}setInterpolation(e){let t;switch(e){case gs:t=this.InterpolantFactoryMethodDiscrete;break;case Ta:t=this.InterpolantFactoryMethodLinear;break;case Fs:t=this.InterpolantFactoryMethodSmooth;break;case po:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ne("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return gs;case this.InterpolantFactoryMethodLinear:return Ta;case this.InterpolantFactoryMethodSmooth:return Fs;case this.InterpolantFactoryMethodBezier:return po}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,s=i-1;for(;r!==i&&n[r]<e;)++r;for(;s!==-1&&n[s]>t;)--s;if(++s,r!==0||s!==i){r>=s&&(s=Math.max(s,1),r=s-1);const a=this.getValueSize();this.times=n.slice(r,s),this.values=this.values.slice(r*a,s*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(Ve("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(Ve("KeyframeTrack: Track is empty.",this),e=!1);let s=null;for(let a=0;a!==r;a++){const o=n[a];if(typeof o=="number"&&isNaN(o)){Ve("KeyframeTrack: Time is not a valid number.",this,a,o),e=!1;break}if(s!==null&&s>o){Ve("KeyframeTrack: Out of order keys.",this,a,o,s),e=!1;break}s=o}if(i!==void 0&&yd(i))for(let a=0,o=i.length;a!==o;++a){const c=i[a];if(isNaN(c)){Ve("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Fs,r=e.length-1;let s=1;for(let a=1;a<r;++a){let o=!1;const c=e[a];if(c!==e[a+1]&&(a!==1||c!==e[0]))if(i)o=!0;else{const l=a*n,u=l-n,h=l+n;for(let d=0;d!==n;++d){const m=t[l+d];if(m!==t[u+d]||m!==t[h+d]){o=!0;break}}}if(o){if(a!==s){e[s]=e[a];const l=a*n,u=s*n;for(let h=0;h!==n;++h)t[u+h]=t[l+h]}++s}}if(r>0){e[s]=e[r];for(let a=r*n,o=s*n,c=0;c!==n;++c)t[o+c]=t[a+c];++s}return s!==e.length?(this.times=e.slice(0,s),this.values=t.slice(0,s*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};bn.prototype.ValueTypeName="";bn.prototype.TimeBufferType=Float32Array;bn.prototype.ValueBufferType=Float32Array;bn.prototype.DefaultInterpolation=Ta;var Er=class extends bn{constructor(e,t,n){super(e,t,n)}};Er.prototype.ValueTypeName="bool";Er.prototype.ValueBufferType=Array;Er.prototype.DefaultInterpolation=gs;Er.prototype.InterpolantFactoryMethodLinear=void 0;Er.prototype.InterpolantFactoryMethodSmooth=void 0;var uh=class extends bn{constructor(e,t,n,i){super(e,t,n,i)}};uh.prototype.ValueTypeName="color";var dh=class extends bn{constructor(e,t,n,i){super(e,t,n,i)}};dh.prototype.ValueTypeName="number";var hh=class extends yr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,s=this.sampleValues,a=this.valueSize,o=(n-t)/(i-t);let c=e*a;for(let l=c+a;c!==l;c+=4)pi.slerpFlat(r,0,s,c-a,s,c,o);return r}},sc=class extends bn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new hh(this.times,this.values,this.getValueSize(),e)}};sc.prototype.ValueTypeName="quaternion";sc.prototype.InterpolantFactoryMethodSmooth=void 0;var br=class extends bn{constructor(e,t,n){super(e,t,n)}};br.prototype.ValueTypeName="string";br.prototype.ValueBufferType=Array;br.prototype.DefaultInterpolation=gs;br.prototype.InterpolantFactoryMethodLinear=void 0;br.prototype.InterpolantFactoryMethodSmooth=void 0;var fh=class extends bn{constructor(e,t,n,i){super(e,t,n,i)}};fh.prototype.ValueTypeName="vector";var ph=class{constructor(e,t,n){const i=this;let r=!1,s=0,a=0,o;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(l){a++,r===!1&&i.onStart!==void 0&&i.onStart(l,s,a),r=!0},this.itemEnd=function(l){s++,i.onProgress!==void 0&&i.onProgress(l,s,a),s===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(l){i.onError!==void 0&&i.onError(l)},this.resolveURL=function(l){return o?o(l):l},this.setURLModifier=function(l){return o=l,this},this.addHandler=function(l,u){return c.push(l,u),this},this.removeHandler=function(l){const u=c.indexOf(l);return u!==-1&&c.splice(u,2),this},this.getHandler=function(l){for(let u=0,h=c.length;u<h;u+=2){const d=c[u],m=c[u+1];if(d.global&&(d.lastIndex=0),d.test(l))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},mh=new ph,_h=class{constructor(e){this.manager=e!==void 0?e:mh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};_h.DEFAULT_MATERIAL_NAME="__DEFAULT";var ns=new W,is=new pi,Sn=new W,ac=class extends On{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ft,this.projectionMatrix=new Ft,this.projectionMatrixInverse=new Ft,this.coordinateSystem=Xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ns,is,Sn),Sn.x===1&&Sn.y===1&&Sn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ns,is,Sn.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(ns,is,Sn),Sn.x===1&&Sn.y===1&&Sn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ns,is,Sn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},qn=new W,Uo=new ft,Fo=new ft,hn=class extends ac{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ba*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Bs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ba*2*Math.atan(Math.tan(Bs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qn.x,qn.y).multiplyScalar(-e/qn.z),qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qn.x,qn.y).multiplyScalar(-e/qn.z)}getViewSize(e,t){return this.getViewBounds(e,Uo,Fo),t.subVectors(Fo,Uo)}setViewOffset(e,t,n,i,r,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Bs*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const s=this.view;if(this.view!==null&&this.view.enabled){const o=s.fullWidth,c=s.fullHeight;r+=s.offsetX*i/o,t-=s.offsetY*n/c,i*=s.width/o,n*=s.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Oa=class extends ac{constructor(e=-1,t=1,n=1,i=-1,r=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,s=n+e,a=i+t,o=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,l=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,s=r+c*this.view.width,a-=l*this.view.offsetY,o=a-l*this.view.height}this.projectionMatrix.makeOrthographic(r,s,a,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Li=-90,Ni=1,vh=class extends On{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new hn(Li,Ni,e,t);i.layers=this.layers,this.add(i);const r=new hn(Li,Ni,e,t);r.layers=this.layers,this.add(r);const s=new hn(Li,Ni,e,t);s.layers=this.layers,this.add(s);const a=new hn(Li,Ni,e,t);a.layers=this.layers,this.add(a);const o=new hn(Li,Ni,e,t);o.layers=this.layers,this.add(o);const c=new hn(Li,Ni,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,s,a,o]=t;for(const c of t)this.remove(c);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,s,a,o,c,l]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const S=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let M=!1;e.isWebGLRenderer===!0?M=e.state.buffers.depth.getReversed():M=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),M&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),M&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,2,i),M&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,i),M&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,4,i),M&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=S,e.setRenderTarget(n,5,i),M&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,h,d),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},gh=class extends hn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Ba="\\[\\]\\.:\\/",Sh=new RegExp("["+Ba+"]","g"),Va="[^"+Ba+"]",Mh="[^"+Ba.replace("\\.","")+"]",xh=/((?:WC+[\/:])*)/.source.replace("WC",Va),Th=/(WCOD+)?/.source.replace("WCOD",Mh),yh=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Va),Eh=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Va),bh=new RegExp("^"+xh+Th+yh+Eh+"$"),Ah=["material","materials","bones","map"],Rh=class{constructor(e,t,n){const i=n||yt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},yt=class Bi{constructor(t,n,i){this.path=n,this.parsedPath=i||Bi.parseTrackName(n),this.node=Bi.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new Bi.Composite(t,n,i):new Bi(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Sh,"")}static parseTrackName(t){const n=bh.exec(t);if(n===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);const i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=i.nodeName.substring(r+1);Ah.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){const i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){const i=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===n||o.uuid===n)return o;const c=i(o.children);if(c)return c}return null},r=i(t.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)t[n++]=i[r]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[n++]}_setValue_array_setNeedsUpdate(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node;const n=this.parsedPath,i=n.objectName,r=n.propertyName;let s=n.propertyIndex;if(t||(t=Bi.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Ne("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=n.objectIndex;switch(i){case"materials":if(!t.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ve("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ve("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===l){l=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ve("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Ve("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(l!==void 0){if(t[l]===void 0){Ve("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}const a=t[r];if(a===void 0){const l=n.nodeName;Ve("PropertyBinding: Trying to update property for track: "+l+"."+r+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!t.geometry){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};yt.Composite=Rh;yt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};yt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};yt.prototype.GetterByBindingType=[yt.prototype._getValue_direct,yt.prototype._getValue_array,yt.prototype._getValue_arrayElement,yt.prototype._getValue_toArray];yt.prototype.SetterByBindingTypeAndVersioning=[[yt.prototype._setValue_direct,yt.prototype._setValue_direct_setNeedsUpdate,yt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_array,yt.prototype._setValue_array_setNeedsUpdate,yt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_arrayElement,yt.prototype._setValue_arrayElement_setNeedsUpdate,yt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_fromArray,yt.prototype._setValue_fromArray_setNeedsUpdate,yt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var jm=class oc{static#e=oc.prototype.isMatrix2=!0;constructor(t,n,i,r){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,r){const s=this.elements;return s[0]=t,s[2]=n,s[1]=i,s[3]=r,this}};function Oo(e,t,n,i){const r=wh(i);switch(n){case Uu:return e*t;case Ou:return e*t/r.components*r.byteLength;case Ol:return e*t/r.components*r.byteLength;case vs:return e*t*2/r.components*r.byteLength;case Bl:return e*t*2/r.components*r.byteLength;case Fu:return e*t*3/r.components*r.byteLength;case gr:return e*t*4/r.components*r.byteLength;case Vl:return e*t*4/r.components*r.byteLength;case Bu:case Vu:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case zu:case ku:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Hu:case Xu:return Math.max(e,16)*Math.max(t,8)/4;case Gu:case Wu:return Math.max(e,8)*Math.max(t,8)/2;case qu:case Yu:case Zu:case $u:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Ku:case ju:case Ju:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Qu:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ed:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case td:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case nd:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case id:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case rd:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case sd:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ad:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case od:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ld:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case cd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case ud:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case dd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case hd:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case fd:case pd:case md:return Math.ceil(e/4)*Math.ceil(t/4)*16;case _d:case vd:return Math.ceil(e/4)*Math.ceil(t/4)*8;case gd:case Sd:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function wh(e){switch(e){case ui:case Pu:return{byteLength:1,components:1};case Dl:case Iu:case hi:return{byteLength:2,components:1};case Ll:case Nl:return{byteLength:2,components:4};case di:case Du:case Es:return{byteLength:4,components:1};case Lu:case Nu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"184"}}));typeof window<"u"&&(window.__THREE__?Ne("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="184");function lc(){let e=null,t=!1,n=null,i=null;function r(s,a){n(s,a),i=e.requestAnimationFrame(r)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(r),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){n=s},setContext:function(s){e=s}}}function Ch(e){const t=new WeakMap;function n(o,c){const l=o.array,u=o.usage,h=l.byteLength,d=e.createBuffer();e.bindBuffer(c,d),e.bufferData(c,l,u),o.onUploadCallback();let m;if(l instanceof Float32Array)m=e.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)m=e.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?m=e.HALF_FLOAT:m=e.UNSIGNED_SHORT;else if(l instanceof Int16Array)m=e.SHORT;else if(l instanceof Uint32Array)m=e.UNSIGNED_INT;else if(l instanceof Int32Array)m=e.INT;else if(l instanceof Int8Array)m=e.BYTE;else if(l instanceof Uint8Array)m=e.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)m=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:m,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,c,l){const u=c.array,h=c.updateRanges;if(e.bindBuffer(l,o),h.length===0)e.bufferSubData(l,0,u);else{h.sort((m,S)=>m.start-S.start);let d=0;for(let m=1;m<h.length;m++){const S=h[d],M=h[m];M.start<=S.start+S.count+1?S.count=Math.max(S.count,M.start+M.count-S.start):(++d,h[d]=M)}h.length=d+1;for(let m=0,S=h.length;m<S;m++){const M=h[m];e.bufferSubData(l,M.start*u.BYTES_PER_ELEMENT,u,M.start,M.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=t.get(o);c&&(e.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=t.get(o);if(l===void 0)t.set(o,n(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:r,remove:s,update:a}}var He={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},pe={common:{diffuse:{value:new rt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new ft(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new rt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new W},probesMax:{value:new W},probesResolution:{value:new W}},points:{diffuse:{value:new rt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new rt(16777215)},opacity:{value:1},center:{value:new ft(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},xn={basic:{uniforms:Ht([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Ht([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new rt(0)},envMapIntensity:{value:1}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Ht([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new rt(0)},specular:{value:new rt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Ht([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new rt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Ht([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new rt(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Ht([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Ht([pe.points,pe.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Ht([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Ht([pe.common,pe.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Ht([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Ht([pe.sprite,pe.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distance:{uniforms:Ht([pe.common,pe.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distance_vert,fragmentShader:He.distance_frag},shadow:{uniforms:Ht([pe.lights,pe.fog,{color:{value:new rt(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};xn.physical={uniforms:Ht([xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new ft(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new rt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new ft},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new rt(0)},specularColor:{value:new rt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new ft},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};var rs={r:0,b:0,g:0},Ph=new Ft,cc=new ke;cc.set(-1,0,0,0,1,0,0,0,1);function Ih(e,t,n,i,r,s){const a=new rt(0);let o=r===!0?0:1,c,l,u=null,h=0,d=null;function m(x){let b=x.isScene===!0?x.background:null;if(b&&b.isTexture){const E=x.backgroundBlurriness>0;b=t.get(b,E)}return b}function S(x){let b=!1;const E=m(x);E===null?p(a,o):E&&E.isColor&&(p(E,1),b=!0);const C=e.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,s):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,s),(e.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function M(x,b){const E=m(b);E&&(E.isCubeTexture||E.mapping===306)?(l===void 0&&(l=new En(new Ua(1,1,1),new fn({name:"BackgroundCubeMaterial",uniforms:Ki(xn.backgroundCube.uniforms),vertexShader:xn.backgroundCube.vertexShader,fragmentShader:xn.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(C,R,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=E,l.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ph.makeRotationFromEuler(b.backgroundRotation)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(cc),l.material.toneMapped=$e.getTransfer(E.colorSpace)!==Ms,(u!==E||h!==E.version||d!==e.toneMapping)&&(l.material.needsUpdate=!0,u=E,h=E.version,d=e.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new En(new Fa(2,2),new fn({name:"BackgroundMaterial",uniforms:Ki(xn.background.uniforms),vertexShader:xn.background.vertexShader,fragmentShader:xn.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=$e.getTransfer(E.colorSpace)!==Ms,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||h!==E.version||d!==e.toneMapping)&&(c.material.needsUpdate=!0,u=E,h=E.version,d=e.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,b){x.getRGB(rs,rc(e)),n.buffers.color.setClear(rs.r,rs.g,rs.b,b,s)}function f(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,b=1){a.set(x),o=b,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,p(a,o)},render:S,addToRenderList:M,dispose:f}}function Dh(e,t){const n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},r=d(null);let s=r,a=!1;function o(A,H,j,F,O){let z=!1;const V=h(A,F,j,H);s!==V&&(s=V,l(s.object)),z=m(A,F,j,O),z&&S(A,F,j,O),O!==null&&t.update(O,e.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,E(A,H,j,F),O!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(O).buffer))}function c(){return e.createVertexArray()}function l(A){return e.bindVertexArray(A)}function u(A){return e.deleteVertexArray(A)}function h(A,H,j,F){const O=F.wireframe===!0;let z=i[H.id];z===void 0&&(z={},i[H.id]=z);const V=A.isInstancedMesh===!0?A.id:0;let ee=z[V];ee===void 0&&(ee={},z[V]=ee);let q=ee[j.id];q===void 0&&(q={},ee[j.id]=q);let ne=q[O];return ne===void 0&&(ne=d(c()),q[O]=ne),ne}function d(A){const H=[],j=[],F=[];for(let O=0;O<n;O++)H[O]=0,j[O]=0,F[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:j,attributeDivisors:F,object:A,attributes:{},index:null}}function m(A,H,j,F){const O=s.attributes,z=H.attributes;let V=0;const ee=j.getAttributes();for(const q in ee)if(ee[q].location>=0){const ne=O[q];let de=z[q];if(de===void 0&&(q==="instanceMatrix"&&A.instanceMatrix&&(de=A.instanceMatrix),q==="instanceColor"&&A.instanceColor&&(de=A.instanceColor)),ne===void 0||ne.attribute!==de||de&&ne.data!==de.data)return!0;V++}return s.attributesNum!==V||s.index!==F}function S(A,H,j,F){const O={},z=H.attributes;let V=0;const ee=j.getAttributes();for(const q in ee)if(ee[q].location>=0){let ne=z[q];ne===void 0&&(q==="instanceMatrix"&&A.instanceMatrix&&(ne=A.instanceMatrix),q==="instanceColor"&&A.instanceColor&&(ne=A.instanceColor));const de={};de.attribute=ne,ne&&ne.data&&(de.data=ne.data),O[q]=de,V++}s.attributes=O,s.attributesNum=V,s.index=F}function M(){const A=s.newAttributes;for(let H=0,j=A.length;H<j;H++)A[H]=0}function p(A){f(A,0)}function f(A,H){const j=s.newAttributes,F=s.enabledAttributes,O=s.attributeDivisors;j[A]=1,F[A]===0&&(e.enableVertexAttribArray(A),F[A]=1),O[A]!==H&&(e.vertexAttribDivisor(A,H),O[A]=H)}function x(){const A=s.newAttributes,H=s.enabledAttributes;for(let j=0,F=H.length;j<F;j++)H[j]!==A[j]&&(e.disableVertexAttribArray(j),H[j]=0)}function b(A,H,j,F,O,z,V){V===!0?e.vertexAttribIPointer(A,H,j,O,z):e.vertexAttribPointer(A,H,j,F,O,z)}function E(A,H,j,F){M();const O=F.attributes,z=j.getAttributes(),V=H.defaultAttributeValues;for(const ee in z){const q=z[ee];if(q.location>=0){let ne=O[ee];if(ne===void 0&&(ee==="instanceMatrix"&&A.instanceMatrix&&(ne=A.instanceMatrix),ee==="instanceColor"&&A.instanceColor&&(ne=A.instanceColor)),ne!==void 0){const de=ne.normalized,be=ne.itemSize,We=t.get(ne);if(We===void 0)continue;const Pe=We.buffer,Z=We.type,se=We.bytesPerElement,me=Z===e.INT||Z===e.UNSIGNED_INT||ne.gpuType===1013;if(ne.isInterleavedBufferAttribute){const he=ne.data,ve=he.stride,Me=ne.offset;if(he.isInstancedInterleavedBuffer){for(let ye=0;ye<q.locationSize;ye++)f(q.location+ye,he.meshPerAttribute);A.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let ye=0;ye<q.locationSize;ye++)p(q.location+ye);e.bindBuffer(e.ARRAY_BUFFER,Pe);for(let ye=0;ye<q.locationSize;ye++)b(q.location+ye,be/q.locationSize,Z,de,ve*se,(Me+be/q.locationSize*ye)*se,me)}else{if(ne.isInstancedBufferAttribute){for(let he=0;he<q.locationSize;he++)f(q.location+he,ne.meshPerAttribute);A.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let he=0;he<q.locationSize;he++)p(q.location+he);e.bindBuffer(e.ARRAY_BUFFER,Pe);for(let he=0;he<q.locationSize;he++)b(q.location+he,be/q.locationSize,Z,de,be*se,be/q.locationSize*he*se,me)}}else if(V!==void 0){const de=V[ee];if(de!==void 0)switch(de.length){case 2:e.vertexAttrib2fv(q.location,de);break;case 3:e.vertexAttrib3fv(q.location,de);break;case 4:e.vertexAttrib4fv(q.location,de);break;default:e.vertexAttrib1fv(q.location,de)}}}}x()}function C(){y();for(const A in i){const H=i[A];for(const j in H){const F=H[j];for(const O in F){const z=F[O];for(const V in z)u(z[V].object),delete z[V];delete F[O]}}delete i[A]}}function R(A){if(i[A.id]===void 0)return;const H=i[A.id];for(const j in H){const F=H[j];for(const O in F){const z=F[O];for(const V in z)u(z[V].object),delete z[V];delete F[O]}}delete i[A.id]}function I(A){for(const H in i){const j=i[H];for(const F in j){const O=j[F];if(O[A.id]===void 0)continue;const z=O[A.id];for(const V in z)u(z[V].object),delete z[V];delete O[A.id]}}}function v(A){for(const H in i){const j=i[H],F=A.isInstancedMesh===!0?A.id:0,O=j[F];if(O!==void 0){for(const z in O){const V=O[z];for(const ee in V)u(V[ee].object),delete V[ee];delete O[z]}delete j[F],Object.keys(j).length===0&&delete i[H]}}}function y(){Y(),a=!0,s!==r&&(s=r,l(s.object))}function Y(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:y,resetDefaultState:Y,dispose:C,releaseStatesOfGeometry:R,releaseStatesOfObject:v,releaseStatesOfProgram:I,initAttributes:M,enableAttribute:p,disableUnusedAttributes:x}}function Lh(e,t,n){let i;function r(c){i=c}function s(c,l){e.drawArrays(i,c,l),n.update(l,i,1)}function a(c,l,u){u!==0&&(e.drawArraysInstanced(i,c,l,u),n.update(l,i,u))}function o(c,l,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let h=0;for(let d=0;d<u;d++)h+=l[d];n.update(h,i,1)}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}function Nh(e,t,n,i){let r;function s(){if(r!==void 0)return r;if(t.has("EXT_texture_filter_anisotropic")===!0){const I=t.get("EXT_texture_filter_anisotropic");r=e.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(I){return!(I!==1023&&i.convert(I)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(I){const v=I===1016&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(I!==1009&&i.convert(I)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==1015&&!v)}function c(I){if(I==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=n.precision!==void 0?n.precision:"highp";const u=c(l);u!==l&&(Ne("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const h=n.logarithmicDepthBuffer===!0,d=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&d===!1&&Ne("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const m=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),S=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=e.getParameter(e.MAX_TEXTURE_SIZE),p=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),f=e.getParameter(e.MAX_VERTEX_ATTRIBS),x=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),b=e.getParameter(e.MAX_VARYING_VECTORS),E=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),C=e.getParameter(e.MAX_SAMPLES),R=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:m,maxVertexTextures:S,maxTextureSize:M,maxCubemapSize:p,maxAttributes:f,maxVertexUniforms:x,maxVaryings:b,maxFragmentUniforms:E,maxSamples:C,samples:R}}function Uh(e){const t=this;let n=null,i=0,r=!1,s=!1;const a=new ai,o=new ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const m=h.length!==0||d||i!==0||r;return r=d,i=h.length,m},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){n=u(h,d,0)},this.setState=function(h,d,m){const S=h.clippingPlanes,M=h.clipIntersection,p=h.clipShadows,f=e.get(h);if(!r||S===null||S.length===0||s&&!p)s?u(null):l();else{const x=s?0:i,b=x*4;let E=f.clippingState||null;c.value=E,E=u(S,d,b,m);for(let C=0;C!==b;++C)E[C]=n[C];f.clippingState=E,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function u(h,d,m,S){const M=h!==null?h.length:0;let p=null;if(M!==0){if(p=c.value,S!==!0||p===null){const f=m+M*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(p===null||p.length<f)&&(p=new Float32Array(f));for(let b=0,E=m;b!==M;++b,E+=4)a.copy(h[b]).applyMatrix4(x,o),a.normal.toArray(p,E),p[E+3]=a.constant}c.value=p,c.needsUpdate=!0}return t.numPlanes=M,t.numIntersection=0,p}}var Yn=4,Bo=[.125,.215,.35,.446,.526,.582],li=20,Fh=256,or=new Oa,Vo=new rt,la=null,ca=0,ua=0,da=!1,Oh=new W,zo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){const{size:s=256,position:a=Oh}=r;la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(s);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,n,i,o,a),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ho(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Go(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(la,ca,ua),this._renderer.xr.enabled=da,e.scissorTest=!1,Ui(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:jt,minFilter:jt,generateMipmaps:!1,type:hi,format:gr,colorSpace:ya,depthBuffer:!1},i=ko(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ko(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Bh(r)),this._blurMaterial=zh(r,e,t),this._ggxMaterial=Vh(r,e,t)}return i}_compileMaterial(e){const t=new En(new mi,e);this._renderer.compile(t,or)}_sceneToCubeUV(e,t,n,i,r){const s=new hn(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Vo),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(i),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new En(new Ua,new Jl({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1})));const h=this._backgroundBox,d=h.material;let m=!1;const S=e.background;S?S.isColor&&(d.color.copy(S),e.background=null,m=!0):(d.color.copy(Vo),m=!0);for(let M=0;M<6;M++){const p=M%3;p===0?(s.up.set(0,a[M],0),s.position.set(r.x,r.y,r.z),s.lookAt(r.x+o[M],r.y,r.z)):p===1?(s.up.set(0,0,a[M]),s.position.set(r.x,r.y,r.z),s.lookAt(r.x,r.y+o[M],r.z)):(s.up.set(0,a[M],0),s.position.set(r.x,r.y,r.z),s.lookAt(r.x,r.y,r.z+o[M]));const f=this._cubeSize;Ui(i,p*f,M>2?f:0,f,f),c.setRenderTarget(i),m&&c.render(h,s),c.render(e,s)}c.toneMapping=u,c.autoClear=l,e.background=S}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===301||e.mapping===302;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ho()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Go());const r=i?this._cubemapMaterial:this._equirectMaterial,s=this._lodMeshes[0];s.material=r;const a=r.uniforms;a.envMap.value=e;const o=this._cubeSize;Ui(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(s,or)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,r=this._pingPongRenderTarget,s=this._ggxMaterial,a=this._lodMeshes[n];a.material=s;const o=s.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(0+c*1.25),{_lodMax:h}=this,d=this._sizeLods[n],m=3*d*(n>h-Yn?n-h+Yn:0),S=4*(this._cubeSize-d);o.envMap.value=e.texture,o.roughness.value=u,o.mipInt.value=h-t,Ui(r,m,S,3*d,2*d),i.setRenderTarget(r),i.render(a,or),o.envMap.value=r.texture,o.roughness.value=0,o.mipInt.value=h-n,Ui(e,m,S,3*d,2*d),i.setRenderTarget(e),i.render(a,or)}_blur(e,t,n,i,r){const s=this._pingPongRenderTarget;this._halfBlur(e,s,t,n,i,"latitudinal",r),this._halfBlur(s,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,s,a){const o=this._renderer,c=this._blurMaterial;s!=="latitudinal"&&s!=="longitudinal"&&Ve("blur direction must be either latitudinal or longitudinal!");const l=3,u=this._lodMeshes[i];u.material=c;const h=c.uniforms,d=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*li-1),S=r/m,M=isFinite(r)?1+Math.floor(l*S):li;M>li&&Ne(`sigmaRadians, ${r}, is too large and will clip, as it requested ${M} samples when the maximum is set to ${li}`);const p=[];let f=0;for(let E=0;E<li;++E){const C=E/S,R=Math.exp(-C*C/2);p.push(R),E===0?f+=R:E<M&&(f+=2*R)}for(let E=0;E<p.length;E++)p[E]=p[E]/f;h.envMap.value=e.texture,h.samples.value=M,h.weights.value=p,h.latitudinal.value=s==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:x}=this;h.dTheta.value=m,h.mipInt.value=x-n;const b=this._sizeLods[i];Ui(t,3*b*(i>x-Yn?i-x+Yn:0),4*(this._cubeSize-b),3*b,2*b),o.setRenderTarget(t),o.render(u,or)}};function Bh(e){const t=[],n=[],i=[];let r=e;const s=e-Yn+1+Bo.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);t.push(o);let c=1/o;a>e-Yn?c=Bo[a-e+Yn-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],m=6,S=6,M=3,p=2,f=1,x=new Float32Array(M*S*m),b=new Float32Array(p*S*m),E=new Float32Array(f*S*m);for(let R=0;R<m;R++){const I=R%3*2/3-1,v=R>2?0:-1,y=[I,v,0,I+2/3,v,0,I+2/3,v+1,0,I,v,0,I+2/3,v+1,0,I,v+1,0];x.set(y,M*S*R),b.set(d,p*S*R);const Y=[R,R,R,R,R,R];E.set(Y,f*S*R)}const C=new mi;C.setAttribute("position",new yn(x,M)),C.setAttribute("uv",new yn(b,p)),C.setAttribute("faceIndex",new yn(E,f)),i.push(new En(C,null)),r>Yn&&r--}return{lodMeshes:i,sizeLods:t,sigmas:n}}function ko(e,t,n){const i=new Tn(e,t,n);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ui(e,t,n,i,r){e.viewport.set(t,n,i,r),e.scissor.set(t,n,i,r)}function Vh(e,t,n){return new fn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Fh,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:As(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function zh(e,t,n){const i=new Float32Array(li),r=new W(0,1,0);return new fn({name:"SphericalGaussianBlur",defines:{n:li,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:As(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Go(){return new fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:As(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ho(){return new fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:As(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function As(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var uc=class extends Tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new ec(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ua(5,5,5),r=new fn({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const s=new En(i,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=jt),new vh(1,10,this).update(e,s),t.minFilter=a,s.geometry.dispose(),s.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,n,i);e.setRenderTarget(r)}};function kh(e){let t=new WeakMap,n=new WeakMap,i=null;function r(d,m=!1){return d==null?null:m?a(d):s(d)}function s(d){if(d&&d.isTexture){const m=d.mapping;if(m===303||m===304)if(t.has(d)){const S=t.get(d).texture;return o(S,d.mapping)}else{const S=d.image;if(S&&S.height>0){const M=new uc(S.height);return M.fromEquirectangularTexture(e,d),t.set(d,M),d.addEventListener("dispose",l),o(M.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){const m=d.mapping,S=m===303||m===304,M=m===301||m===302;if(S||M){let p=n.get(d);const f=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==f)return i===null&&(i=new zo(e)),p=S?i.fromEquirectangular(d,p):i.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,n.set(d,p),p.texture;if(p!==void 0)return p.texture;{const x=d.image;return S&&x&&x.height>0||M&&x&&c(x)?(i===null&&(i=new zo(e)),p=S?i.fromEquirectangular(d):i.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,n.set(d,p),d.addEventListener("dispose",u),p.texture):null}}}return d}function o(d,m){return m===303?d.mapping=301:m===304&&(d.mapping=302),d}function c(d){let m=0;const S=6;for(let M=0;M<S;M++)d[M]!==void 0&&m++;return m===S}function l(d){const m=d.target;m.removeEventListener("dispose",l);const S=t.get(m);S!==void 0&&(t.delete(m),S.dispose())}function u(d){const m=d.target;m.removeEventListener("dispose",u);const S=n.get(m);S!==void 0&&(n.delete(m),S.dispose())}function h(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:h}}function Gh(e){const t={};function n(i){if(t[i]!==void 0)return t[i];const r=e.getExtension(i);return t[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&Ea("WebGLRenderer: "+i+" extension not supported."),r}}}function Hh(e,t,n,i){const r={},s=new WeakMap;function a(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const S in d.attributes)t.remove(d.attributes[S]);d.removeEventListener("dispose",a),delete r[d.id];const m=s.get(d);m&&(t.remove(m),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,n.memory.geometries--}function o(h,d){return r[d.id]===!0||(d.addEventListener("dispose",a),r[d.id]=!0,n.memory.geometries++),d}function c(h){const d=h.attributes;for(const m in d)t.update(d[m],e.ARRAY_BUFFER)}function l(h){const d=[],m=h.index,S=h.attributes.position;let M=0;if(S===void 0)return;if(m!==null){const x=m.array;M=m.version;for(let b=0,E=x.length;b<E;b+=3){const C=x[b+0],R=x[b+1],I=x[b+2];d.push(C,R,R,I,I,C)}}else{const x=S.array;M=S.version;for(let b=0,E=x.length/3-1;b<E;b+=3){const C=b+0,R=b+1,I=b+2;d.push(C,R,R,I,I,C)}}const p=new(S.count>=65535?$l:Zl)(d,1);p.version=M;const f=s.get(h);f&&t.remove(f),s.set(h,p)}function u(h){const d=s.get(h);if(d){const m=h.index;m!==null&&d.version<m.version&&l(h)}else l(h);return s.get(h)}return{get:o,update:c,getWireframeAttribute:u}}function Wh(e,t,n){let i;function r(h){i=h}let s,a;function o(h){s=h.type,a=h.bytesPerElement}function c(h,d){e.drawElements(i,d,s,h*a),n.update(d,i,1)}function l(h,d,m){m!==0&&(e.drawElementsInstanced(i,d,s,h*a,m),n.update(d,i,m))}function u(h,d,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,s,h,0,m);let S=0;for(let M=0;M<m;M++)S+=d[M];n.update(S,i,1)}this.setMode=r,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Xh(e){const t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case e.TRIANGLES:n.triangles+=o*(s/3);break;case e.LINES:n.lines+=o*(s/2);break;case e.LINE_STRIP:n.lines+=o*(s-1);break;case e.LINE_LOOP:n.lines+=o*s;break;case e.POINTS:n.points+=o*s;break;default:Ve("WebGLInfo: Unknown draw mode:",a);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:r,update:i}}function qh(e,t,n){const i=new WeakMap,r=new wt;function s(a,o,c){const l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=i.get(o);if(d===void 0||d.count!==h){let y=function(){I.dispose(),i.delete(o),o.removeEventListener("dispose",y)};d!==void 0&&d.texture.dispose();const m=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let b=0;m===!0&&(b=1),S===!0&&(b=2),M===!0&&(b=3);let E=o.attributes.position.count*b,C=1;E>t.maxTextureSize&&(C=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);const R=new Float32Array(E*C*4*h),I=new Xl(R,E,C,h);I.type=Es,I.needsUpdate=!0;const v=b*4;for(let Y=0;Y<h;Y++){const A=p[Y],H=f[Y],j=x[Y],F=E*C*4*Y;for(let O=0;O<A.count;O++){const z=O*v;m===!0&&(r.fromBufferAttribute(A,O),R[F+z+0]=r.x,R[F+z+1]=r.y,R[F+z+2]=r.z,R[F+z+3]=0),S===!0&&(r.fromBufferAttribute(H,O),R[F+z+4]=r.x,R[F+z+5]=r.y,R[F+z+6]=r.z,R[F+z+7]=0),M===!0&&(r.fromBufferAttribute(j,O),R[F+z+8]=r.x,R[F+z+9]=r.y,R[F+z+10]=r.z,R[F+z+11]=j.itemSize===4?r.w:1)}}d={count:h,texture:I,size:new ft(E,C)},i.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(e,"morphTexture",a.morphTexture,n);else{let m=0;for(let M=0;M<l.length;M++)m+=l[M];const S=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(e,"morphTargetBaseInfluence",S),c.getUniforms().setValue(e,"morphTargetInfluences",l)}c.getUniforms().setValue(e,"morphTargetsTexture",d.texture,n),c.getUniforms().setValue(e,"morphTargetsTextureSize",d.size)}return{update:s}}function Yh(e,t,n,i,r){let s=new WeakMap;function a(l){const u=r.render.frame,h=l.geometry,d=t.get(l,h);if(s.get(d)!==u&&(t.update(d),s.set(d,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==u&&(n.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,e.ARRAY_BUFFER),s.set(l,u))),l.isSkinnedMesh){const m=l.skeleton;s.get(m)!==u&&(m.update(),s.set(m,u))}return d}function o(){s=new WeakMap}function c(l){const u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),n.remove(u.instanceMatrix),u.instanceColor!==null&&n.remove(u.instanceColor)}return{update:a,dispose:o}}var Kh={1:"LINEAR_TONE_MAPPING",2:"REINHARD_TONE_MAPPING",3:"CINEON_TONE_MAPPING",4:"ACES_FILMIC_TONE_MAPPING",6:"AGX_TONE_MAPPING",7:"NEUTRAL_TONE_MAPPING",5:"CUSTOM_TONE_MAPPING"};function Zh(e,t,n,i,r){const s=new Tn(t,n,{type:e,depthBuffer:i,stencilBuffer:r,depthTexture:i?new Yi(t,n):void 0}),a=new Tn(t,n,{type:hi,depthBuffer:!1,stencilBuffer:!1}),o=new mi;o.setAttribute("position",new Fn([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new Fn([0,2,0,0,2,0],2));const c=new ih({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),l=new En(o,c),u=new Oa(-1,1,1,-1,0,1);let h=null,d=null,m=!1,S,M=null,p=[],f=!1;this.setSize=function(x,b){s.setSize(x,b),a.setSize(x,b);for(let E=0;E<p.length;E++){const C=p[E];C.setSize&&C.setSize(x,b)}},this.setEffects=function(x){p=x,f=p.length>0&&p[0].isRenderPass===!0;const b=s.width,E=s.height;for(let C=0;C<p.length;C++){const R=p[C];R.setSize&&R.setSize(b,E)}},this.begin=function(x,b){if(m||x.toneMapping===0&&p.length===0)return!1;if(M=b,b!==null){const E=b.width,C=b.height;(s.width!==E||s.height!==C)&&this.setSize(E,C)}return f===!1&&x.setRenderTarget(s),S=x.toneMapping,x.toneMapping=0,!0},this.hasRenderPass=function(){return f},this.end=function(x,b){x.toneMapping=S,m=!0;let E=s,C=a;for(let R=0;R<p.length;R++){const I=p[R];if(I.enabled!==!1&&(I.render(x,C,E,b),I.needsSwap!==!1)){const v=E;E=C,C=v}}if(h!==x.outputColorSpace||d!==x.toneMapping){h=x.outputColorSpace,d=x.toneMapping,c.defines={},$e.getTransfer(h)==="srgb"&&(c.defines.SRGB_TRANSFER="");const R=Kh[d];R&&(c.defines[R]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=E.texture,x.setRenderTarget(M),x.render(l,u),M=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){s.depthTexture&&s.depthTexture.dispose(),s.dispose(),a.dispose(),o.dispose(),c.dispose()}}var dc=new pn,Ra=new Yi(1,1),hc=new Xl,fc=new Ld,pc=new ec,Wo=[],Xo=[],qo=new Float32Array(16),Yo=new Float32Array(9),Ko=new Float32Array(4);function Zi(e,t,n){const i=e[0];if(i<=0||i>0)return e;const r=t*n;let s=Wo[r];if(s===void 0&&(s=new Float32Array(r),Wo[r]=s),t!==0){i.toArray(s,0);for(let a=1,o=0;a!==t;++a)o+=n,e[a].toArray(s,o)}return s}function Ct(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function Pt(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function Rs(e,t){let n=Xo[t];n===void 0&&(n=new Int32Array(t),Xo[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function $h(e,t){const n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function jh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ct(n,t))return;e.uniform2fv(this.addr,t),Pt(n,t)}}function Jh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ct(n,t))return;e.uniform3fv(this.addr,t),Pt(n,t)}}function Qh(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ct(n,t))return;e.uniform4fv(this.addr,t),Pt(n,t)}}function ef(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(Ct(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Pt(n,t)}else{if(Ct(n,i))return;Ko.set(i),e.uniformMatrix2fv(this.addr,!1,Ko),Pt(n,i)}}function tf(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(Ct(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Pt(n,t)}else{if(Ct(n,i))return;Yo.set(i),e.uniformMatrix3fv(this.addr,!1,Yo),Pt(n,i)}}function nf(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(Ct(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Pt(n,t)}else{if(Ct(n,i))return;qo.set(i),e.uniformMatrix4fv(this.addr,!1,qo),Pt(n,i)}}function rf(e,t){const n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function sf(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ct(n,t))return;e.uniform2iv(this.addr,t),Pt(n,t)}}function af(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ct(n,t))return;e.uniform3iv(this.addr,t),Pt(n,t)}}function of(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ct(n,t))return;e.uniform4iv(this.addr,t),Pt(n,t)}}function lf(e,t){const n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function cf(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ct(n,t))return;e.uniform2uiv(this.addr,t),Pt(n,t)}}function uf(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ct(n,t))return;e.uniform3uiv(this.addr,t),Pt(n,t)}}function df(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ct(n,t))return;e.uniform4uiv(this.addr,t),Pt(n,t)}}function hf(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r);let s;this.type===e.SAMPLER_2D_SHADOW?(Ra.compareFunction=n.isReversedDepthBuffer()?518:515,s=Ra):s=dc,n.setTexture2D(t||s,r)}function ff(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(t||fc,r)}function pf(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(t||pc,r)}function mf(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(t||hc,r)}function _f(e){switch(e){case 5126:return $h;case 35664:return jh;case 35665:return Jh;case 35666:return Qh;case 35674:return ef;case 35675:return tf;case 35676:return nf;case 5124:case 35670:return rf;case 35667:case 35671:return sf;case 35668:case 35672:return af;case 35669:case 35673:return of;case 5125:return lf;case 36294:return cf;case 36295:return uf;case 36296:return df;case 35678:case 36198:case 36298:case 36306:case 35682:return hf;case 35679:case 36299:case 36307:return ff;case 35680:case 36300:case 36308:case 36293:return pf;case 36289:case 36303:case 36311:case 36292:return mf}}function vf(e,t){e.uniform1fv(this.addr,t)}function gf(e,t){const n=Zi(t,this.size,2);e.uniform2fv(this.addr,n)}function Sf(e,t){const n=Zi(t,this.size,3);e.uniform3fv(this.addr,n)}function Mf(e,t){const n=Zi(t,this.size,4);e.uniform4fv(this.addr,n)}function xf(e,t){const n=Zi(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Tf(e,t){const n=Zi(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function yf(e,t){const n=Zi(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Ef(e,t){e.uniform1iv(this.addr,t)}function bf(e,t){e.uniform2iv(this.addr,t)}function Af(e,t){e.uniform3iv(this.addr,t)}function Rf(e,t){e.uniform4iv(this.addr,t)}function wf(e,t){e.uniform1uiv(this.addr,t)}function Cf(e,t){e.uniform2uiv(this.addr,t)}function Pf(e,t){e.uniform3uiv(this.addr,t)}function If(e,t){e.uniform4uiv(this.addr,t)}function Df(e,t,n){const i=this.cache,r=t.length,s=Rs(n,r);Ct(i,s)||(e.uniform1iv(this.addr,s),Pt(i,s));let a;this.type===e.SAMPLER_2D_SHADOW?a=Ra:a=dc;for(let o=0;o!==r;++o)n.setTexture2D(t[o]||a,s[o])}function Lf(e,t,n){const i=this.cache,r=t.length,s=Rs(n,r);Ct(i,s)||(e.uniform1iv(this.addr,s),Pt(i,s));for(let a=0;a!==r;++a)n.setTexture3D(t[a]||fc,s[a])}function Nf(e,t,n){const i=this.cache,r=t.length,s=Rs(n,r);Ct(i,s)||(e.uniform1iv(this.addr,s),Pt(i,s));for(let a=0;a!==r;++a)n.setTextureCube(t[a]||pc,s[a])}function Uf(e,t,n){const i=this.cache,r=t.length,s=Rs(n,r);Ct(i,s)||(e.uniform1iv(this.addr,s),Pt(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(t[a]||hc,s[a])}function Ff(e){switch(e){case 5126:return vf;case 35664:return gf;case 35665:return Sf;case 35666:return Mf;case 35674:return xf;case 35675:return Tf;case 35676:return yf;case 5124:case 35670:return Ef;case 35667:case 35671:return bf;case 35668:case 35672:return Af;case 35669:case 35673:return Rf;case 5125:return wf;case 36294:return Cf;case 36295:return Pf;case 36296:return If;case 35678:case 36198:case 36298:case 36306:case 35682:return Df;case 35679:case 36299:case 36307:return Lf;case 35680:case 36300:case 36308:case 36293:return Nf;case 36289:case 36303:case 36311:case 36292:return Uf}}var Of=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=_f(t.type)}},Bf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ff(t.type)}},Vf=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,s=i.length;r!==s;++r){const a=i[r];a.setValue(e,t[a.id],n)}}},ha=/(\w+)(\])?(\[|\.)?/g;function Zo(e,t){e.seq.push(t),e.map[t.id]=t}function zf(e,t,n){const i=e.name,r=i.length;for(ha.lastIndex=0;;){const s=ha.exec(i),a=ha.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===r){Zo(n,l===void 0?new Of(o,e,t):new Bf(o,e,t));break}else{let u=n.map[o];u===void 0&&(u=new Vf(o),Zo(n,u)),n=u}}}var fs=class{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const a=e.getActiveUniform(t,s);zf(a,e.getUniformLocation(t,a.name),this)}const i=[],r=[];for(const s of this.seq)s.type===e.SAMPLER_2D_SHADOW||s.type===e.SAMPLER_CUBE_SHADOW||s.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(s):r.push(s);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,s=t.length;r!==s;++r){const a=t[r],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const s=e[i];s.id in t&&n.push(s)}return n}};function $o(e,t,n){const i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var kf=37297,Gf=0;function Hf(e,t){const n=e.split(`
`),i=[],r=Math.max(t-6,0),s=Math.min(t+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===t?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}var jo=new ke;function Wf(e){$e._getMatrix(jo,$e.workingColorSpace,e);const t=`mat3( ${jo.elements.map(n=>n.toFixed(4))} )`;switch($e.getTransfer(e)){case Ss:return[t,"LinearTransferOETF"];case Ms:return[t,"sRGBTransferOETF"];default:return Ne("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Jo(e,t,n){const i=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+Hf(e.getShaderSource(t),a)}else return r}function Xf(e,t){const n=Wf(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var qf={1:"Linear",2:"Reinhard",3:"Cineon",4:"ACESFilmic",6:"AgX",7:"Neutral",5:"Custom"};function Yf(e,t){const n=qf[t];return n===void 0?(Ne("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var ss=new W;function Kf(){return $e.getLuminanceCoefficients(ss),["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${ss.x.toFixed(4)}, ${ss.y.toFixed(4)}, ${ss.z.toFixed(4)} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Zf(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(dr).join(`
`)}function $f(e){const t=[];for(const n in e){const i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function jf(e,t){const n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=e.getActiveAttrib(t,r),a=s.name;let o=1;s.type===e.FLOAT_MAT2&&(o=2),s.type===e.FLOAT_MAT3&&(o=3),s.type===e.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function dr(e){return e!==""}function Qo(e,t){const n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function el(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Jf=/^[ \t]*#include +<([\w\d./]+)>/gm;function wa(e){return e.replace(Jf,ep)}var Qf=new Map;function ep(e,t){let n=He[t];if(n===void 0){const i=Qf.get(t);if(i!==void 0)n=He[i],Ne('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return wa(n)}var tp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function tl(e){return e.replace(tp,np)}function np(e,t,n,i){let r="";for(let s=parseInt(t);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function nl(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var ip={1:"SHADOWMAP_TYPE_PCF",3:"SHADOWMAP_TYPE_VSM"};function rp(e){return ip[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var sp={301:"ENVMAP_TYPE_CUBE",302:"ENVMAP_TYPE_CUBE",306:"ENVMAP_TYPE_CUBE_UV"};function ap(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":sp[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var op={302:"ENVMAP_MODE_REFRACTION"};function lp(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":op[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var cp={0:"ENVMAP_BLENDING_MULTIPLY",1:"ENVMAP_BLENDING_MIX",2:"ENVMAP_BLENDING_ADD"};function up(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":cp[e.combine]||"ENVMAP_BLENDING_NONE"}function dp(e){const t=e.envMapCubeUVHeight;if(t===null)return null;const n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function hp(e,t,n,i){const r=e.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const c=rp(n),l=ap(n),u=lp(n),h=up(n),d=dp(n),m=Zf(n),S=$f(s),M=r.createProgram();let p,f,x=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,S].filter(dr).join(`
`),p.length>0&&(p+=`
`),f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,S].filter(dr).join(`
`),f.length>0&&(f+=`
`)):(p=[nl(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,S,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(dr).join(`
`),f=[nl(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,S,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+l:"",n.envMap?"#define "+u:"",n.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==0?"#define TONE_MAPPING":"",n.toneMapping!==0?He.tonemapping_pars_fragment:"",n.toneMapping!==0?Yf("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,Xf("linearToOutputTexel",n.outputColorSpace),Kf(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(dr).join(`
`)),a=wa(a),a=Qo(a,n),a=el(a,n),o=wa(o),o=Qo(o,n),o=el(o,n),a=tl(a),o=tl(o),n.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,f=["#define varying in",n.glslVersion==="300 es"?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion==="300 es"?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const b=x+p+a,E=x+f+o,C=$o(r,r.VERTEX_SHADER,b),R=$o(r,r.FRAGMENT_SHADER,E);r.attachShader(M,C),r.attachShader(M,R),n.index0AttributeName!==void 0?r.bindAttribLocation(M,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(M,0,"position"),r.linkProgram(M);function I(A){if(e.debug.checkShaderErrors){const H=r.getProgramInfoLog(M)||"",j=r.getShaderInfoLog(C)||"",F=r.getShaderInfoLog(R)||"",O=H.trim(),z=j.trim(),V=F.trim();let ee=!0,q=!0;if(r.getProgramParameter(M,r.LINK_STATUS)===!1)if(ee=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(r,M,C,R);else{const ne=Jo(r,C,"vertex"),de=Jo(r,R,"fragment");Ve("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(M,r.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+O+`
`+ne+`
`+de)}else O!==""?Ne("WebGLProgram: Program Info Log:",O):(z===""||V==="")&&(q=!1);q&&(A.diagnostics={runnable:ee,programLog:O,vertexShader:{log:z,prefix:p},fragmentShader:{log:V,prefix:f}})}r.deleteShader(C),r.deleteShader(R),v=new fs(r,M),y=jf(r,M)}let v;this.getUniforms=function(){return v===void 0&&I(this),v};let y;this.getAttributes=function(){return y===void 0&&I(this),y};let Y=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return Y===!1&&(Y=r.getProgramParameter(M,kf)),Y},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(M),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Gf++,this.cacheKey=t,this.usedTimes=1,this.program=M,this.vertexShader=C,this.fragmentShader=R,this}var fp=0,pp=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),s=this._getShaderCacheForMaterial(e);return s.has(i)===!1&&(s.add(i),i.usedTimes++),s.has(r)===!1&&(s.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new mp(e),t.set(e,n)),n}},mp=class{constructor(e){this.id=fp++,this.code=e,this.usedTimes=0}};function _p(e){return e===1030||e===37490||e===36285}function vp(e,t,n,i,r,s){const a=new Yl,o=new pp,c=new Set,l=[],u=new Map,h=i.logarithmicDepthBuffer;let d=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function S(v){return c.add(v),v===0?"uv":`uv${v}`}function M(v,y,Y,A,H,j){const F=A.fog,O=H.geometry,z=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?A.environment:null,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,ee=t.get(v.envMap||z,V),q=ee&&ee.mapping===306?ee.image.height:null,ne=m[v.type];v.precision!==null&&(d=i.getMaxPrecision(v.precision),d!==v.precision&&Ne("WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));const de=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,be=de!==void 0?de.length:0;let We=0;O.morphAttributes.position!==void 0&&(We=1),O.morphAttributes.normal!==void 0&&(We=2),O.morphAttributes.color!==void 0&&(We=3);let Pe,Z,se,me;if(ne){const Fe=xn[ne];Pe=Fe.vertexShader,Z=Fe.fragmentShader}else Pe=v.vertexShader,Z=v.fragmentShader,o.update(v),se=o.getVertexShaderID(v),me=o.getFragmentShaderID(v);const he=e.getRenderTarget(),ve=e.state.buffers.depth.getReversed(),Me=H.isInstancedMesh===!0,ye=H.isBatchedMesh===!0,Xe=!!v.map,Ie=!!v.matcap,tt=!!ee,Ke=!!v.aoMap,st=!!v.lightMap,at=!!v.bumpMap,ot=!!v.normalMap,P=!!v.displacementMap,Je=!!v.emissiveMap,De=!!v.metalnessMap,Ue=!!v.roughnessMap,fe=v.anisotropy>0,nt=v.clearcoat>0,xe=v.dispersion>0,T=v.iridescence>0,_=v.sheen>0,U=v.transmission>0,Q=fe&&!!v.anisotropyMap,te=nt&&!!v.clearcoatMap,oe=nt&&!!v.clearcoatNormalMap,ue=nt&&!!v.clearcoatRoughnessMap,D=T&&!!v.iridescenceMap,G=T&&!!v.iridescenceThicknessMap,N=_&&!!v.sheenColorMap,$=_&&!!v.sheenRoughnessMap,J=!!v.specularMap,Te=!!v.specularColorMap,Ae=!!v.specularIntensityMap,Ce=U&&!!v.transmissionMap,ze=U&&!!v.thicknessMap,w=!!v.gradientMap,K=!!v.alphaMap,ae=v.alphaTest>0,ce=!!v.alphaHash,Re=!!v.extensions;let re=0;v.toneMapped&&(he===null||he.isXRRenderTarget===!0)&&(re=e.toneMapping);const we={shaderID:ne,shaderType:v.type,shaderName:v.name,vertexShader:Pe,fragmentShader:Z,defines:v.defines,customVertexShaderID:se,customFragmentShaderID:me,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:ye,batchingColor:ye&&H._colorsTexture!==null,instancing:Me,instancingColor:Me&&H.instanceColor!==null,instancingMorph:Me&&H.morphTexture!==null,outputColorSpace:he===null?e.outputColorSpace:he.isXRRenderTarget===!0?he.texture.colorSpace:$e.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Xe,matcap:Ie,envMap:tt,envMapMode:tt&&ee.mapping,envMapCubeUVHeight:q,aoMap:Ke,lightMap:st,bumpMap:at,normalMap:ot,displacementMap:P,emissiveMap:Je,normalMapObjectSpace:ot&&v.normalMapType===1,normalMapTangentSpace:ot&&v.normalMapType===0,packedNormalMap:ot&&v.normalMapType===0&&_p(v.normalMap.format),metalnessMap:De,roughnessMap:Ue,anisotropy:fe,anisotropyMap:Q,clearcoat:nt,clearcoatMap:te,clearcoatNormalMap:oe,clearcoatRoughnessMap:ue,dispersion:xe,iridescence:T,iridescenceMap:D,iridescenceThicknessMap:G,sheen:_,sheenColorMap:N,sheenRoughnessMap:$,specularMap:J,specularColorMap:Te,specularIntensityMap:Ae,transmission:U,transmissionMap:Ce,thicknessMap:ze,gradientMap:w,opaque:v.transparent===!1&&v.blending===1&&v.alphaToCoverage===!1,alphaMap:K,alphaTest:ae,alphaHash:ce,combine:v.combine,mapUv:Xe&&S(v.map.channel),aoMapUv:Ke&&S(v.aoMap.channel),lightMapUv:st&&S(v.lightMap.channel),bumpMapUv:at&&S(v.bumpMap.channel),normalMapUv:ot&&S(v.normalMap.channel),displacementMapUv:P&&S(v.displacementMap.channel),emissiveMapUv:Je&&S(v.emissiveMap.channel),metalnessMapUv:De&&S(v.metalnessMap.channel),roughnessMapUv:Ue&&S(v.roughnessMap.channel),anisotropyMapUv:Q&&S(v.anisotropyMap.channel),clearcoatMapUv:te&&S(v.clearcoatMap.channel),clearcoatNormalMapUv:oe&&S(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ue&&S(v.clearcoatRoughnessMap.channel),iridescenceMapUv:D&&S(v.iridescenceMap.channel),iridescenceThicknessMapUv:G&&S(v.iridescenceThicknessMap.channel),sheenColorMapUv:N&&S(v.sheenColorMap.channel),sheenRoughnessMapUv:$&&S(v.sheenRoughnessMap.channel),specularMapUv:J&&S(v.specularMap.channel),specularColorMapUv:Te&&S(v.specularColorMap.channel),specularIntensityMapUv:Ae&&S(v.specularIntensityMap.channel),transmissionMapUv:Ce&&S(v.transmissionMap.channel),thicknessMapUv:ze&&S(v.thicknessMap.channel),alphaMapUv:K&&S(v.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(ot||fe),vertexNormals:!!O.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!O.attributes.uv&&(Xe||K),fog:!!F,useFog:v.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||O.attributes.normal===void 0&&ot===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:ve,skinning:H.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:We,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numLightProbeGrids:j.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:v.dithering,shadowMapEnabled:e.shadowMap.enabled&&Y.length>0,shadowMapType:e.shadowMap.type,toneMapping:re,decodeVideoTexture:Xe&&v.map.isVideoTexture===!0&&$e.getTransfer(v.map.colorSpace)==="srgb",decodeVideoTextureEmissive:Je&&v.emissiveMap.isVideoTexture===!0&&$e.getTransfer(v.emissiveMap.colorSpace)==="srgb",premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===2,flipSided:v.side===1,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Re&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Re&&v.extensions.multiDraw===!0||ye)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return we.vertexUv1s=c.has(1),we.vertexUv2s=c.has(2),we.vertexUv3s=c.has(3),c.clear(),we}function p(v){const y=[];if(v.shaderID?y.push(v.shaderID):(y.push(v.customVertexShaderID),y.push(v.customFragmentShaderID)),v.defines!==void 0)for(const Y in v.defines)y.push(Y),y.push(v.defines[Y]);return v.isRawShaderMaterial===!1&&(f(y,v),x(y,v),y.push(e.outputColorSpace)),y.push(v.customProgramCacheKey),y.join()}function f(v,y){v.push(y.precision),v.push(y.outputColorSpace),v.push(y.envMapMode),v.push(y.envMapCubeUVHeight),v.push(y.mapUv),v.push(y.alphaMapUv),v.push(y.lightMapUv),v.push(y.aoMapUv),v.push(y.bumpMapUv),v.push(y.normalMapUv),v.push(y.displacementMapUv),v.push(y.emissiveMapUv),v.push(y.metalnessMapUv),v.push(y.roughnessMapUv),v.push(y.anisotropyMapUv),v.push(y.clearcoatMapUv),v.push(y.clearcoatNormalMapUv),v.push(y.clearcoatRoughnessMapUv),v.push(y.iridescenceMapUv),v.push(y.iridescenceThicknessMapUv),v.push(y.sheenColorMapUv),v.push(y.sheenRoughnessMapUv),v.push(y.specularMapUv),v.push(y.specularColorMapUv),v.push(y.specularIntensityMapUv),v.push(y.transmissionMapUv),v.push(y.thicknessMapUv),v.push(y.combine),v.push(y.fogExp2),v.push(y.sizeAttenuation),v.push(y.morphTargetsCount),v.push(y.morphAttributeCount),v.push(y.numDirLights),v.push(y.numPointLights),v.push(y.numSpotLights),v.push(y.numSpotLightMaps),v.push(y.numHemiLights),v.push(y.numRectAreaLights),v.push(y.numDirLightShadows),v.push(y.numPointLightShadows),v.push(y.numSpotLightShadows),v.push(y.numSpotLightShadowsWithMaps),v.push(y.numLightProbes),v.push(y.shadowMapType),v.push(y.toneMapping),v.push(y.numClippingPlanes),v.push(y.numClipIntersection),v.push(y.depthPacking)}function x(v,y){a.disableAll(),y.instancing&&a.enable(0),y.instancingColor&&a.enable(1),y.instancingMorph&&a.enable(2),y.matcap&&a.enable(3),y.envMap&&a.enable(4),y.normalMapObjectSpace&&a.enable(5),y.normalMapTangentSpace&&a.enable(6),y.clearcoat&&a.enable(7),y.iridescence&&a.enable(8),y.alphaTest&&a.enable(9),y.vertexColors&&a.enable(10),y.vertexAlphas&&a.enable(11),y.vertexUv1s&&a.enable(12),y.vertexUv2s&&a.enable(13),y.vertexUv3s&&a.enable(14),y.vertexTangents&&a.enable(15),y.anisotropy&&a.enable(16),y.alphaHash&&a.enable(17),y.batching&&a.enable(18),y.dispersion&&a.enable(19),y.batchingColor&&a.enable(20),y.gradientMap&&a.enable(21),y.packedNormalMap&&a.enable(22),y.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),y.numLightProbeGrids>0&&a.enable(22),v.push(a.mask)}function b(v){const y=m[v.type];let Y;if(y){const A=xn[y];Y=eh.clone(A.uniforms)}else Y=v.uniforms;return Y}function E(v,y){let Y=u.get(y);return Y!==void 0?++Y.usedTimes:(Y=new hp(e,y,v,r),l.push(Y),u.set(y,Y)),Y}function C(v){if(--v.usedTimes===0){const y=l.indexOf(v);l[y]=l[l.length-1],l.pop(),u.delete(v.cacheKey),v.destroy()}}function R(v){o.remove(v)}function I(){o.dispose()}return{getParameters:M,getProgramCacheKey:p,getUniforms:b,acquireProgram:E,releaseProgram:C,releaseShaderCache:R,programs:l,dispose:I}}function gp(){let e=new WeakMap;function t(a){return e.has(a)}function n(a){let o=e.get(a);return o===void 0&&(o={},e.set(a,o)),o}function i(a){e.delete(a)}function r(a,o,c){e.get(a)[o]=c}function s(){e=new WeakMap}return{has:t,get:n,remove:i,update:r,dispose:s}}function Sp(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function il(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function rl(){const e=[];let t=0;const n=[],i=[],r=[];function s(){t=0,n.length=0,i.length=0,r.length=0}function a(d){let m=0;return d.isInstancedMesh&&(m+=2),d.isSkinnedMesh&&(m+=1),m}function o(d,m,S,M,p,f){let x=e[t];return x===void 0?(x={id:d.id,object:d,geometry:m,material:S,materialVariant:a(d),groupOrder:M,renderOrder:d.renderOrder,z:p,group:f},e[t]=x):(x.id=d.id,x.object=d,x.geometry=m,x.material=S,x.materialVariant=a(d),x.groupOrder=M,x.renderOrder=d.renderOrder,x.z=p,x.group=f),t++,x}function c(d,m,S,M,p,f){const x=o(d,m,S,M,p,f);S.transmission>0?i.push(x):S.transparent===!0?r.push(x):n.push(x)}function l(d,m,S,M,p,f){const x=o(d,m,S,M,p,f);S.transmission>0?i.unshift(x):S.transparent===!0?r.unshift(x):n.unshift(x)}function u(d,m){n.length>1&&n.sort(d||Sp),i.length>1&&i.sort(m||il),r.length>1&&r.sort(m||il)}function h(){for(let d=t,m=e.length;d<m;d++){const S=e[d];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:c,unshift:l,finish:h,sort:u}}function Mp(){let e=new WeakMap;function t(i,r){const s=e.get(i);let a;return s===void 0?(a=new rl,e.set(i,[a])):r>=s.length?(a=new rl,s.push(a)):a=s[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}function xp(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new W,color:new rt};break;case"SpotLight":n={position:new W,direction:new W,color:new rt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new W,color:new rt,distance:0,decay:0};break;case"HemisphereLight":n={direction:new W,skyColor:new rt,groundColor:new rt};break;case"RectAreaLight":n={color:new rt,position:new W,halfWidth:new W,halfHeight:new W};break}return e[t.id]=n,n}}}function Tp(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var yp=0;function Ep(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function bp(e){const t=new xp,n=Tp(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new W);const r=new W,s=new Ft,a=new Ft;function o(l){let u=0,h=0,d=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let m=0,S=0,M=0,p=0,f=0,x=0,b=0,E=0,C=0,R=0,I=0;l.sort(Ep);for(let y=0,Y=l.length;y<Y;y++){const A=l[y],H=A.color,j=A.intensity,F=A.distance;let O=null;if(A.shadow&&A.shadow.map&&(A.shadow.map.texture.format===1030?O=A.shadow.map.texture:O=A.shadow.map.depthTexture||A.shadow.map.texture),A.isAmbientLight)u+=H.r*j,h+=H.g*j,d+=H.b*j;else if(A.isLightProbe){for(let z=0;z<9;z++)i.probe[z].addScaledVector(A.sh.coefficients[z],j);I++}else if(A.isDirectionalLight){const z=t.get(A);if(z.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const V=A.shadow,ee=n.get(A);ee.shadowIntensity=V.intensity,ee.shadowBias=V.bias,ee.shadowNormalBias=V.normalBias,ee.shadowRadius=V.radius,ee.shadowMapSize=V.mapSize,i.directionalShadow[m]=ee,i.directionalShadowMap[m]=O,i.directionalShadowMatrix[m]=A.shadow.matrix,x++}i.directional[m]=z,m++}else if(A.isSpotLight){const z=t.get(A);z.position.setFromMatrixPosition(A.matrixWorld),z.color.copy(H).multiplyScalar(j),z.distance=F,z.coneCos=Math.cos(A.angle),z.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),z.decay=A.decay,i.spot[M]=z;const V=A.shadow;if(A.map&&(i.spotLightMap[C]=A.map,C++,V.updateMatrices(A),A.castShadow&&R++),i.spotLightMatrix[M]=V.matrix,A.castShadow){const ee=n.get(A);ee.shadowIntensity=V.intensity,ee.shadowBias=V.bias,ee.shadowNormalBias=V.normalBias,ee.shadowRadius=V.radius,ee.shadowMapSize=V.mapSize,i.spotShadow[M]=ee,i.spotShadowMap[M]=O,E++}M++}else if(A.isRectAreaLight){const z=t.get(A);z.color.copy(H).multiplyScalar(j),z.halfWidth.set(A.width*.5,0,0),z.halfHeight.set(0,A.height*.5,0),i.rectArea[p]=z,p++}else if(A.isPointLight){const z=t.get(A);if(z.color.copy(A.color).multiplyScalar(A.intensity),z.distance=A.distance,z.decay=A.decay,A.castShadow){const V=A.shadow,ee=n.get(A);ee.shadowIntensity=V.intensity,ee.shadowBias=V.bias,ee.shadowNormalBias=V.normalBias,ee.shadowRadius=V.radius,ee.shadowMapSize=V.mapSize,ee.shadowCameraNear=V.camera.near,ee.shadowCameraFar=V.camera.far,i.pointShadow[S]=ee,i.pointShadowMap[S]=O,i.pointShadowMatrix[S]=A.shadow.matrix,b++}i.point[S]=z,S++}else if(A.isHemisphereLight){const z=t.get(A);z.skyColor.copy(A.color).multiplyScalar(j),z.groundColor.copy(A.groundColor).multiplyScalar(j),i.hemi[f]=z,f++}}p>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;const v=i.hash;(v.directionalLength!==m||v.pointLength!==S||v.spotLength!==M||v.rectAreaLength!==p||v.hemiLength!==f||v.numDirectionalShadows!==x||v.numPointShadows!==b||v.numSpotShadows!==E||v.numSpotMaps!==C||v.numLightProbes!==I)&&(i.directional.length=m,i.spot.length=M,i.rectArea.length=p,i.point.length=S,i.hemi.length=f,i.directionalShadow.length=x,i.directionalShadowMap.length=x,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=x,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=E+C-R,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=I,v.directionalLength=m,v.pointLength=S,v.spotLength=M,v.rectAreaLength=p,v.hemiLength=f,v.numDirectionalShadows=x,v.numPointShadows=b,v.numSpotShadows=E,v.numSpotMaps=C,v.numLightProbes=I,i.version=yp++)}function c(l,u){let h=0,d=0,m=0,S=0,M=0;const p=u.matrixWorldInverse;for(let f=0,x=l.length;f<x;f++){const b=l[f];if(b.isDirectionalLight){const E=i.directional[h];E.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(r),E.direction.transformDirection(p),h++}else if(b.isSpotLight){const E=i.spot[m];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(r),E.direction.transformDirection(p),m++}else if(b.isRectAreaLight){const E=i.rectArea[S];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),a.identity(),s.copy(b.matrixWorld),s.premultiply(p),a.extractRotation(s),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),S++}else if(b.isPointLight){const E=i.point[d];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),d++}else if(b.isHemisphereLight){const E=i.hemi[M];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),M++}}}return{setup:o,setupView:c,state:i}}function sl(e){const t=new bp(e),n=[],i=[],r=[];function s(d){h.camera=d,n.length=0,i.length=0,r.length=0}function a(d){n.push(d)}function o(d){i.push(d)}function c(d){r.push(d)}function l(){t.setup(n)}function u(d){t.setupView(n,d)}const h={lightsArray:n,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:h,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function Ap(e){let t=new WeakMap;function n(r,s=0){const a=t.get(r);let o;return a===void 0?(o=new sl(e),t.set(r,[o])):s>=a.length?(o=new sl(e),a.push(o)):o=a[s],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var Rp=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,wp=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Cp=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],Pp=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],al=new Ft,lr=new W,fa=new W;function Ip(e,t,n){let i=new Ql;const r=new ft,s=new ft,a=new wt,o=new rh,c=new sh,l={},u=n.maxTextureSize,h={0:1,1:0,2:2},d=new fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ft},radius:{value:4}},vertexShader:Rp,fragmentShader:wp}),m=d.clone();m.defines.HORIZONTAL_PASS=1;const S=new mi;S.setAttribute("position",new yn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new En(S,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let f=this.type;this.render=function(R,I,v){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||R.length===0)return;this.type===2&&(Ne("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=1);const y=e.getRenderTarget(),Y=e.getActiveCubeFace(),A=e.getActiveMipmapLevel(),H=e.state;H.setBlending(0),H.buffers.depth.getReversed()===!0?H.buffers.color.setClear(0,0,0,0):H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);const j=f!==this.type;j&&I.traverse(function(F){F.material&&(Array.isArray(F.material)?F.material.forEach(O=>O.needsUpdate=!0):F.material.needsUpdate=!0)});for(let F=0,O=R.length;F<O;F++){const z=R[F],V=z.shadow;if(V===void 0){Ne("WebGLShadowMap:",z,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);const ee=V.getFrameExtents();r.multiply(ee),s.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/ee.x),r.x=s.x*ee.x,V.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/ee.y),r.y=s.y*ee.y,V.mapSize.y=s.y));const q=e.state.buffers.depth.getReversed();if(V.camera._reversedDepth=q,V.map===null||j===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===3){if(z.isPointLight){Ne("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new Tn(r.x,r.y,{format:vs,type:hi,minFilter:jt,magFilter:jt,generateMipmaps:!1}),V.map.texture.name=z.name+".shadowMap",V.map.depthTexture=new Yi(r.x,r.y,Es),V.map.depthTexture.name=z.name+".shadowMapDepth",V.map.depthTexture.format=Sr,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Wt,V.map.depthTexture.magFilter=Wt}else z.isPointLight?(V.map=new uc(r.x),V.map.depthTexture=new Jd(r.x,di)):(V.map=new Tn(r.x,r.y),V.map.depthTexture=new Yi(r.x,r.y,di)),V.map.depthTexture.name=z.name+".shadowMap",V.map.depthTexture.format=Sr,this.type===1?(V.map.depthTexture.compareFunction=q?518:515,V.map.depthTexture.minFilter=jt,V.map.depthTexture.magFilter=jt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Wt,V.map.depthTexture.magFilter=Wt);V.camera.updateProjectionMatrix()}const ne=V.map.isWebGLCubeRenderTarget?6:1;for(let de=0;de<ne;de++){if(V.map.isWebGLCubeRenderTarget)e.setRenderTarget(V.map,de),e.clear();else{de===0&&(e.setRenderTarget(V.map),e.clear());const be=V.getViewport(de);a.set(s.x*be.x,s.y*be.y,s.x*be.z,s.y*be.w),H.viewport(a)}if(z.isPointLight){const be=V.camera,We=V.matrix,Pe=z.distance||be.far;Pe!==be.far&&(be.far=Pe,be.updateProjectionMatrix()),lr.setFromMatrixPosition(z.matrixWorld),be.position.copy(lr),fa.copy(be.position),fa.add(Cp[de]),be.up.copy(Pp[de]),be.lookAt(fa),be.updateMatrixWorld(),We.makeTranslation(-lr.x,-lr.y,-lr.z),al.multiplyMatrices(be.projectionMatrix,be.matrixWorldInverse),V._frustum.setFromProjectionMatrix(al,be.coordinateSystem,be.reversedDepth)}else V.updateMatrices(z);i=V.getFrustum(),E(I,v,V.camera,z,this.type)}V.isPointLightShadow!==!0&&this.type===3&&x(V,v),V.needsUpdate=!1}f=this.type,p.needsUpdate=!1,e.setRenderTarget(y,Y,A)};function x(R,I){const v=t.update(M);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,m.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Tn(r.x,r.y,{format:vs,type:hi})),d.uniforms.shadow_pass.value=R.map.depthTexture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,e.setRenderTarget(R.mapPass),e.clear(),e.renderBufferDirect(I,null,v,d,M,null),m.uniforms.shadow_pass.value=R.mapPass.texture,m.uniforms.resolution.value=R.mapSize,m.uniforms.radius.value=R.radius,e.setRenderTarget(R.map),e.clear(),e.renderBufferDirect(I,null,v,m,M,null)}function b(R,I,v,y){let Y=null;const A=v.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(A!==void 0)Y=A;else if(Y=v.isPointLight===!0?c:o,e.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){const H=Y.uuid,j=I.uuid;let F=l[H];F===void 0&&(F={},l[H]=F);let O=F[j];O===void 0&&(O=Y.clone(),F[j]=O,I.addEventListener("dispose",C)),Y=O}if(Y.visible=I.visible,Y.wireframe=I.wireframe,y===3?Y.side=I.shadowSide!==null?I.shadowSide:I.side:Y.side=I.shadowSide!==null?I.shadowSide:h[I.side],Y.alphaMap=I.alphaMap,Y.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,Y.map=I.map,Y.clipShadows=I.clipShadows,Y.clippingPlanes=I.clippingPlanes,Y.clipIntersection=I.clipIntersection,Y.displacementMap=I.displacementMap,Y.displacementScale=I.displacementScale,Y.displacementBias=I.displacementBias,Y.wireframeLinewidth=I.wireframeLinewidth,Y.linewidth=I.linewidth,v.isPointLight===!0&&Y.isMeshDistanceMaterial===!0){const H=e.properties.get(Y);H.light=v}return Y}function E(R,I,v,y,Y){if(R.visible===!1)return;if(R.layers.test(I.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&Y===3)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,R.matrixWorld);const H=t.update(R),j=R.material;if(Array.isArray(j)){const F=H.groups;for(let O=0,z=F.length;O<z;O++){const V=F[O],ee=j[V.materialIndex];if(ee&&ee.visible){const q=b(R,ee,y,Y);R.onBeforeShadow(e,R,I,v,H,q,V),e.renderBufferDirect(v,null,H,q,R,V),R.onAfterShadow(e,R,I,v,H,q,V)}}}else if(j.visible){const F=b(R,j,y,Y);R.onBeforeShadow(e,R,I,v,H,F,null),e.renderBufferDirect(v,null,H,F,R,null),R.onAfterShadow(e,R,I,v,H,F,null)}}const A=R.children;for(let H=0,j=A.length;H<j;H++)E(A[H],I,v,y,Y)}function C(R){R.target.removeEventListener("dispose",C);for(const I in l){const v=l[I],y=R.target.uuid;y in v&&(v[y].dispose(),delete v[y])}}}function Dp(e,t){function n(){let w=!1;const K=new wt;let ae=null;const ce=new wt(0,0,0,0);return{setMask:function(Re){ae!==Re&&!w&&(e.colorMask(Re,Re,Re,Re),ae=Re)},setLocked:function(Re){w=Re},setClear:function(Re,re,we,Fe,Xt){Xt===!0&&(Re*=Fe,re*=Fe,we*=Fe),K.set(Re,re,we,Fe),ce.equals(K)===!1&&(e.clearColor(Re,re,we,Fe),ce.copy(K))},reset:function(){w=!1,ae=null,ce.set(-1,0,0,0)}}}function i(){let w=!1,K=!1,ae=null,ce=null,Re=null;return{setReversed:function(re){if(K!==re){const we=t.get("EXT_clip_control");re?we.clipControlEXT(we.LOWER_LEFT_EXT,we.ZERO_TO_ONE_EXT):we.clipControlEXT(we.LOWER_LEFT_EXT,we.NEGATIVE_ONE_TO_ONE_EXT),K=re;const Fe=Re;Re=null,this.setClear(Fe)}},getReversed:function(){return K},setTest:function(re){re?he(e.DEPTH_TEST):ve(e.DEPTH_TEST)},setMask:function(re){ae!==re&&!w&&(e.depthMask(re),ae=re)},setFunc:function(re){if(K&&(re=Ad[re]),ce!==re){switch(re){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ce=re}},setLocked:function(re){w=re},setClear:function(re){Re!==re&&(Re=re,K&&(re=1-re),e.clearDepth(re))},reset:function(){w=!1,ae=null,ce=null,Re=null,K=!1}}}function r(){let w=!1,K=null,ae=null,ce=null,Re=null,re=null,we=null,Fe=null,Xt=null;return{setTest:function(_t){w||(_t?he(e.STENCIL_TEST):ve(e.STENCIL_TEST))},setMask:function(_t){K!==_t&&!w&&(e.stencilMask(_t),K=_t)},setFunc:function(_t,mn,rn){(ae!==_t||ce!==mn||Re!==rn)&&(e.stencilFunc(_t,mn,rn),ae=_t,ce=mn,Re=rn)},setOp:function(_t,mn,rn){(re!==_t||we!==mn||Fe!==rn)&&(e.stencilOp(_t,mn,rn),re=_t,we=mn,Fe=rn)},setLocked:function(_t){w=_t},setClear:function(_t){Xt!==_t&&(e.clearStencil(_t),Xt=_t)},reset:function(){w=!1,K=null,ae=null,ce=null,Re=null,re=null,we=null,Fe=null,Xt=null}}}const s=new n,a=new i,o=new r,c=new WeakMap,l=new WeakMap;let u={},h={},d={},m=new WeakMap,S=[],M=null,p=!1,f=null,x=null,b=null,E=null,C=null,R=null,I=null,v=new rt(0,0,0),y=0,Y=!1,A=null,H=null,j=null,F=null,O=null;const z=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,ee=0;const q=e.getParameter(e.VERSION);q.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(q)[1]),V=ee>=1):q.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),V=ee>=2);let ne=null,de={};const be=e.getParameter(e.SCISSOR_BOX),We=e.getParameter(e.VIEWPORT),Pe=new wt().fromArray(be),Z=new wt().fromArray(We);function se(w,K,ae,ce){const Re=new Uint8Array(4),re=e.createTexture();e.bindTexture(w,re),e.texParameteri(w,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(w,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let we=0;we<ae;we++)w===e.TEXTURE_3D||w===e.TEXTURE_2D_ARRAY?e.texImage3D(K,0,e.RGBA,1,1,ce,0,e.RGBA,e.UNSIGNED_BYTE,Re):e.texImage2D(K+we,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Re);return re}const me={};me[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),me[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),me[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),me[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),he(e.DEPTH_TEST),a.setFunc(3),at(!1),ot(1),he(e.CULL_FACE),Ke(0);function he(w){u[w]!==!0&&(e.enable(w),u[w]=!0)}function ve(w){u[w]!==!1&&(e.disable(w),u[w]=!1)}function Me(w,K){return d[w]!==K?(e.bindFramebuffer(w,K),d[w]=K,w===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=K),w===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=K),!0):!1}function ye(w,K){let ae=S,ce=!1;if(w){ae=m.get(K),ae===void 0&&(ae=[],m.set(K,ae));const Re=w.textures;if(ae.length!==Re.length||ae[0]!==e.COLOR_ATTACHMENT0){for(let re=0,we=Re.length;re<we;re++)ae[re]=e.COLOR_ATTACHMENT0+re;ae.length=Re.length,ce=!0}}else ae[0]!==e.BACK&&(ae[0]=e.BACK,ce=!0);ce&&e.drawBuffers(ae)}function Xe(w){return M!==w?(e.useProgram(w),M=w,!0):!1}const Ie={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};Ie[103]=e.MIN,Ie[104]=e.MAX;const tt={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function Ke(w,K,ae,ce,Re,re,we,Fe,Xt,_t){if(w===0){p===!0&&(ve(e.BLEND),p=!1);return}if(p===!1&&(he(e.BLEND),p=!0),w!==5){if(w!==f||_t!==Y){if((x!==100||C!==100)&&(e.blendEquation(e.FUNC_ADD),x=100,C=100),_t)switch(w){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Ve("WebGLState: Invalid blending: ",w);break}else switch(w){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:Ve("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case 4:Ve("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ve("WebGLState: Invalid blending: ",w);break}b=null,E=null,R=null,I=null,v.set(0,0,0),y=0,f=w,Y=_t}return}Re=Re||K,re=re||ae,we=we||ce,(K!==x||Re!==C)&&(e.blendEquationSeparate(Ie[K],Ie[Re]),x=K,C=Re),(ae!==b||ce!==E||re!==R||we!==I)&&(e.blendFuncSeparate(tt[ae],tt[ce],tt[re],tt[we]),b=ae,E=ce,R=re,I=we),(Fe.equals(v)===!1||Xt!==y)&&(e.blendColor(Fe.r,Fe.g,Fe.b,Xt),v.copy(Fe),y=Xt),f=w,Y=!1}function st(w,K){w.side===2?ve(e.CULL_FACE):he(e.CULL_FACE);let ae=w.side===1;K&&(ae=!ae),at(ae),w.blending===1&&w.transparent===!1?Ke(0):Ke(w.blending,w.blendEquation,w.blendSrc,w.blendDst,w.blendEquationAlpha,w.blendSrcAlpha,w.blendDstAlpha,w.blendColor,w.blendAlpha,w.premultipliedAlpha),a.setFunc(w.depthFunc),a.setTest(w.depthTest),a.setMask(w.depthWrite),s.setMask(w.colorWrite);const ce=w.stencilWrite;o.setTest(ce),ce&&(o.setMask(w.stencilWriteMask),o.setFunc(w.stencilFunc,w.stencilRef,w.stencilFuncMask),o.setOp(w.stencilFail,w.stencilZFail,w.stencilZPass)),Je(w.polygonOffset,w.polygonOffsetFactor,w.polygonOffsetUnits),w.alphaToCoverage===!0?he(e.SAMPLE_ALPHA_TO_COVERAGE):ve(e.SAMPLE_ALPHA_TO_COVERAGE)}function at(w){A!==w&&(w?e.frontFace(e.CW):e.frontFace(e.CCW),A=w)}function ot(w){w!==0?(he(e.CULL_FACE),w!==H&&(w===1?e.cullFace(e.BACK):w===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):ve(e.CULL_FACE),H=w}function P(w){w!==j&&(V&&e.lineWidth(w),j=w)}function Je(w,K,ae){w?(he(e.POLYGON_OFFSET_FILL),(F!==K||O!==ae)&&(F=K,O=ae,a.getReversed()&&(K=-K),e.polygonOffset(K,ae))):ve(e.POLYGON_OFFSET_FILL)}function De(w){w?he(e.SCISSOR_TEST):ve(e.SCISSOR_TEST)}function Ue(w){w===void 0&&(w=e.TEXTURE0+z-1),ne!==w&&(e.activeTexture(w),ne=w)}function fe(w,K,ae){ae===void 0&&(ne===null?ae=e.TEXTURE0+z-1:ae=ne);let ce=de[ae];ce===void 0&&(ce={type:void 0,texture:void 0},de[ae]=ce),(ce.type!==w||ce.texture!==K)&&(ne!==ae&&(e.activeTexture(ae),ne=ae),e.bindTexture(w,K||me[w]),ce.type=w,ce.texture=K)}function nt(){const w=de[ne];w!==void 0&&w.type!==void 0&&(e.bindTexture(w.type,null),w.type=void 0,w.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(w){Ve("WebGLState:",w)}}function T(){try{e.compressedTexImage3D(...arguments)}catch(w){Ve("WebGLState:",w)}}function _(){try{e.texSubImage2D(...arguments)}catch(w){Ve("WebGLState:",w)}}function U(){try{e.texSubImage3D(...arguments)}catch(w){Ve("WebGLState:",w)}}function Q(){try{e.compressedTexSubImage2D(...arguments)}catch(w){Ve("WebGLState:",w)}}function te(){try{e.compressedTexSubImage3D(...arguments)}catch(w){Ve("WebGLState:",w)}}function oe(){try{e.texStorage2D(...arguments)}catch(w){Ve("WebGLState:",w)}}function ue(){try{e.texStorage3D(...arguments)}catch(w){Ve("WebGLState:",w)}}function D(){try{e.texImage2D(...arguments)}catch(w){Ve("WebGLState:",w)}}function G(){try{e.texImage3D(...arguments)}catch(w){Ve("WebGLState:",w)}}function N(w){return h[w]!==void 0?h[w]:e.getParameter(w)}function $(w,K){h[w]!==K&&(e.pixelStorei(w,K),h[w]=K)}function J(w){Pe.equals(w)===!1&&(e.scissor(w.x,w.y,w.z,w.w),Pe.copy(w))}function Te(w){Z.equals(w)===!1&&(e.viewport(w.x,w.y,w.z,w.w),Z.copy(w))}function Ae(w,K){let ae=l.get(K);ae===void 0&&(ae=new WeakMap,l.set(K,ae));let ce=ae.get(w);ce===void 0&&(ce=e.getUniformBlockIndex(K,w.name),ae.set(w,ce))}function Ce(w,K){const ae=l.get(K).get(w);c.get(K)!==ae&&(e.uniformBlockBinding(K,ae,w.__bindingPointIndex),c.set(K,ae))}function ze(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),a.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},h={},ne=null,de={},d={},m=new WeakMap,S=[],M=null,p=!1,f=null,x=null,b=null,E=null,C=null,R=null,I=null,v=new rt(0,0,0),y=0,Y=!1,A=null,H=null,j=null,F=null,O=null,Pe.set(0,0,e.canvas.width,e.canvas.height),Z.set(0,0,e.canvas.width,e.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:he,disable:ve,bindFramebuffer:Me,drawBuffers:ye,useProgram:Xe,setBlending:Ke,setMaterial:st,setFlipSided:at,setCullFace:ot,setLineWidth:P,setPolygonOffset:Je,setScissorTest:De,activeTexture:Ue,bindTexture:fe,unbindTexture:nt,compressedTexImage2D:xe,compressedTexImage3D:T,texImage2D:D,texImage3D:G,pixelStorei:$,getParameter:N,updateUBOMapping:Ae,uniformBlockBinding:Ce,texStorage2D:oe,texStorage3D:ue,texSubImage2D:_,texSubImage3D:U,compressedTexSubImage2D:Q,compressedTexSubImage3D:te,scissor:J,viewport:Te,reset:ze}}function Lp(e,t,n,i,r,s,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ft,u=new WeakMap,h=new Set;let d;const m=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(T,_){return S?new OffscreenCanvas(T,_):xs("canvas")}function p(T,_,U){let Q=1;const te=xe(T);if((te.width>U||te.height>U)&&(Q=U/Math.max(te.width,te.height)),Q<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const oe=Math.floor(Q*te.width),ue=Math.floor(Q*te.height);d===void 0&&(d=M(oe,ue));const D=_?M(oe,ue):d;return D.width=oe,D.height=ue,D.getContext("2d").drawImage(T,0,0,oe,ue),Ne("WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+oe+"x"+ue+")."),D}else return"data"in T&&Ne("WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),T;return T}function f(T){return T.generateMipmaps}function x(T){e.generateMipmap(T)}function b(T){return T.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?e.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function E(T,_,U,Q,te,oe=!1){if(T!==null){if(e[T]!==void 0)return e[T];Ne("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ue;Q&&(ue=t.get("EXT_texture_norm16"),ue||Ne("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let D=_;if(_===e.RED&&(U===e.FLOAT&&(D=e.R32F),U===e.HALF_FLOAT&&(D=e.R16F),U===e.UNSIGNED_BYTE&&(D=e.R8),U===e.UNSIGNED_SHORT&&ue&&(D=ue.R16_EXT),U===e.SHORT&&ue&&(D=ue.R16_SNORM_EXT)),_===e.RED_INTEGER&&(U===e.UNSIGNED_BYTE&&(D=e.R8UI),U===e.UNSIGNED_SHORT&&(D=e.R16UI),U===e.UNSIGNED_INT&&(D=e.R32UI),U===e.BYTE&&(D=e.R8I),U===e.SHORT&&(D=e.R16I),U===e.INT&&(D=e.R32I)),_===e.RG&&(U===e.FLOAT&&(D=e.RG32F),U===e.HALF_FLOAT&&(D=e.RG16F),U===e.UNSIGNED_BYTE&&(D=e.RG8),U===e.UNSIGNED_SHORT&&ue&&(D=ue.RG16_EXT),U===e.SHORT&&ue&&(D=ue.RG16_SNORM_EXT)),_===e.RG_INTEGER&&(U===e.UNSIGNED_BYTE&&(D=e.RG8UI),U===e.UNSIGNED_SHORT&&(D=e.RG16UI),U===e.UNSIGNED_INT&&(D=e.RG32UI),U===e.BYTE&&(D=e.RG8I),U===e.SHORT&&(D=e.RG16I),U===e.INT&&(D=e.RG32I)),_===e.RGB_INTEGER&&(U===e.UNSIGNED_BYTE&&(D=e.RGB8UI),U===e.UNSIGNED_SHORT&&(D=e.RGB16UI),U===e.UNSIGNED_INT&&(D=e.RGB32UI),U===e.BYTE&&(D=e.RGB8I),U===e.SHORT&&(D=e.RGB16I),U===e.INT&&(D=e.RGB32I)),_===e.RGBA_INTEGER&&(U===e.UNSIGNED_BYTE&&(D=e.RGBA8UI),U===e.UNSIGNED_SHORT&&(D=e.RGBA16UI),U===e.UNSIGNED_INT&&(D=e.RGBA32UI),U===e.BYTE&&(D=e.RGBA8I),U===e.SHORT&&(D=e.RGBA16I),U===e.INT&&(D=e.RGBA32I)),_===e.RGB&&(U===e.UNSIGNED_SHORT&&ue&&(D=ue.RGB16_EXT),U===e.SHORT&&ue&&(D=ue.RGB16_SNORM_EXT),U===e.UNSIGNED_INT_5_9_9_9_REV&&(D=e.RGB9_E5),U===e.UNSIGNED_INT_10F_11F_11F_REV&&(D=e.R11F_G11F_B10F)),_===e.RGBA){const G=oe?Ss:$e.getTransfer(te);U===e.FLOAT&&(D=e.RGBA32F),U===e.HALF_FLOAT&&(D=e.RGBA16F),U===e.UNSIGNED_BYTE&&(D=G==="srgb"?e.SRGB8_ALPHA8:e.RGBA8),U===e.UNSIGNED_SHORT&&ue&&(D=ue.RGBA16_EXT),U===e.SHORT&&ue&&(D=ue.RGBA16_SNORM_EXT),U===e.UNSIGNED_SHORT_4_4_4_4&&(D=e.RGBA4),U===e.UNSIGNED_SHORT_5_5_5_1&&(D=e.RGB5_A1)}return(D===e.R16F||D===e.R32F||D===e.RG16F||D===e.RG32F||D===e.RGBA16F||D===e.RGBA32F)&&t.get("EXT_color_buffer_float"),D}function C(T,_){let U;return T?_===null||_===1014||_===1020?U=e.DEPTH24_STENCIL8:_===1015?U=e.DEPTH32F_STENCIL8:_===1012&&(U=e.DEPTH24_STENCIL8,Ne("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===1014||_===1020?U=e.DEPTH_COMPONENT24:_===1015?U=e.DEPTH_COMPONENT32F:_===1012&&(U=e.DEPTH_COMPONENT16),U}function R(T,_){return f(T)===!0||T.isFramebufferTexture&&T.minFilter!==1003&&T.minFilter!==1006?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function I(T){const _=T.target;_.removeEventListener("dispose",I),y(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&h.delete(_)}function v(T){const _=T.target;_.removeEventListener("dispose",v),A(_)}function y(T){const _=i.get(T);if(_.__webglInit===void 0)return;const U=T.source,Q=m.get(U);if(Q){const te=Q[_.__cacheKey];te.usedTimes--,te.usedTimes===0&&Y(T),Object.keys(Q).length===0&&m.delete(U)}i.remove(T)}function Y(T){const _=i.get(T);e.deleteTexture(_.__webglTexture);const U=T.source,Q=m.get(U);delete Q[_.__cacheKey],a.memory.textures--}function A(T){const _=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(_.__webglFramebuffer[Q]))for(let te=0;te<_.__webglFramebuffer[Q].length;te++)e.deleteFramebuffer(_.__webglFramebuffer[Q][te]);else e.deleteFramebuffer(_.__webglFramebuffer[Q]);_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer[Q])}else{if(Array.isArray(_.__webglFramebuffer))for(let Q=0;Q<_.__webglFramebuffer.length;Q++)e.deleteFramebuffer(_.__webglFramebuffer[Q]);else e.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&e.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let Q=0;Q<_.__webglColorRenderbuffer.length;Q++)_.__webglColorRenderbuffer[Q]&&e.deleteRenderbuffer(_.__webglColorRenderbuffer[Q]);_.__webglDepthRenderbuffer&&e.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const U=T.textures;for(let Q=0,te=U.length;Q<te;Q++){const oe=i.get(U[Q]);oe.__webglTexture&&(e.deleteTexture(oe.__webglTexture),a.memory.textures--),i.remove(U[Q])}i.remove(T)}let H=0;function j(){H=0}function F(){return H}function O(T){H=T}function z(){const T=H;return T>=r.maxTextures&&Ne("WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),H+=1,T}function V(T){const _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function ee(T,_){const U=i.get(T);if(T.isVideoTexture&&fe(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&U.__version!==T.version){const Q=T.image;if(Q===null)Ne("WebGLRenderer: Texture marked for update but no image data found.");else if(Q.complete===!1)Ne("WebGLRenderer: Texture marked for update but image is incomplete");else{ve(U,T,_);return}}else T.isExternalTexture&&(U.__webglTexture=T.sourceTexture?T.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,U.__webglTexture,e.TEXTURE0+_)}function q(T,_){const U=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){ve(U,T,_);return}else T.isExternalTexture&&(U.__webglTexture=T.sourceTexture?T.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,U.__webglTexture,e.TEXTURE0+_)}function ne(T,_){const U=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){ve(U,T,_);return}n.bindTexture(e.TEXTURE_3D,U.__webglTexture,e.TEXTURE0+_)}function de(T,_){const U=i.get(T);if(T.isCubeDepthTexture!==!0&&T.version>0&&U.__version!==T.version){Me(U,T,_);return}n.bindTexture(e.TEXTURE_CUBE_MAP,U.__webglTexture,e.TEXTURE0+_)}const be={[Ma]:e.REPEAT,[Nn]:e.CLAMP_TO_EDGE,[xa]:e.MIRRORED_REPEAT},We={[Wt]:e.NEAREST,[Ru]:e.NEAREST_MIPMAP_NEAREST,[wu]:e.NEAREST_MIPMAP_LINEAR,[jt]:e.LINEAR,[Cu]:e.LINEAR_MIPMAP_NEAREST,[Da]:e.LINEAR_MIPMAP_LINEAR},Pe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function Z(T,_){if(_.type===1015&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===1006||_.magFilter===1007||_.magFilter===1005||_.magFilter===1008||_.minFilter===1006||_.minFilter===1007||_.minFilter===1005||_.minFilter===1008)&&Ne("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(T,e.TEXTURE_WRAP_S,be[_.wrapS]),e.texParameteri(T,e.TEXTURE_WRAP_T,be[_.wrapT]),(T===e.TEXTURE_3D||T===e.TEXTURE_2D_ARRAY)&&e.texParameteri(T,e.TEXTURE_WRAP_R,be[_.wrapR]),e.texParameteri(T,e.TEXTURE_MAG_FILTER,We[_.magFilter]),e.texParameteri(T,e.TEXTURE_MIN_FILTER,We[_.minFilter]),_.compareFunction&&(e.texParameteri(T,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(T,e.TEXTURE_COMPARE_FUNC,Pe[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===1003||_.minFilter!==1005&&_.minFilter!==1008||_.type===1015&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){const U=t.get("EXT_texture_filter_anisotropic");e.texParameterf(T,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,r.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function se(T,_){let U=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",I));const Q=_.source;let te=m.get(Q);te===void 0&&(te={},m.set(Q,te));const oe=V(_);if(oe!==T.__cacheKey){te[oe]===void 0&&(te[oe]={texture:e.createTexture(),usedTimes:0},a.memory.textures++,U=!0),te[oe].usedTimes++;const ue=te[T.__cacheKey];ue!==void 0&&(te[T.__cacheKey].usedTimes--,ue.usedTimes===0&&Y(_)),T.__cacheKey=oe,T.__webglTexture=te[oe].texture}return U}function me(T,_,U){return Math.floor(Math.floor(T/U)/_)}function he(T,_,U,Q){const oe=T.updateRanges;if(oe.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,_.width,_.height,U,Q,_.data);else{oe.sort(($,J)=>$.start-J.start);let ue=0;for(let $=1;$<oe.length;$++){const J=oe[ue],Te=oe[$],Ae=J.start+J.count,Ce=me(Te.start,_.width,4),ze=me(J.start,_.width,4);Te.start<=Ae+1&&Ce===ze&&me(Te.start+Te.count-1,_.width,4)===Ce?J.count=Math.max(J.count,Te.start+Te.count-J.start):(++ue,oe[ue]=Te)}oe.length=ue+1;const D=n.getParameter(e.UNPACK_ROW_LENGTH),G=n.getParameter(e.UNPACK_SKIP_PIXELS),N=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,_.width);for(let $=0,J=oe.length;$<J;$++){const Te=oe[$],Ae=Math.floor(Te.start/4),Ce=Math.ceil(Te.count/4),ze=Ae%_.width,w=Math.floor(Ae/_.width),K=Ce,ae=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,ze),n.pixelStorei(e.UNPACK_SKIP_ROWS,w),n.texSubImage2D(e.TEXTURE_2D,0,ze,w,K,ae,U,Q,_.data)}T.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,D),n.pixelStorei(e.UNPACK_SKIP_PIXELS,G),n.pixelStorei(e.UNPACK_SKIP_ROWS,N)}}function ve(T,_,U){let Q=e.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(Q=e.TEXTURE_2D_ARRAY),_.isData3DTexture&&(Q=e.TEXTURE_3D);const te=se(T,_),oe=_.source;n.bindTexture(Q,T.__webglTexture,e.TEXTURE0+U);const ue=i.get(oe);if(oe.version!==ue.__version||te===!0){if(n.activeTexture(e.TEXTURE0+U),!(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)){const K=$e.getPrimaries($e.workingColorSpace),ae=_.colorSpace===""?null:$e.getPrimaries(_.colorSpace),ce=_.colorSpace===""||K===ae?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce)}n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment);let D=p(_.image,!1,r.maxTextureSize);D=nt(_,D);const G=s.convert(_.format,_.colorSpace),N=s.convert(_.type);let $=E(_.internalFormat,G,N,_.normalized,_.colorSpace,_.isVideoTexture);Z(Q,_);let J;const Te=_.mipmaps,Ae=_.isVideoTexture!==!0,Ce=ue.__version===void 0||te===!0,ze=oe.dataReady,w=R(_,D);if(_.isDepthTexture)$=C(_.format===Fl,_.type),Ce&&(Ae?n.texStorage2D(e.TEXTURE_2D,1,$,D.width,D.height):n.texImage2D(e.TEXTURE_2D,0,$,D.width,D.height,0,G,N,null));else if(_.isDataTexture)if(Te.length>0){Ae&&Ce&&n.texStorage2D(e.TEXTURE_2D,w,$,Te[0].width,Te[0].height);for(let K=0,ae=Te.length;K<ae;K++)J=Te[K],Ae?ze&&n.texSubImage2D(e.TEXTURE_2D,K,0,0,J.width,J.height,G,N,J.data):n.texImage2D(e.TEXTURE_2D,K,$,J.width,J.height,0,G,N,J.data);_.generateMipmaps=!1}else Ae?(Ce&&n.texStorage2D(e.TEXTURE_2D,w,$,D.width,D.height),ze&&he(_,D,G,N)):n.texImage2D(e.TEXTURE_2D,0,$,D.width,D.height,0,G,N,D.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ae&&Ce&&n.texStorage3D(e.TEXTURE_2D_ARRAY,w,$,Te[0].width,Te[0].height,D.depth);for(let K=0,ae=Te.length;K<ae;K++)if(J=Te[K],_.format!==1023)if(G!==null)if(Ae){if(ze)if(_.layerUpdates.size>0){const ce=Oo(J.width,J.height,_.format,_.type);for(const Re of _.layerUpdates){const re=J.data.subarray(Re*ce/J.data.BYTES_PER_ELEMENT,(Re+1)*ce/J.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,K,0,0,Re,J.width,J.height,1,G,re)}_.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,K,0,0,0,J.width,J.height,D.depth,G,J.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,K,$,J.width,J.height,D.depth,0,J.data,0,0);else Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ae?ze&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,K,0,0,0,J.width,J.height,D.depth,G,N,J.data):n.texImage3D(e.TEXTURE_2D_ARRAY,K,$,J.width,J.height,D.depth,0,G,N,J.data)}else{Ae&&Ce&&n.texStorage2D(e.TEXTURE_2D,w,$,Te[0].width,Te[0].height);for(let K=0,ae=Te.length;K<ae;K++)J=Te[K],_.format!==1023?G!==null?Ae?ze&&n.compressedTexSubImage2D(e.TEXTURE_2D,K,0,0,J.width,J.height,G,J.data):n.compressedTexImage2D(e.TEXTURE_2D,K,$,J.width,J.height,0,J.data):Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ae?ze&&n.texSubImage2D(e.TEXTURE_2D,K,0,0,J.width,J.height,G,N,J.data):n.texImage2D(e.TEXTURE_2D,K,$,J.width,J.height,0,G,N,J.data)}else if(_.isDataArrayTexture)if(Ae){if(Ce&&n.texStorage3D(e.TEXTURE_2D_ARRAY,w,$,D.width,D.height,D.depth),ze)if(_.layerUpdates.size>0){const K=Oo(D.width,D.height,_.format,_.type);for(const ae of _.layerUpdates){const ce=D.data.subarray(ae*K/D.data.BYTES_PER_ELEMENT,(ae+1)*K/D.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ae,D.width,D.height,1,G,N,ce)}_.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,D.width,D.height,D.depth,G,N,D.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,$,D.width,D.height,D.depth,0,G,N,D.data);else if(_.isData3DTexture)Ae?(Ce&&n.texStorage3D(e.TEXTURE_3D,w,$,D.width,D.height,D.depth),ze&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,D.width,D.height,D.depth,G,N,D.data)):n.texImage3D(e.TEXTURE_3D,0,$,D.width,D.height,D.depth,0,G,N,D.data);else if(_.isFramebufferTexture){if(Ce)if(Ae)n.texStorage2D(e.TEXTURE_2D,w,$,D.width,D.height);else{let K=D.width,ae=D.height;for(let ce=0;ce<w;ce++)n.texImage2D(e.TEXTURE_2D,ce,$,K,ae,0,G,N,null),K>>=1,ae>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in e){const K=e.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),D.parentNode!==K){K.appendChild(D),h.add(_),K.onpaint=we=>{const Fe=we.changedElements;for(const Xt of h)Fe.includes(Xt.image)&&(Xt.needsUpdate=!0)},K.requestPaint();return}const ae=0,ce=e.RGBA,Re=e.RGBA,re=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,ae,ce,Re,re,D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Te.length>0){if(Ae&&Ce){const K=xe(Te[0]);n.texStorage2D(e.TEXTURE_2D,w,$,K.width,K.height)}for(let K=0,ae=Te.length;K<ae;K++)J=Te[K],Ae?ze&&n.texSubImage2D(e.TEXTURE_2D,K,0,0,G,N,J):n.texImage2D(e.TEXTURE_2D,K,$,G,N,J);_.generateMipmaps=!1}else if(Ae){if(Ce){const K=xe(D);n.texStorage2D(e.TEXTURE_2D,w,$,K.width,K.height)}ze&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,G,N,D)}else n.texImage2D(e.TEXTURE_2D,0,$,G,N,D);f(_)&&x(Q),ue.__version=oe.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function Me(T,_,U){if(_.image.length!==6)return;const Q=se(T,_),te=_.source;n.bindTexture(e.TEXTURE_CUBE_MAP,T.__webglTexture,e.TEXTURE0+U);const oe=i.get(te);if(te.version!==oe.__version||Q===!0){n.activeTexture(e.TEXTURE0+U);const ue=$e.getPrimaries($e.workingColorSpace),D=_.colorSpace===""?null:$e.getPrimaries(_.colorSpace),G=_.colorSpace===""||ue===D?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,G);const N=_.isCompressedTexture||_.image[0].isCompressedTexture,$=_.image[0]&&_.image[0].isDataTexture,J=[];for(let re=0;re<6;re++)!N&&!$?J[re]=p(_.image[re],!0,r.maxCubemapSize):J[re]=$?_.image[re].image:_.image[re],J[re]=nt(_,J[re]);const Te=J[0],Ae=s.convert(_.format,_.colorSpace),Ce=s.convert(_.type),ze=E(_.internalFormat,Ae,Ce,_.normalized,_.colorSpace),w=_.isVideoTexture!==!0,K=oe.__version===void 0||Q===!0,ae=te.dataReady;let ce=R(_,Te);Z(e.TEXTURE_CUBE_MAP,_);let Re;if(N){w&&K&&n.texStorage2D(e.TEXTURE_CUBE_MAP,ce,ze,Te.width,Te.height);for(let re=0;re<6;re++){Re=J[re].mipmaps;for(let we=0;we<Re.length;we++){const Fe=Re[we];_.format!==1023?Ae!==null?w?ae&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we,0,0,Fe.width,Fe.height,Ae,Fe.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we,ze,Fe.width,Fe.height,0,Fe.data):Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):w?ae&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we,0,0,Fe.width,Fe.height,Ae,Ce,Fe.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we,ze,Fe.width,Fe.height,0,Ae,Ce,Fe.data)}}}else{if(Re=_.mipmaps,w&&K){Re.length>0&&ce++;const re=xe(J[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,ce,ze,re.width,re.height)}for(let re=0;re<6;re++)if($){w?ae&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,J[re].width,J[re].height,Ae,Ce,J[re].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,ze,J[re].width,J[re].height,0,Ae,Ce,J[re].data);for(let we=0;we<Re.length;we++){const Fe=Re[we].image[re].image;w?ae&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we+1,0,0,Fe.width,Fe.height,Ae,Ce,Fe.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we+1,ze,Fe.width,Fe.height,0,Ae,Ce,Fe.data)}}else{w?ae&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,Ae,Ce,J[re]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,ze,Ae,Ce,J[re]);for(let we=0;we<Re.length;we++){const Fe=Re[we];w?ae&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we+1,0,0,Ae,Ce,Fe.image[re]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+re,we+1,ze,Ae,Ce,Fe.image[re])}}}f(_)&&x(e.TEXTURE_CUBE_MAP),oe.__version=te.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ye(T,_,U,Q,te,oe){const ue=s.convert(U.format,U.colorSpace),D=s.convert(U.type),G=E(U.internalFormat,ue,D,U.normalized,U.colorSpace),N=i.get(_),$=i.get(U);if($.__renderTarget=_,!N.__hasExternalTextures){const J=Math.max(1,_.width>>oe),Te=Math.max(1,_.height>>oe);te===e.TEXTURE_3D||te===e.TEXTURE_2D_ARRAY?n.texImage3D(te,oe,G,J,Te,_.depth,0,ue,D,null):n.texImage2D(te,oe,G,J,Te,0,ue,D,null)}n.bindFramebuffer(e.FRAMEBUFFER,T),Ue(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Q,te,$.__webglTexture,0,De(_)):(te===e.TEXTURE_2D||te>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,Q,te,$.__webglTexture,oe),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Xe(T,_,U){if(e.bindRenderbuffer(e.RENDERBUFFER,T),_.depthBuffer){const Q=_.depthTexture,te=Q&&Q.isDepthTexture?Q.type:null,oe=C(_.stencilBuffer,te),ue=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Ue(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,De(_),oe,_.width,_.height):U?e.renderbufferStorageMultisample(e.RENDERBUFFER,De(_),oe,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,oe,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ue,e.RENDERBUFFER,T)}else{const Q=_.textures;for(let te=0;te<Q.length;te++){const oe=Q[te],ue=s.convert(oe.format,oe.colorSpace),D=s.convert(oe.type),G=E(oe.internalFormat,ue,D,oe.normalized,oe.colorSpace);Ue(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,De(_),G,_.width,_.height):U?e.renderbufferStorageMultisample(e.RENDERBUFFER,De(_),G,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,G,_.width,_.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ie(T,_,U){const Q=_.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const te=i.get(_.depthTexture);if(te.__renderTarget=_,(!te.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),Q){if(te.__webglInit===void 0&&(te.__webglInit=!0,_.depthTexture.addEventListener("dispose",I)),te.__webglTexture===void 0){te.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,te.__webglTexture),Z(e.TEXTURE_CUBE_MAP,_.depthTexture);const N=s.convert(_.depthTexture.format),$=s.convert(_.depthTexture.type);let J;_.depthTexture.format===1026?J=e.DEPTH_COMPONENT24:_.depthTexture.format===1027&&(J=e.DEPTH24_STENCIL8);for(let Te=0;Te<6;Te++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,J,_.width,_.height,0,N,$,null)}}else ee(_.depthTexture,0);const oe=te.__webglTexture,ue=De(_),D=Q?e.TEXTURE_CUBE_MAP_POSITIVE_X+U:e.TEXTURE_2D,G=_.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(_.depthTexture.format===1026)Ue(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,G,D,oe,0,ue):e.framebufferTexture2D(e.FRAMEBUFFER,G,D,oe,0);else if(_.depthTexture.format===1027)Ue(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,G,D,oe,0,ue):e.framebufferTexture2D(e.FRAMEBUFFER,G,D,oe,0);else throw new Error("Unknown depthTexture format")}function tt(T){const _=i.get(T),U=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){const Q=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),Q){const te=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,Q.removeEventListener("dispose",te)};Q.addEventListener("dispose",te),_.__depthDisposeCallback=te}_.__boundDepthTexture=Q}if(T.depthTexture&&!_.__autoAllocateDepthBuffer)if(U)for(let Q=0;Q<6;Q++)Ie(_.__webglFramebuffer[Q],T,Q);else{const Q=T.texture.mipmaps;Q&&Q.length>0?Ie(_.__webglFramebuffer[0],T,0):Ie(_.__webglFramebuffer,T,0)}else if(U){_.__webglDepthbuffer=[];for(let Q=0;Q<6;Q++)if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[Q]),_.__webglDepthbuffer[Q]===void 0)_.__webglDepthbuffer[Q]=e.createRenderbuffer(),Xe(_.__webglDepthbuffer[Q],T,!1);else{const te=T.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,oe=_.__webglDepthbuffer[Q];e.bindRenderbuffer(e.RENDERBUFFER,oe),e.framebufferRenderbuffer(e.FRAMEBUFFER,te,e.RENDERBUFFER,oe)}}else{const Q=T.texture.mipmaps;if(Q&&Q.length>0?n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=e.createRenderbuffer(),Xe(_.__webglDepthbuffer,T,!1);else{const te=T.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,oe=_.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,oe),e.framebufferRenderbuffer(e.FRAMEBUFFER,te,e.RENDERBUFFER,oe)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ke(T,_,U){const Q=i.get(T);_!==void 0&&ye(Q.__webglFramebuffer,T,T.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),U!==void 0&&tt(T)}function st(T){const _=T.texture,U=i.get(T),Q=i.get(_);T.addEventListener("dispose",v);const te=T.textures,oe=T.isWebGLCubeRenderTarget===!0,ue=te.length>1;if(ue||(Q.__webglTexture===void 0&&(Q.__webglTexture=e.createTexture()),Q.__version=_.version,a.memory.textures++),oe){U.__webglFramebuffer=[];for(let D=0;D<6;D++)if(_.mipmaps&&_.mipmaps.length>0){U.__webglFramebuffer[D]=[];for(let G=0;G<_.mipmaps.length;G++)U.__webglFramebuffer[D][G]=e.createFramebuffer()}else U.__webglFramebuffer[D]=e.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){U.__webglFramebuffer=[];for(let D=0;D<_.mipmaps.length;D++)U.__webglFramebuffer[D]=e.createFramebuffer()}else U.__webglFramebuffer=e.createFramebuffer();if(ue)for(let D=0,G=te.length;D<G;D++){const N=i.get(te[D]);N.__webglTexture===void 0&&(N.__webglTexture=e.createTexture(),a.memory.textures++)}if(T.samples>0&&Ue(T)===!1){U.__webglMultisampledFramebuffer=e.createFramebuffer(),U.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let D=0;D<te.length;D++){const G=te[D];U.__webglColorRenderbuffer[D]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,U.__webglColorRenderbuffer[D]);const N=s.convert(G.format,G.colorSpace),$=s.convert(G.type),J=E(G.internalFormat,N,$,G.normalized,G.colorSpace,T.isXRRenderTarget===!0),Te=De(T);e.renderbufferStorageMultisample(e.RENDERBUFFER,Te,J,T.width,T.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+D,e.RENDERBUFFER,U.__webglColorRenderbuffer[D])}e.bindRenderbuffer(e.RENDERBUFFER,null),T.depthBuffer&&(U.__webglDepthRenderbuffer=e.createRenderbuffer(),Xe(U.__webglDepthRenderbuffer,T,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(oe){n.bindTexture(e.TEXTURE_CUBE_MAP,Q.__webglTexture),Z(e.TEXTURE_CUBE_MAP,_);for(let D=0;D<6;D++)if(_.mipmaps&&_.mipmaps.length>0)for(let G=0;G<_.mipmaps.length;G++)ye(U.__webglFramebuffer[D][G],T,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+D,G);else ye(U.__webglFramebuffer[D],T,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+D,0);f(_)&&x(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ue){for(let D=0,G=te.length;D<G;D++){const N=te[D],$=i.get(N);let J=e.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(J=T.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(J,$.__webglTexture),Z(J,N),ye(U.__webglFramebuffer,T,N,e.COLOR_ATTACHMENT0+D,J,0),f(N)&&x(J)}n.unbindTexture()}else{let D=e.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(D=T.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(D,Q.__webglTexture),Z(D,_),_.mipmaps&&_.mipmaps.length>0)for(let G=0;G<_.mipmaps.length;G++)ye(U.__webglFramebuffer[G],T,_,e.COLOR_ATTACHMENT0,D,G);else ye(U.__webglFramebuffer,T,_,e.COLOR_ATTACHMENT0,D,0);f(_)&&x(D),n.unbindTexture()}T.depthBuffer&&tt(T)}function at(T){const _=T.textures;for(let U=0,Q=_.length;U<Q;U++){const te=_[U];if(f(te)){const oe=b(T),ue=i.get(te).__webglTexture;n.bindTexture(oe,ue),x(oe),n.unbindTexture()}}}const ot=[],P=[];function Je(T){if(T.samples>0){if(Ue(T)===!1){const _=T.textures,U=T.width,Q=T.height;let te=e.COLOR_BUFFER_BIT;const oe=T.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ue=i.get(T),D=_.length>1;if(D)for(let N=0;N<_.length;N++)n.bindFramebuffer(e.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+N,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,ue.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+N,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,ue.__webglMultisampledFramebuffer);const G=T.texture.mipmaps;G&&G.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ue.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ue.__webglFramebuffer);for(let N=0;N<_.length;N++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(te|=e.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(te|=e.STENCIL_BUFFER_BIT)),D){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ue.__webglColorRenderbuffer[N]);const $=i.get(_[N]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,$,0)}e.blitFramebuffer(0,0,U,Q,0,0,U,Q,te,e.NEAREST),c===!0&&(ot.length=0,P.length=0,ot.push(e.COLOR_ATTACHMENT0+N),T.depthBuffer&&T.resolveDepthBuffer===!1&&(ot.push(oe),P.push(oe),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,P)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ot))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),D)for(let N=0;N<_.length;N++){n.bindFramebuffer(e.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+N,e.RENDERBUFFER,ue.__webglColorRenderbuffer[N]);const $=i.get(_[N]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,ue.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+N,e.TEXTURE_2D,$,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ue.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){const _=T.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[_])}}}function De(T){return Math.min(r.maxSamples,T.samples)}function Ue(T){const _=i.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function fe(T){const _=a.render.frame;u.get(T)!==_&&(u.set(T,_),T.update())}function nt(T,_){const U=T.colorSpace,Q=T.format,te=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||U!=="srgb-linear"&&U!==""&&($e.getTransfer(U)==="srgb"?(Q!==1023||te!==1009)&&Ne("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ve("WebGLTextures: Unsupported texture color space:",U)),_}function xe(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=z,this.resetTextureUnits=j,this.getTextureUnits=F,this.setTextureUnits=O,this.setTexture2D=ee,this.setTexture2DArray=q,this.setTexture3D=ne,this.setTextureCube=de,this.rebindTextures=Ke,this.setupRenderTarget=st,this.updateRenderTargetMipmap=at,this.updateMultisampleRenderTarget=Je,this.setupDepthRenderbuffer=tt,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=Ue,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Np(e,t){function n(i,r=""){let s;const a=$e.getTransfer(r);if(i===1009)return e.UNSIGNED_BYTE;if(i===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===1010)return e.BYTE;if(i===1011)return e.SHORT;if(i===1012)return e.UNSIGNED_SHORT;if(i===1013)return e.INT;if(i===1014)return e.UNSIGNED_INT;if(i===1015)return e.FLOAT;if(i===1016)return e.HALF_FLOAT;if(i===1021)return e.ALPHA;if(i===1022)return e.RGB;if(i===1023)return e.RGBA;if(i===1026)return e.DEPTH_COMPONENT;if(i===1027)return e.DEPTH_STENCIL;if(i===1028)return e.RED;if(i===1029)return e.RED_INTEGER;if(i===1030)return e.RG;if(i===1031)return e.RG_INTEGER;if(i===1033)return e.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(a==="srgb")if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===33776)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===33776)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===35840)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496||i===37488||i===37489||i===37490||i===37491)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===36196||i===37492)return a==="srgb"?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===37496)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===37488)return s.COMPRESSED_R11_EAC;if(i===37489)return s.COMPRESSED_SIGNED_R11_EAC;if(i===37490)return s.COMPRESSED_RG11_EAC;if(i===37491)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===37808)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return a==="srgb"?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===36492)return a==="srgb"?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===36283)return s.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var Up=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Fp=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Op=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new tc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new fn({vertexShader:Up,fragmentShader:Fp,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new En(new Fa(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Bp=class extends fi{constructor(e,t){super();const n=this;let i=null,r=1,s=null,a="local-floor",o=1,c=null,l=null,u=null,h=null,d=null,m=null;const S=typeof XRWebGLBinding<"u",M=new Op,p={},f=t.getContextAttributes();let x=null,b=null;const E=[],C=[],R=new ft;let I=null;const v=new hn;v.viewport=new wt;const y=new hn;y.viewport=new wt;const Y=[v,y],A=new gh;let H=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let se=E[Z];return se===void 0&&(se=new Xs,E[Z]=se),se.getTargetRaySpace()},this.getControllerGrip=function(Z){let se=E[Z];return se===void 0&&(se=new Xs,E[Z]=se),se.getGripSpace()},this.getHand=function(Z){let se=E[Z];return se===void 0&&(se=new Xs,E[Z]=se),se.getHandSpace()};function F(Z){const se=C.indexOf(Z.inputSource);if(se===-1)return;const me=E[se];me!==void 0&&(me.update(Z.inputSource,Z.frame,c||s),me.dispatchEvent({type:Z.type,data:Z.inputSource}))}function O(){i.removeEventListener("select",F),i.removeEventListener("selectstart",F),i.removeEventListener("selectend",F),i.removeEventListener("squeeze",F),i.removeEventListener("squeezestart",F),i.removeEventListener("squeezeend",F),i.removeEventListener("end",O),i.removeEventListener("inputsourceschange",z);for(let Z=0;Z<E.length;Z++){const se=C[Z];se!==null&&(C[Z]=null,E[Z].disconnect(se))}H=null,j=null,M.reset();for(const Z in p)delete p[Z];e.setRenderTarget(x),d=null,h=null,u=null,i=null,b=null,Pe.stop(),n.isPresenting=!1,e.setPixelRatio(I),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&Ne("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,n.isPresenting===!0&&Ne("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||s},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return u===null&&S&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(Z){if(i=Z,i!==null){if(x=e.getRenderTarget(),i.addEventListener("select",F),i.addEventListener("selectstart",F),i.addEventListener("selectend",F),i.addEventListener("squeeze",F),i.addEventListener("squeezestart",F),i.addEventListener("squeezeend",F),i.addEventListener("end",O),i.addEventListener("inputsourceschange",z),f.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(R),S&&"createProjectionLayer"in XRWebGLBinding.prototype){let se=null,me=null,he=null;f.depth&&(he=f.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=f.stencil?Fl:Sr,me=f.stencil?Ul:di);const ve={colorFormat:t.RGBA8,depthFormat:he,scaleFactor:r};u=this.getBinding(),h=u.createProjectionLayer(ve),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),b=new Tn(h.textureWidth,h.textureHeight,{format:gr,type:ui,depthTexture:new Yi(h.textureWidth,h.textureHeight,me,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:f.stencil,colorSpace:e.outputColorSpace,samples:f.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const se={antialias:f.antialias,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,se),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),b=new Tn(d.framebufferWidth,d.framebufferHeight,{format:gr,type:ui,colorSpace:e.outputColorSpace,stencilBuffer:f.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(o),c=null,s=await i.requestReferenceSpace(a),Pe.setContext(i),Pe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return M.getDepthTexture()};function z(Z){for(let se=0;se<Z.removed.length;se++){const me=Z.removed[se],he=C.indexOf(me);he>=0&&(C[he]=null,E[he].disconnect(me))}for(let se=0;se<Z.added.length;se++){const me=Z.added[se];let he=C.indexOf(me);if(he===-1){for(let Me=0;Me<E.length;Me++)if(Me>=C.length){C.push(me),he=Me;break}else if(C[Me]===null){C[Me]=me,he=Me;break}if(he===-1)break}const ve=E[he];ve&&ve.connect(me)}}const V=new W,ee=new W;function q(Z,se,me){V.setFromMatrixPosition(se.matrixWorld),ee.setFromMatrixPosition(me.matrixWorld);const he=V.distanceTo(ee),ve=se.projectionMatrix.elements,Me=me.projectionMatrix.elements,ye=ve[14]/(ve[10]-1),Xe=ve[14]/(ve[10]+1),Ie=(ve[9]+1)/ve[5],tt=(ve[9]-1)/ve[5],Ke=(ve[8]-1)/ve[0],st=(Me[8]+1)/Me[0],at=ye*Ke,ot=ye*st,P=he/(-Ke+st),Je=P*-Ke;if(se.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(Je),Z.translateZ(P),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),ve[10]===-1)Z.projectionMatrix.copy(se.projectionMatrix),Z.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{const De=ye+P,Ue=Xe+P,fe=at-Je,nt=ot+(he-Je),xe=Ie*Xe/Ue*De,T=tt*Xe/Ue*De;Z.projectionMatrix.makePerspective(fe,nt,xe,T,De,Ue),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ne(Z,se){se===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(se.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(i===null)return;let se=Z.near,me=Z.far;M.texture!==null&&(M.depthNear>0&&(se=M.depthNear),M.depthFar>0&&(me=M.depthFar)),A.near=y.near=v.near=se,A.far=y.far=v.far=me,(H!==A.near||j!==A.far)&&(i.updateRenderState({depthNear:A.near,depthFar:A.far}),H=A.near,j=A.far),A.layers.mask=Z.layers.mask|6,v.layers.mask=A.layers.mask&-5,y.layers.mask=A.layers.mask&-3;const he=Z.parent,ve=A.cameras;ne(A,he);for(let Me=0;Me<ve.length;Me++)ne(ve[Me],he);ve.length===2?q(A,v,y):A.projectionMatrix.copy(v.projectionMatrix),de(Z,A,he)};function de(Z,se,me){me===null?Z.matrix.copy(se.matrixWorld):(Z.matrix.copy(me.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(se.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(se.projectionMatrix),Z.projectionMatrixInverse.copy(se.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=ba*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(!(h===null&&d===null))return o},this.setFoveation=function(Z){o=Z,h!==null&&(h.fixedFoveation=Z),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Z)},this.hasDepthSensing=function(){return M.texture!==null},this.getDepthSensingMesh=function(){return M.getMesh(A)},this.getCameraTexture=function(Z){return p[Z]};let be=null;function We(Z,se){if(l=se.getViewerPose(c||s),m=se,l!==null){const me=l.views;d!==null&&(e.setRenderTargetFramebuffer(b,d.framebuffer),e.setRenderTarget(b));let he=!1;me.length!==A.cameras.length&&(A.cameras.length=0,he=!0);for(let Me=0;Me<me.length;Me++){const ye=me[Me];let Xe=null;if(d!==null)Xe=d.getViewport(ye);else{const tt=u.getViewSubImage(h,ye);Xe=tt.viewport,Me===0&&(e.setRenderTargetTextures(b,tt.colorTexture,tt.depthStencilTexture),e.setRenderTarget(b))}let Ie=Y[Me];Ie===void 0&&(Ie=new hn,Ie.layers.enable(Me),Ie.viewport=new wt,Y[Me]=Ie),Ie.matrix.fromArray(ye.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(ye.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(Xe.x,Xe.y,Xe.width,Xe.height),Me===0&&(A.matrix.copy(Ie.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),he===!0&&A.cameras.push(Ie)}const ve=i.enabledFeatures;if(ve&&ve.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&S){u=n.getBinding();const Me=u.getDepthInformation(me[0]);Me&&Me.isValid&&Me.texture&&M.init(Me,i.renderState)}if(ve&&ve.includes("camera-access")&&S){e.state.unbindTexture(),u=n.getBinding();for(let Me=0;Me<me.length;Me++){const ye=me[Me].camera;if(ye){let Xe=p[ye];Xe||(Xe=new tc,p[ye]=Xe);const Ie=u.getCameraImage(ye);Xe.sourceTexture=Ie}}}}for(let me=0;me<E.length;me++){const he=C[me],ve=E[me];he!==null&&ve!==void 0&&ve.update(he,se,c||s)}be&&be(Z,se),se.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:se}),m=null}const Pe=new lc;Pe.setAnimationLoop(We),this.setAnimationLoop=function(Z){be=Z},this.dispose=function(){}}},Vp=new Ft,mc=new ke;mc.set(-1,0,0,0,1,0,0,0,1);function zp(e,t){function n(p,f){p.matrixAutoUpdate===!0&&p.updateMatrix(),f.value.copy(p.matrix)}function i(p,f){f.color.getRGB(p.fogColor.value,rc(e)),f.isFog?(p.fogNear.value=f.near,p.fogFar.value=f.far):f.isFogExp2&&(p.fogDensity.value=f.density)}function r(p,f,x,b,E){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?s(p,f):f.isMeshLambertMaterial?(s(p,f),f.envMap&&(p.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(s(p,f),h(p,f)):f.isMeshPhongMaterial?(s(p,f),u(p,f),f.envMap&&(p.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(s(p,f),d(p,f),f.isMeshPhysicalMaterial&&m(p,f,E)):f.isMeshMatcapMaterial?(s(p,f),S(p,f)):f.isMeshDepthMaterial?s(p,f):f.isMeshDistanceMaterial?(s(p,f),M(p,f)):f.isMeshNormalMaterial?s(p,f):f.isLineBasicMaterial?(a(p,f),f.isLineDashedMaterial&&o(p,f)):f.isPointsMaterial?c(p,f,x,b):f.isSpriteMaterial?l(p,f):f.isShadowMaterial?(p.color.value.copy(f.color),p.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(p,f){p.opacity.value=f.opacity,f.color&&p.diffuse.value.copy(f.color),f.emissive&&p.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(p.map.value=f.map,n(f.map,p.mapTransform)),f.alphaMap&&(p.alphaMap.value=f.alphaMap,n(f.alphaMap,p.alphaMapTransform)),f.bumpMap&&(p.bumpMap.value=f.bumpMap,n(f.bumpMap,p.bumpMapTransform),p.bumpScale.value=f.bumpScale,f.side===1&&(p.bumpScale.value*=-1)),f.normalMap&&(p.normalMap.value=f.normalMap,n(f.normalMap,p.normalMapTransform),p.normalScale.value.copy(f.normalScale),f.side===1&&p.normalScale.value.negate()),f.displacementMap&&(p.displacementMap.value=f.displacementMap,n(f.displacementMap,p.displacementMapTransform),p.displacementScale.value=f.displacementScale,p.displacementBias.value=f.displacementBias),f.emissiveMap&&(p.emissiveMap.value=f.emissiveMap,n(f.emissiveMap,p.emissiveMapTransform)),f.specularMap&&(p.specularMap.value=f.specularMap,n(f.specularMap,p.specularMapTransform)),f.alphaTest>0&&(p.alphaTest.value=f.alphaTest);const x=t.get(f),b=x.envMap,E=x.envMapRotation;b&&(p.envMap.value=b,p.envMapRotation.value.setFromMatrix4(Vp.makeRotationFromEuler(E)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(mc),p.reflectivity.value=f.reflectivity,p.ior.value=f.ior,p.refractionRatio.value=f.refractionRatio),f.lightMap&&(p.lightMap.value=f.lightMap,p.lightMapIntensity.value=f.lightMapIntensity,n(f.lightMap,p.lightMapTransform)),f.aoMap&&(p.aoMap.value=f.aoMap,p.aoMapIntensity.value=f.aoMapIntensity,n(f.aoMap,p.aoMapTransform))}function a(p,f){p.diffuse.value.copy(f.color),p.opacity.value=f.opacity,f.map&&(p.map.value=f.map,n(f.map,p.mapTransform))}function o(p,f){p.dashSize.value=f.dashSize,p.totalSize.value=f.dashSize+f.gapSize,p.scale.value=f.scale}function c(p,f,x,b){p.diffuse.value.copy(f.color),p.opacity.value=f.opacity,p.size.value=f.size*x,p.scale.value=b*.5,f.map&&(p.map.value=f.map,n(f.map,p.uvTransform)),f.alphaMap&&(p.alphaMap.value=f.alphaMap,n(f.alphaMap,p.alphaMapTransform)),f.alphaTest>0&&(p.alphaTest.value=f.alphaTest)}function l(p,f){p.diffuse.value.copy(f.color),p.opacity.value=f.opacity,p.rotation.value=f.rotation,f.map&&(p.map.value=f.map,n(f.map,p.mapTransform)),f.alphaMap&&(p.alphaMap.value=f.alphaMap,n(f.alphaMap,p.alphaMapTransform)),f.alphaTest>0&&(p.alphaTest.value=f.alphaTest)}function u(p,f){p.specular.value.copy(f.specular),p.shininess.value=Math.max(f.shininess,1e-4)}function h(p,f){f.gradientMap&&(p.gradientMap.value=f.gradientMap)}function d(p,f){p.metalness.value=f.metalness,f.metalnessMap&&(p.metalnessMap.value=f.metalnessMap,n(f.metalnessMap,p.metalnessMapTransform)),p.roughness.value=f.roughness,f.roughnessMap&&(p.roughnessMap.value=f.roughnessMap,n(f.roughnessMap,p.roughnessMapTransform)),f.envMap&&(p.envMapIntensity.value=f.envMapIntensity)}function m(p,f,x){p.ior.value=f.ior,f.sheen>0&&(p.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),p.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(p.sheenColorMap.value=f.sheenColorMap,n(f.sheenColorMap,p.sheenColorMapTransform)),f.sheenRoughnessMap&&(p.sheenRoughnessMap.value=f.sheenRoughnessMap,n(f.sheenRoughnessMap,p.sheenRoughnessMapTransform))),f.clearcoat>0&&(p.clearcoat.value=f.clearcoat,p.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(p.clearcoatMap.value=f.clearcoatMap,n(f.clearcoatMap,p.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,n(f.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(p.clearcoatNormalMap.value=f.clearcoatNormalMap,n(f.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===1&&p.clearcoatNormalScale.value.negate())),f.dispersion>0&&(p.dispersion.value=f.dispersion),f.iridescence>0&&(p.iridescence.value=f.iridescence,p.iridescenceIOR.value=f.iridescenceIOR,p.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(p.iridescenceMap.value=f.iridescenceMap,n(f.iridescenceMap,p.iridescenceMapTransform)),f.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=f.iridescenceThicknessMap,n(f.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),f.transmission>0&&(p.transmission.value=f.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),f.transmissionMap&&(p.transmissionMap.value=f.transmissionMap,n(f.transmissionMap,p.transmissionMapTransform)),p.thickness.value=f.thickness,f.thicknessMap&&(p.thicknessMap.value=f.thicknessMap,n(f.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=f.attenuationDistance,p.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(p.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(p.anisotropyMap.value=f.anisotropyMap,n(f.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=f.specularIntensity,p.specularColor.value.copy(f.specularColor),f.specularColorMap&&(p.specularColorMap.value=f.specularColorMap,n(f.specularColorMap,p.specularColorMapTransform)),f.specularIntensityMap&&(p.specularIntensityMap.value=f.specularIntensityMap,n(f.specularIntensityMap,p.specularIntensityMapTransform))}function S(p,f){f.matcap&&(p.matcap.value=f.matcap)}function M(p,f){const x=t.get(f).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function kp(e,t,n,i){let r={},s={},a=[];const o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,b){const E=b.program;i.uniformBlockBinding(x,E)}function l(x,b){let E=r[x.id];E===void 0&&(S(x),E=u(x),r[x.id]=E,x.addEventListener("dispose",p));const C=b.program;i.updateUBOMapping(x,C);const R=t.render.frame;s[x.id]!==R&&(d(x),s[x.id]=R)}function u(x){const b=h();x.__bindingPointIndex=b;const E=e.createBuffer(),C=x.__size,R=x.usage;return e.bindBuffer(e.UNIFORM_BUFFER,E),e.bufferData(e.UNIFORM_BUFFER,C,R),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,b,E),E}function h(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return Ve("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const b=r[x.id],E=x.uniforms,C=x.__cache;e.bindBuffer(e.UNIFORM_BUFFER,b);for(let R=0,I=E.length;R<I;R++){const v=Array.isArray(E[R])?E[R]:[E[R]];for(let y=0,Y=v.length;y<Y;y++){const A=v[y];if(m(A,R,y,C)===!0){const H=A.__offset,j=Array.isArray(A.value)?A.value:[A.value];let F=0;for(let O=0;O<j.length;O++){const z=j[O],V=M(z);typeof z=="number"||typeof z=="boolean"?(A.__data[0]=z,e.bufferSubData(e.UNIFORM_BUFFER,H+F,A.__data)):z.isMatrix3?(A.__data[0]=z.elements[0],A.__data[1]=z.elements[1],A.__data[2]=z.elements[2],A.__data[3]=0,A.__data[4]=z.elements[3],A.__data[5]=z.elements[4],A.__data[6]=z.elements[5],A.__data[7]=0,A.__data[8]=z.elements[6],A.__data[9]=z.elements[7],A.__data[10]=z.elements[8],A.__data[11]=0):ArrayBuffer.isView(z)?A.__data.set(new z.constructor(z.buffer,z.byteOffset,A.__data.length)):(z.toArray(A.__data,F),F+=V.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,H,A.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function m(x,b,E,C){const R=x.value,I=b+"_"+E;if(C[I]===void 0)return typeof R=="number"||typeof R=="boolean"?C[I]=R:ArrayBuffer.isView(R)?C[I]=R.slice():C[I]=R.clone(),!0;{const v=C[I];if(typeof R=="number"||typeof R=="boolean"){if(v!==R)return C[I]=R,!0}else{if(ArrayBuffer.isView(R))return!0;if(v.equals(R)===!1)return v.copy(R),!0}}return!1}function S(x){const b=x.uniforms;let E=0;const C=16;for(let I=0,v=b.length;I<v;I++){const y=Array.isArray(b[I])?b[I]:[b[I]];for(let Y=0,A=y.length;Y<A;Y++){const H=y[Y],j=Array.isArray(H.value)?H.value:[H.value];for(let F=0,O=j.length;F<O;F++){const z=j[F],V=M(z),ee=E%C,q=ee%V.boundary,ne=ee+q;E+=q,ne!==0&&C-ne<V.storage&&(E+=C-ne),H.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=E,E+=V.storage}}}const R=E%C;return R>0&&(E+=C-R),x.__size=E,x.__cache={},this}function M(x){const b={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(b.boundary=4,b.storage=4):x.isVector2?(b.boundary=8,b.storage=8):x.isVector3||x.isColor?(b.boundary=16,b.storage=12):x.isVector4?(b.boundary=16,b.storage=16):x.isMatrix3?(b.boundary=48,b.storage=48):x.isMatrix4?(b.boundary=64,b.storage=64):x.isTexture?Ne("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(b.boundary=16,b.storage=x.byteLength):Ne("WebGLRenderer: Unsupported uniform value type.",x),b}function p(x){const b=x.target;b.removeEventListener("dispose",p);const E=a.indexOf(b.__bindingPointIndex);a.splice(E,1),e.deleteBuffer(r[b.id]),delete r[b.id],delete s[b.id]}function f(){for(const x in r)e.deleteBuffer(r[x]);a=[],r={},s={}}return{bind:c,update:l,dispose:f}}var Gp=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Mn=null;function Hp(){return Mn===null&&(Mn=new Kd(Gp,16,16,vs,hi),Mn.name="DFG_LUT",Mn.minFilter=jt,Mn.magFilter=jt,Mn.wrapS=Nn,Mn.wrapT=Nn,Mn.generateMipmaps=!1,Mn.needsUpdate=!0),Mn}var Wp=class{constructor(e={}){const{canvas:t=Ed(),context:n=null,depth:i=!0,stencil:r=!1,alpha:s=!1,antialias:a=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:c=!1,powerPreference:l="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:h=!1,outputBufferType:d=ui}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=s;const S=d,M=new Set([Vl,Bl,Ol]),p=new Set([ui,di,Dl,Ul,Ll,Nl]),f=new Uint32Array(4),x=new Int32Array(4),b=new W;let E=null,C=null;const R=[],I=[];let v=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const y=this;let Y=!1,A=null;this._outputColorSpace=dn;let H=0,j=0,F=null,O=-1,z=null;const V=new wt,ee=new wt;let q=null;const ne=new rt(0);let de=0,be=t.width,We=t.height,Pe=1,Z=null,se=null;const me=new wt(0,0,be,We),he=new wt(0,0,be,We);let ve=!1;const Me=new Ql;let ye=!1,Xe=!1;const Ie=new Ft,tt=new W,Ke=new wt,st={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let at=!1;function ot(){return F===null?Pe:1}let P=n;function Je(g,L){return t.getContext(g,L)}try{const g={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r184"),t.addEventListener("webglcontextlost",Re,!1),t.addEventListener("webglcontextrestored",re,!1),t.addEventListener("webglcontextcreationerror",we,!1),P===null){const L="webgl2";if(P=Je(L,g),P===null)throw Je(L)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(g){throw Ve("WebGLRenderer: "+g.message),g}let De,Ue,fe,nt,xe,T,_,U,Q,te,oe,ue,D,G,N,$,J,Te,Ae,Ce,ze,w,K;function ae(){De=new Gh(P),De.init(),ze=new Np(P,De),Ue=new Nh(P,De,e,ze),fe=new Dp(P,De),Ue.reversedDepthBuffer&&h&&fe.buffers.depth.setReversed(!0),nt=new Xh(P),xe=new gp,T=new Lp(P,De,fe,xe,Ue,ze,nt),_=new kh(y),U=new Ch(P),w=new Dh(P,U),Q=new Hh(P,U,nt,w),te=new Yh(P,Q,U,w,nt),Te=new qh(P,Ue,T),N=new Uh(xe),oe=new vp(y,_,De,Ue,w,N),ue=new zp(y,xe),D=new Mp,G=new Ap(De),J=new Ih(y,_,fe,te,m,o),$=new Ip(y,te,Ue),K=new kp(P,nt,Ue,fe),Ae=new Lh(P,De,nt),Ce=new Wh(P,De,nt),nt.programs=oe.programs,y.capabilities=Ue,y.extensions=De,y.properties=xe,y.renderLists=D,y.shadowMap=$,y.state=fe,y.info=nt}ae(),S!==1009&&(v=new Zh(S,t.width,t.height,i,r));const ce=new Bp(y,P);this.xr=ce,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const g=De.get("WEBGL_lose_context");g&&g.loseContext()},this.forceContextRestore=function(){const g=De.get("WEBGL_lose_context");g&&g.restoreContext()},this.getPixelRatio=function(){return Pe},this.setPixelRatio=function(g){g!==void 0&&(Pe=g,this.setSize(be,We,!1))},this.getSize=function(g){return g.set(be,We)},this.setSize=function(g,L,X=!0){if(ce.isPresenting){Ne("WebGLRenderer: Can't change size while VR device is presenting.");return}be=g,We=L,t.width=Math.floor(g*Pe),t.height=Math.floor(L*Pe),X===!0&&(t.style.width=g+"px",t.style.height=L+"px"),v!==null&&v.setSize(t.width,t.height),this.setViewport(0,0,g,L)},this.getDrawingBufferSize=function(g){return g.set(be*Pe,We*Pe).floor()},this.setDrawingBufferSize=function(g,L,X){be=g,We=L,Pe=X,t.width=Math.floor(g*X),t.height=Math.floor(L*X),this.setViewport(0,0,g,L)},this.setEffects=function(g){if(S===1009){Ve("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(g){for(let L=0;L<g.length;L++)if(g[L].isOutputPass===!0){Ne("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}v.setEffects(g||[])},this.getCurrentViewport=function(g){return g.copy(V)},this.getViewport=function(g){return g.copy(me)},this.setViewport=function(g,L,X,k){g.isVector4?me.set(g.x,g.y,g.z,g.w):me.set(g,L,X,k),fe.viewport(V.copy(me).multiplyScalar(Pe).round())},this.getScissor=function(g){return g.copy(he)},this.setScissor=function(g,L,X,k){g.isVector4?he.set(g.x,g.y,g.z,g.w):he.set(g,L,X,k),fe.scissor(ee.copy(he).multiplyScalar(Pe).round())},this.getScissorTest=function(){return ve},this.setScissorTest=function(g){fe.setScissorTest(ve=g)},this.setOpaqueSort=function(g){Z=g},this.setTransparentSort=function(g){se=g},this.getClearColor=function(g){return g.copy(J.getClearColor())},this.setClearColor=function(){J.setClearColor(...arguments)},this.getClearAlpha=function(){return J.getClearAlpha()},this.setClearAlpha=function(){J.setClearAlpha(...arguments)},this.clear=function(g=!0,L=!0,X=!0){let k=0;if(g){let B=!1;if(F!==null){const le=F.texture.format;B=M.has(le)}if(B){const le=F.texture.type,_e=p.has(le),ge=J.getClearColor(),Se=J.getClearAlpha(),Oe=ge.r,qe=ge.g,Ye=ge.b;_e?(f[0]=Oe,f[1]=qe,f[2]=Ye,f[3]=Se,P.clearBufferuiv(P.COLOR,0,f)):(x[0]=Oe,x[1]=qe,x[2]=Ye,x[3]=Se,P.clearBufferiv(P.COLOR,0,x))}else k|=P.COLOR_BUFFER_BIT}L&&(k|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(k|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&P.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(g){g.setRenderer(this),A=g},this.dispose=function(){t.removeEventListener("webglcontextlost",Re,!1),t.removeEventListener("webglcontextrestored",re,!1),t.removeEventListener("webglcontextcreationerror",we,!1),J.dispose(),D.dispose(),G.dispose(),xe.dispose(),_.dispose(),te.dispose(),w.dispose(),K.dispose(),oe.dispose(),ce.dispose(),ce.removeEventListener("sessionstart",za),ce.removeEventListener("sessionend",ka),jn.stop()};function Re(g){g.preventDefault(),So("WebGLRenderer: Context Lost."),Y=!0}function re(){So("WebGLRenderer: Context Restored."),Y=!1;const g=nt.autoReset,L=$.enabled,X=$.autoUpdate,k=$.needsUpdate,B=$.type;ae(),nt.autoReset=g,$.enabled=L,$.autoUpdate=X,$.needsUpdate=k,$.type=B}function we(g){Ve("WebGLRenderer: A WebGL context could not be created. Reason: ",g.statusMessage)}function Fe(g){const L=g.target;L.removeEventListener("dispose",Fe),Xt(L)}function Xt(g){_t(g),xe.remove(g)}function _t(g){const L=xe.get(g).programs;L!==void 0&&(L.forEach(function(X){oe.releaseProgram(X)}),g.isShaderMaterial&&oe.releaseShaderCache(g))}this.renderBufferDirect=function(g,L,X,k,B,le){L===null&&(L=st);const _e=B.isMesh&&B.matrixWorld.determinant()<0,ge=gc(g,L,X,k,B);fe.setMaterial(k,_e);let Se=X.index,Oe=1;if(k.wireframe===!0){if(Se=Q.getWireframeAttribute(X),Se===void 0)return;Oe=2}const qe=X.drawRange,Ye=X.attributes.position;let Le=qe.start*Oe,mt=(qe.start+qe.count)*Oe;le!==null&&(Le=Math.max(Le,le.start*Oe),mt=Math.min(mt,(le.start+le.count)*Oe)),Se!==null?(Le=Math.max(Le,0),mt=Math.min(mt,Se.count)):Ye!=null&&(Le=Math.max(Le,0),mt=Math.min(mt,Ye.count));const Mt=mt-Le;if(Mt<0||Mt===1/0)return;w.setup(B,k,ge,X,Se);let xt,Qe=Ae;if(Se!==null&&(xt=U.get(Se),Qe=Ce,Qe.setIndex(xt)),B.isMesh)k.wireframe===!0?(fe.setLineWidth(k.wireframeLinewidth*ot()),Qe.setMode(P.LINES)):Qe.setMode(P.TRIANGLES);else if(B.isLine){let Ot=k.linewidth;Ot===void 0&&(Ot=1),fe.setLineWidth(Ot*ot()),B.isLineSegments?Qe.setMode(P.LINES):B.isLineLoop?Qe.setMode(P.LINE_LOOP):Qe.setMode(P.LINE_STRIP)}else B.isPoints?Qe.setMode(P.POINTS):B.isSprite&&Qe.setMode(P.TRIANGLES);if(B.isBatchedMesh)if(De.get("WEBGL_multi_draw"))Qe.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{const Ot=B._multiDrawStarts,Ee=B._multiDrawCounts,sn=B._multiDrawCount,it=Se?U.get(Se).bytesPerElement:1,Jt=xe.get(k).currentProgram.getUniforms();for(let _n=0;_n<sn;_n++)Jt.setValue(P,"_gl_DrawID",_n),Qe.render(Ot[_n]/it,Ee[_n])}else if(B.isInstancedMesh)Qe.renderInstances(Le,Mt,B.count);else if(X.isInstancedBufferGeometry){const Ot=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Ee=Math.min(X.instanceCount,Ot);Qe.renderInstances(Le,Mt,Ee)}else Qe.render(Le,Mt)};function mn(g,L,X){g.transparent===!0&&g.side===2&&g.forceSinglePass===!1?(g.side=1,g.needsUpdate=!0,Rr(g,L,X),g.side=0,g.needsUpdate=!0,Rr(g,L,X),g.side=2):Rr(g,L,X)}this.compile=function(g,L,X=null){X===null&&(X=g),C=G.get(X),C.init(L),I.push(C),X.traverseVisible(function(B){B.isLight&&B.layers.test(L.layers)&&(C.pushLight(B),B.castShadow&&C.pushShadow(B))}),g!==X&&g.traverseVisible(function(B){B.isLight&&B.layers.test(L.layers)&&(C.pushLight(B),B.castShadow&&C.pushShadow(B))}),C.setupLights();const k=new Set;return g.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;const le=B.material;if(le)if(Array.isArray(le))for(let _e=0;_e<le.length;_e++){const ge=le[_e];mn(ge,X,B),k.add(ge)}else mn(le,X,B),k.add(le)}),C=I.pop(),k},this.compileAsync=function(g,L,X=null){const k=this.compile(g,L,X);return new Promise(B=>{function le(){if(k.forEach(function(_e){xe.get(_e).currentProgram.isReady()&&k.delete(_e)}),k.size===0){B(g);return}setTimeout(le,10)}De.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let rn=null;function _c(g){rn&&rn(g)}function za(){jn.stop()}function ka(){jn.start()}const jn=new lc;jn.setAnimationLoop(_c),typeof self<"u"&&jn.setContext(self),this.setAnimationLoop=function(g){rn=g,ce.setAnimationLoop(g),g===null?jn.stop():jn.start()},ce.addEventListener("sessionstart",za),ce.addEventListener("sessionend",ka),this.render=function(g,L){if(L!==void 0&&L.isCamera!==!0){Ve("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(Y===!0)return;A!==null&&A.renderStart(g,L);const X=ce.enabled===!0&&ce.isPresenting===!0,k=v!==null&&(F===null||X)&&v.begin(y,F);if(g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),ce.enabled===!0&&ce.isPresenting===!0&&(v===null||v.isCompositing()===!1)&&(ce.cameraAutoUpdate===!0&&ce.updateCamera(L),L=ce.getCamera()),g.isScene===!0&&g.onBeforeRender(y,g,L,F),C=G.get(g,I.length),C.init(L),C.state.textureUnits=T.getTextureUnits(),I.push(C),Ie.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Me.setFromProjectionMatrix(Ie,Xi,L.reversedDepth),Xe=this.localClippingEnabled,ye=N.init(this.clippingPlanes,Xe),E=D.get(g,R.length),E.init(),R.push(E),ce.enabled===!0&&ce.isPresenting===!0){const le=y.xr.getDepthSensingMesh();le!==null&&ws(le,L,-1/0,y.sortObjects)}ws(g,L,0,y.sortObjects),E.finish(),y.sortObjects===!0&&E.sort(Z,se),at=ce.enabled===!1||ce.isPresenting===!1||ce.hasDepthSensing()===!1,at&&J.addToRenderList(E,g),this.info.render.frame++,ye===!0&&N.beginShadows();const B=C.state.shadowsArray;if($.render(B,g,L),ye===!0&&N.endShadows(),this.info.autoReset===!0&&this.info.reset(),(k&&v.hasRenderPass())===!1){const le=E.opaque,_e=E.transmissive;if(C.setupLights(),L.isArrayCamera){const ge=L.cameras;if(_e.length>0)for(let Se=0,Oe=ge.length;Se<Oe;Se++){const qe=ge[Se];Ha(le,_e,g,qe)}at&&J.render(g);for(let Se=0,Oe=ge.length;Se<Oe;Se++){const qe=ge[Se];Ga(E,g,qe,qe.viewport)}}else _e.length>0&&Ha(le,_e,g,L),at&&J.render(g),Ga(E,g,L)}F!==null&&j===0&&(T.updateMultisampleRenderTarget(F),T.updateRenderTargetMipmap(F)),k&&v.end(y),g.isScene===!0&&g.onAfterRender(y,g,L),w.resetDefaultState(),O=-1,z=null,I.pop(),I.length>0?(C=I[I.length-1],T.setTextureUnits(C.state.textureUnits),ye===!0&&N.setGlobalState(y.clippingPlanes,C.state.camera)):C=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,A!==null&&A.renderEnd()};function ws(g,L,X,k){if(g.visible===!1)return;if(g.layers.test(L.layers)){if(g.isGroup)X=g.renderOrder;else if(g.isLOD)g.autoUpdate===!0&&g.update(L);else if(g.isLightProbeGrid)C.pushLightProbeGrid(g);else if(g.isLight)C.pushLight(g),g.castShadow&&C.pushShadow(g);else if(g.isSprite){if(!g.frustumCulled||Me.intersectsSprite(g)){k&&Ke.setFromMatrixPosition(g.matrixWorld).applyMatrix4(Ie);const le=te.update(g),_e=g.material;_e.visible&&E.push(g,le,_e,X,Ke.z,null)}}else if((g.isMesh||g.isLine||g.isPoints)&&(!g.frustumCulled||Me.intersectsObject(g))){const le=te.update(g),_e=g.material;if(k&&(g.boundingSphere!==void 0?(g.boundingSphere===null&&g.computeBoundingSphere(),Ke.copy(g.boundingSphere.center)):(le.boundingSphere===null&&le.computeBoundingSphere(),Ke.copy(le.boundingSphere.center)),Ke.applyMatrix4(g.matrixWorld).applyMatrix4(Ie)),Array.isArray(_e)){const ge=le.groups;for(let Se=0,Oe=ge.length;Se<Oe;Se++){const qe=ge[Se],Ye=_e[qe.materialIndex];Ye&&Ye.visible&&E.push(g,le,Ye,X,Ke.z,qe)}}else _e.visible&&E.push(g,le,_e,X,Ke.z,null)}}const B=g.children;for(let le=0,_e=B.length;le<_e;le++)ws(B[le],L,X,k)}function Ga(g,L,X,k){const{opaque:B,transmissive:le,transparent:_e}=g;C.setupLightsView(X),ye===!0&&N.setGlobalState(y.clippingPlanes,X),k&&fe.viewport(V.copy(k)),B.length>0&&Ar(B,L,X),le.length>0&&Ar(le,L,X),_e.length>0&&Ar(_e,L,X),fe.buffers.depth.setTest(!0),fe.buffers.depth.setMask(!0),fe.buffers.color.setMask(!0),fe.setPolygonOffset(!1)}function Ha(g,L,X,k){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(C.state.transmissionRenderTarget[k.id]===void 0){const Ye=De.has("EXT_color_buffer_half_float")||De.has("EXT_color_buffer_float");C.state.transmissionRenderTarget[k.id]=new Tn(1,1,{generateMipmaps:!0,type:Ye?hi:ui,minFilter:Da,samples:Math.max(4,Ue.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace})}const B=C.state.transmissionRenderTarget[k.id],le=k.viewport||V;B.setSize(le.z*y.transmissionResolutionScale,le.w*y.transmissionResolutionScale);const _e=y.getRenderTarget(),ge=y.getActiveCubeFace(),Se=y.getActiveMipmapLevel();y.setRenderTarget(B),y.getClearColor(ne),de=y.getClearAlpha(),de<1&&y.setClearColor(16777215,.5),y.clear(),at&&J.render(X);const Oe=y.toneMapping;y.toneMapping=0;const qe=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),C.setupLightsView(k),ye===!0&&N.setGlobalState(y.clippingPlanes,k),Ar(g,X,k),T.updateMultisampleRenderTarget(B),T.updateRenderTargetMipmap(B),De.has("WEBGL_multisampled_render_to_texture")===!1){let Ye=!1;for(let Le=0,mt=L.length;Le<mt;Le++){const{object:Mt,geometry:xt,material:Qe,group:Ot}=L[Le];if(Qe.side===2&&Mt.layers.test(k.layers)){const Ee=Qe.side;Qe.side=1,Qe.needsUpdate=!0,Wa(Mt,X,k,xt,Qe,Ot),Qe.side=Ee,Qe.needsUpdate=!0,Ye=!0}}Ye===!0&&(T.updateMultisampleRenderTarget(B),T.updateRenderTargetMipmap(B))}y.setRenderTarget(_e,ge,Se),y.setClearColor(ne,de),qe!==void 0&&(k.viewport=qe),y.toneMapping=Oe}function Ar(g,L,X){const k=L.isScene===!0?L.overrideMaterial:null;for(let B=0,le=g.length;B<le;B++){const _e=g[B],{object:ge,geometry:Se,group:Oe}=_e;let qe=_e.material;qe.allowOverride===!0&&k!==null&&(qe=k),ge.layers.test(X.layers)&&Wa(ge,L,X,Se,qe,Oe)}}function Wa(g,L,X,k,B,le){g.onBeforeRender(y,L,X,k,B,le),g.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,g.matrixWorld),g.normalMatrix.getNormalMatrix(g.modelViewMatrix),B.onBeforeRender(y,L,X,k,g,le),B.transparent===!0&&B.side===2&&B.forceSinglePass===!1?(B.side=1,B.needsUpdate=!0,y.renderBufferDirect(X,L,k,B,g,le),B.side=0,B.needsUpdate=!0,y.renderBufferDirect(X,L,k,B,g,le),B.side=2):y.renderBufferDirect(X,L,k,B,g,le),g.onAfterRender(y,L,X,k,B,le)}function Rr(g,L,X){L.isScene!==!0&&(L=st);const k=xe.get(g),B=C.state.lights,le=C.state.shadowsArray,_e=B.state.version,ge=oe.getParameters(g,B.state,le,L,X,C.state.lightProbeGridArray),Se=oe.getProgramCacheKey(ge);let Oe=k.programs;k.environment=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?L.environment:null,k.fog=L.fog;const qe=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap;k.envMap=_.get(g.envMap||k.environment,qe),k.envMapRotation=k.environment!==null&&g.envMap===null?L.environmentRotation:g.envMapRotation,Oe===void 0&&(g.addEventListener("dispose",Fe),Oe=new Map,k.programs=Oe);let Ye=Oe.get(Se);if(Ye!==void 0){if(k.currentProgram===Ye&&k.lightsStateVersion===_e)return qa(g,ge),Ye}else ge.uniforms=oe.getUniforms(g),A!==null&&g.isNodeMaterial&&A.build(g,X,ge),g.onBeforeCompile(ge,y),Ye=oe.acquireProgram(ge,Se),Oe.set(Se,Ye),k.uniforms=ge.uniforms;const Le=k.uniforms;return(!g.isShaderMaterial&&!g.isRawShaderMaterial||g.clipping===!0)&&(Le.clippingPlanes=N.uniform),qa(g,ge),k.needsLights=Mc(g),k.lightsStateVersion=_e,k.needsLights&&(Le.ambientLightColor.value=B.state.ambient,Le.lightProbe.value=B.state.probe,Le.directionalLights.value=B.state.directional,Le.directionalLightShadows.value=B.state.directionalShadow,Le.spotLights.value=B.state.spot,Le.spotLightShadows.value=B.state.spotShadow,Le.rectAreaLights.value=B.state.rectArea,Le.ltc_1.value=B.state.rectAreaLTC1,Le.ltc_2.value=B.state.rectAreaLTC2,Le.pointLights.value=B.state.point,Le.pointLightShadows.value=B.state.pointShadow,Le.hemisphereLights.value=B.state.hemi,Le.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Le.spotLightMatrix.value=B.state.spotLightMatrix,Le.spotLightMap.value=B.state.spotLightMap,Le.pointShadowMatrix.value=B.state.pointShadowMatrix),k.lightProbeGrid=C.state.lightProbeGridArray.length>0,k.currentProgram=Ye,k.uniformsList=null,Ye}function Xa(g){if(g.uniformsList===null){const L=g.currentProgram.getUniforms();g.uniformsList=fs.seqWithValue(L.seq,g.uniforms)}return g.uniformsList}function qa(g,L){const X=xe.get(g);X.outputColorSpace=L.outputColorSpace,X.batching=L.batching,X.batchingColor=L.batchingColor,X.instancing=L.instancing,X.instancingColor=L.instancingColor,X.instancingMorph=L.instancingMorph,X.skinning=L.skinning,X.morphTargets=L.morphTargets,X.morphNormals=L.morphNormals,X.morphColors=L.morphColors,X.morphTargetsCount=L.morphTargetsCount,X.numClippingPlanes=L.numClippingPlanes,X.numIntersection=L.numClipIntersection,X.vertexAlphas=L.vertexAlphas,X.vertexTangents=L.vertexTangents,X.toneMapping=L.toneMapping}function vc(g,L){if(g.length===0)return null;if(g.length===1)return g[0].texture!==null?g[0]:null;b.setFromMatrixPosition(L.matrixWorld);for(let X=0,k=g.length;X<k;X++){const B=g[X];if(B.texture!==null&&B.boundingBox.containsPoint(b))return B}return null}function gc(g,L,X,k,B){L.isScene!==!0&&(L=st),T.resetTextureUnits();const le=L.fog,_e=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?L.environment:null,ge=F===null?y.outputColorSpace:F.isXRRenderTarget===!0?F.texture.colorSpace:$e.workingColorSpace,Se=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Oe=_.get(k.envMap||_e,Se),qe=k.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Ye=!!X.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Le=!!X.morphAttributes.position,mt=!!X.morphAttributes.normal,Mt=!!X.morphAttributes.color;let xt=0;k.toneMapped&&(F===null||F.isXRRenderTarget===!0)&&(xt=y.toneMapping);const Qe=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Ot=Qe!==void 0?Qe.length:0,Ee=xe.get(k),sn=C.state.lights;if(ye===!0&&(Xe===!0||g!==z)){const dt=g===z&&k.id===O;N.setState(k,g,dt)}let it=!1;k.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==sn.state.version||Ee.outputColorSpace!==ge||B.isBatchedMesh&&Ee.batching===!1||!B.isBatchedMesh&&Ee.batching===!0||B.isBatchedMesh&&Ee.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&Ee.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&Ee.instancing===!1||!B.isInstancedMesh&&Ee.instancing===!0||B.isSkinnedMesh&&Ee.skinning===!1||!B.isSkinnedMesh&&Ee.skinning===!0||B.isInstancedMesh&&Ee.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Ee.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&Ee.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&Ee.instancingMorph===!1&&B.morphTexture!==null||Ee.envMap!==Oe||k.fog===!0&&Ee.fog!==le||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==N.numPlanes||Ee.numIntersection!==N.numIntersection)||Ee.vertexAlphas!==qe||Ee.vertexTangents!==Ye||Ee.morphTargets!==Le||Ee.morphNormals!==mt||Ee.morphColors!==Mt||Ee.toneMapping!==xt||Ee.morphTargetsCount!==Ot||!!Ee.lightProbeGrid!=C.state.lightProbeGridArray.length>0)&&(it=!0):(it=!0,Ee.__version=k.version);let Jt=Ee.currentProgram;it===!0&&(Jt=Rr(k,L,B),A&&k.isNodeMaterial&&A.onUpdateProgram(k,Jt,Ee));let _n=!1,Bn=!1,_i=!1;const pt=Jt.getUniforms(),bt=Ee.uniforms;if(fe.useProgram(Jt.program)&&(_n=!0,Bn=!0,_i=!0),k.id!==O&&(O=k.id,Bn=!0),Ee.needsLights){const dt=vc(C.state.lightProbeGridArray,B);Ee.lightProbeGrid!==dt&&(Ee.lightProbeGrid=dt,Bn=!0)}if(_n||z!==g){fe.buffers.depth.getReversed()&&g.reversedDepth!==!0&&(g._reversedDepth=!0,g.updateProjectionMatrix()),pt.setValue(P,"projectionMatrix",g.projectionMatrix),pt.setValue(P,"viewMatrix",g.matrixWorldInverse);const dt=pt.map.cameraPosition;dt!==void 0&&dt.setValue(P,tt.setFromMatrixPosition(g.matrixWorld)),Ue.logarithmicDepthBuffer&&pt.setValue(P,"logDepthBufFC",2/(Math.log(g.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&pt.setValue(P,"isOrthographic",g.isOrthographicCamera===!0),z!==g&&(z=g,Bn=!0,_i=!0)}if(Ee.needsLights&&(sn.state.directionalShadowMap.length>0&&pt.setValue(P,"directionalShadowMap",sn.state.directionalShadowMap,T),sn.state.spotShadowMap.length>0&&pt.setValue(P,"spotShadowMap",sn.state.spotShadowMap,T),sn.state.pointShadowMap.length>0&&pt.setValue(P,"pointShadowMap",sn.state.pointShadowMap,T)),B.isSkinnedMesh){pt.setOptional(P,B,"bindMatrix"),pt.setOptional(P,B,"bindMatrixInverse");const dt=B.skeleton;dt&&(dt.boneTexture===null&&dt.computeBoneTexture(),pt.setValue(P,"boneTexture",dt.boneTexture,T))}B.isBatchedMesh&&(pt.setOptional(P,B,"batchingTexture"),pt.setValue(P,"batchingTexture",B._matricesTexture,T),pt.setOptional(P,B,"batchingIdTexture"),pt.setValue(P,"batchingIdTexture",B._indirectTexture,T),pt.setOptional(P,B,"batchingColorTexture"),B._colorsTexture!==null&&pt.setValue(P,"batchingColorTexture",B._colorsTexture,T));const Vn=X.morphAttributes;if((Vn.position!==void 0||Vn.normal!==void 0||Vn.color!==void 0)&&Te.update(B,X,Jt),(Bn||Ee.receiveShadow!==B.receiveShadow)&&(Ee.receiveShadow=B.receiveShadow,pt.setValue(P,"receiveShadow",B.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&L.environment!==null&&(bt.envMapIntensity.value=L.environmentIntensity),bt.dfgLUT!==void 0&&(bt.dfgLUT.value=Hp()),Bn){if(pt.setValue(P,"toneMappingExposure",y.toneMappingExposure),Ee.needsLights&&Sc(bt,_i),le&&k.fog===!0&&ue.refreshFogUniforms(bt,le),ue.refreshMaterialUniforms(bt,k,Pe,We,C.state.transmissionRenderTarget[g.id]),Ee.needsLights&&Ee.lightProbeGrid){const dt=Ee.lightProbeGrid;bt.probesSH.value=dt.texture,bt.probesMin.value.copy(dt.boundingBox.min),bt.probesMax.value.copy(dt.boundingBox.max),bt.probesResolution.value.copy(dt.resolution)}fs.upload(P,Xa(Ee),bt,T)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(fs.upload(P,Xa(Ee),bt,T),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&pt.setValue(P,"center",B.center),pt.setValue(P,"modelViewMatrix",B.modelViewMatrix),pt.setValue(P,"normalMatrix",B.normalMatrix),pt.setValue(P,"modelMatrix",B.matrixWorld),k.uniformsGroups!==void 0){const dt=k.uniformsGroups;for(let $i=0,vi=dt.length;$i<vi;$i++){const Ya=dt[$i];K.update(Ya,Jt),K.bind(Ya,Jt)}}return Jt}function Sc(g,L){g.ambientLightColor.needsUpdate=L,g.lightProbe.needsUpdate=L,g.directionalLights.needsUpdate=L,g.directionalLightShadows.needsUpdate=L,g.pointLights.needsUpdate=L,g.pointLightShadows.needsUpdate=L,g.spotLights.needsUpdate=L,g.spotLightShadows.needsUpdate=L,g.rectAreaLights.needsUpdate=L,g.hemisphereLights.needsUpdate=L}function Mc(g){return g.isMeshLambertMaterial||g.isMeshToonMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isShadowMaterial||g.isShaderMaterial&&g.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return j},this.getRenderTarget=function(){return F},this.setRenderTargetTextures=function(g,L,X){const k=xe.get(g);k.__autoAllocateDepthBuffer=g.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),xe.get(g.texture).__webglTexture=L,xe.get(g.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:X,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(g,L){const X=xe.get(g);X.__webglFramebuffer=L,X.__useDefaultFramebuffer=L===void 0};const xc=P.createFramebuffer();this.setRenderTarget=function(g,L=0,X=0){F=g,H=L,j=X;let k=null,B=!1,le=!1;if(g){const _e=xe.get(g);if(_e.__useDefaultFramebuffer!==void 0){fe.bindFramebuffer(P.FRAMEBUFFER,_e.__webglFramebuffer),V.copy(g.viewport),ee.copy(g.scissor),q=g.scissorTest,fe.viewport(V),fe.scissor(ee),fe.setScissorTest(q),O=-1;return}else if(_e.__webglFramebuffer===void 0)T.setupRenderTarget(g);else if(_e.__hasExternalTextures)T.rebindTextures(g,xe.get(g.texture).__webglTexture,xe.get(g.depthTexture).__webglTexture);else if(g.depthBuffer){const Oe=g.depthTexture;if(_e.__boundDepthTexture!==Oe){if(Oe!==null&&xe.has(Oe)&&(g.width!==Oe.image.width||g.height!==Oe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(g)}}const ge=g.texture;(ge.isData3DTexture||ge.isDataArrayTexture||ge.isCompressedArrayTexture)&&(le=!0);const Se=xe.get(g).__webglFramebuffer;g.isWebGLCubeRenderTarget?(Array.isArray(Se[L])?k=Se[L][X]:k=Se[L],B=!0):g.samples>0&&T.useMultisampledRTT(g)===!1?k=xe.get(g).__webglMultisampledFramebuffer:Array.isArray(Se)?k=Se[X]:k=Se,V.copy(g.viewport),ee.copy(g.scissor),q=g.scissorTest}else V.copy(me).multiplyScalar(Pe).floor(),ee.copy(he).multiplyScalar(Pe).floor(),q=ve;if(X!==0&&(k=xc),fe.bindFramebuffer(P.FRAMEBUFFER,k)&&fe.drawBuffers(g,k),fe.viewport(V),fe.scissor(ee),fe.setScissorTest(q),B){const _e=xe.get(g.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+L,_e.__webglTexture,X)}else if(le){const _e=L;for(let ge=0;ge<g.textures.length;ge++){const Se=xe.get(g.textures[ge]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+ge,Se.__webglTexture,X,_e)}}else if(g!==null&&X!==0){const _e=xe.get(g.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,_e.__webglTexture,X)}O=-1},this.readRenderTargetPixels=function(g,L,X,k,B,le,_e,ge=0){if(!(g&&g.isWebGLRenderTarget)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=xe.get(g).__webglFramebuffer;if(g.isWebGLCubeRenderTarget&&_e!==void 0&&(Se=Se[_e]),Se){fe.bindFramebuffer(P.FRAMEBUFFER,Se);try{const Oe=g.textures[ge],qe=Oe.format,Ye=Oe.type;if(g.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+ge),!Ue.textureFormatReadable(qe)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ue.textureTypeReadable(Ye)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=g.width-k&&X>=0&&X<=g.height-B&&P.readPixels(L,X,k,B,ze.convert(qe),ze.convert(Ye),le)}finally{const Oe=F!==null?xe.get(F).__webglFramebuffer:null;fe.bindFramebuffer(P.FRAMEBUFFER,Oe)}}},this.readRenderTargetPixelsAsync=async function(g,L,X,k,B,le,_e,ge=0){if(!(g&&g.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=xe.get(g).__webglFramebuffer;if(g.isWebGLCubeRenderTarget&&_e!==void 0&&(Se=Se[_e]),Se)if(L>=0&&L<=g.width-k&&X>=0&&X<=g.height-B){fe.bindFramebuffer(P.FRAMEBUFFER,Se);const Oe=g.textures[ge],qe=Oe.format,Ye=Oe.type;if(g.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+ge),!Ue.textureFormatReadable(qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ue.textureTypeReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Le=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Le),P.bufferData(P.PIXEL_PACK_BUFFER,le.byteLength,P.STREAM_READ),P.readPixels(L,X,k,B,ze.convert(qe),ze.convert(Ye),0);const mt=F!==null?xe.get(F).__webglFramebuffer:null;fe.bindFramebuffer(P.FRAMEBUFFER,mt);const Mt=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await bd(P,Mt,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Le),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,le),P.deleteBuffer(Le),P.deleteSync(Mt),le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(g,L=null,X=0){const k=Math.pow(2,-X),B=Math.floor(g.image.width*k),le=Math.floor(g.image.height*k),_e=L!==null?L.x:0,ge=L!==null?L.y:0;T.setTexture2D(g,0),P.copyTexSubImage2D(P.TEXTURE_2D,X,0,0,_e,ge,B,le),fe.unbindTexture()};const Tc=P.createFramebuffer(),yc=P.createFramebuffer();this.copyTextureToTexture=function(g,L,X=null,k=null,B=0,le=0){let _e,ge,Se,Oe,qe,Ye,Le,mt,Mt;const xt=g.isCompressedTexture?g.mipmaps[le]:g.image;if(X!==null)_e=X.max.x-X.min.x,ge=X.max.y-X.min.y,Se=X.isBox3?X.max.z-X.min.z:1,Oe=X.min.x,qe=X.min.y,Ye=X.isBox3?X.min.z:0;else{const bt=Math.pow(2,-B);_e=Math.floor(xt.width*bt),ge=Math.floor(xt.height*bt),g.isDataArrayTexture?Se=xt.depth:g.isData3DTexture?Se=Math.floor(xt.depth*bt):Se=1,Oe=0,qe=0,Ye=0}k!==null?(Le=k.x,mt=k.y,Mt=k.z):(Le=0,mt=0,Mt=0);const Qe=ze.convert(L.format),Ot=ze.convert(L.type);let Ee;L.isData3DTexture?(T.setTexture3D(L,0),Ee=P.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(T.setTexture2DArray(L,0),Ee=P.TEXTURE_2D_ARRAY):(T.setTexture2D(L,0),Ee=P.TEXTURE_2D),fe.activeTexture(P.TEXTURE0),fe.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,L.flipY),fe.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),fe.pixelStorei(P.UNPACK_ALIGNMENT,L.unpackAlignment);const sn=fe.getParameter(P.UNPACK_ROW_LENGTH),it=fe.getParameter(P.UNPACK_IMAGE_HEIGHT),Jt=fe.getParameter(P.UNPACK_SKIP_PIXELS),_n=fe.getParameter(P.UNPACK_SKIP_ROWS),Bn=fe.getParameter(P.UNPACK_SKIP_IMAGES);fe.pixelStorei(P.UNPACK_ROW_LENGTH,xt.width),fe.pixelStorei(P.UNPACK_IMAGE_HEIGHT,xt.height),fe.pixelStorei(P.UNPACK_SKIP_PIXELS,Oe),fe.pixelStorei(P.UNPACK_SKIP_ROWS,qe),fe.pixelStorei(P.UNPACK_SKIP_IMAGES,Ye);const _i=g.isDataArrayTexture||g.isData3DTexture,pt=L.isDataArrayTexture||L.isData3DTexture;if(g.isDepthTexture){const bt=xe.get(g),Vn=xe.get(L),dt=xe.get(bt.__renderTarget),$i=xe.get(Vn.__renderTarget);fe.bindFramebuffer(P.READ_FRAMEBUFFER,dt.__webglFramebuffer),fe.bindFramebuffer(P.DRAW_FRAMEBUFFER,$i.__webglFramebuffer);for(let vi=0;vi<Se;vi++)_i&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,xe.get(g).__webglTexture,B,Ye+vi),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,xe.get(L).__webglTexture,le,Mt+vi)),P.blitFramebuffer(Oe,qe,_e,ge,Le,mt,_e,ge,P.DEPTH_BUFFER_BIT,P.NEAREST);fe.bindFramebuffer(P.READ_FRAMEBUFFER,null),fe.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(B!==0||g.isRenderTargetTexture||xe.has(g)){const bt=xe.get(g),Vn=xe.get(L);fe.bindFramebuffer(P.READ_FRAMEBUFFER,Tc),fe.bindFramebuffer(P.DRAW_FRAMEBUFFER,yc);for(let dt=0;dt<Se;dt++)_i?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,bt.__webglTexture,B,Ye+dt):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,bt.__webglTexture,B),pt?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Vn.__webglTexture,le,Mt+dt):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Vn.__webglTexture,le),B!==0?P.blitFramebuffer(Oe,qe,_e,ge,Le,mt,_e,ge,P.COLOR_BUFFER_BIT,P.NEAREST):pt?P.copyTexSubImage3D(Ee,le,Le,mt,Mt+dt,Oe,qe,_e,ge):P.copyTexSubImage2D(Ee,le,Le,mt,Oe,qe,_e,ge);fe.bindFramebuffer(P.READ_FRAMEBUFFER,null),fe.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else pt?g.isDataTexture||g.isData3DTexture?P.texSubImage3D(Ee,le,Le,mt,Mt,_e,ge,Se,Qe,Ot,xt.data):L.isCompressedArrayTexture?P.compressedTexSubImage3D(Ee,le,Le,mt,Mt,_e,ge,Se,Qe,xt.data):P.texSubImage3D(Ee,le,Le,mt,Mt,_e,ge,Se,Qe,Ot,xt):g.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,le,Le,mt,_e,ge,Qe,Ot,xt.data):g.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,le,Le,mt,xt.width,xt.height,Qe,xt.data):P.texSubImage2D(P.TEXTURE_2D,le,Le,mt,_e,ge,Qe,Ot,xt);fe.pixelStorei(P.UNPACK_ROW_LENGTH,sn),fe.pixelStorei(P.UNPACK_IMAGE_HEIGHT,it),fe.pixelStorei(P.UNPACK_SKIP_PIXELS,Jt),fe.pixelStorei(P.UNPACK_SKIP_ROWS,_n),fe.pixelStorei(P.UNPACK_SKIP_IMAGES,Bn),le===0&&L.generateMipmaps&&P.generateMipmap(Ee),fe.unbindTexture()},this.initRenderTarget=function(g){xe.get(g).__webglFramebuffer===void 0&&T.setupRenderTarget(g)},this.initTexture=function(g){g.isCubeTexture?T.setTextureCube(g,0):g.isData3DTexture?T.setTexture3D(g,0):g.isDataArrayTexture||g.isCompressedArrayTexture?T.setTexture2DArray(g,0):T.setTexture2D(g,0),fe.unbindTexture()},this.resetState=function(){H=0,j=0,F=null,fe.reset(),w.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}},Xp=`
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,qp=`
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst, uPaused;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float raw = uTime + t0;
  float t = uPaused > 0.5 ? floor(raw / CYCLE) * CYCLE + t0 : mod(raw, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`,Yp=ol({__name:"MagicRings",props:{color:{default:"#A855F7"},colorTwo:{default:"#6366F1"},ringCount:{default:6},speed:{default:1},attenuation:{default:10},lineThickness:{default:2},baseRadius:{default:.35},radiusStep:{default:.1},scaleRate:{default:.1},opacity:{default:1},blur:{default:0},noiseAmount:{default:.1},rotation:{default:0},ringGap:{default:1.5},fadeIn:{default:.7},fadeOut:{default:.5},followMouse:{type:Boolean,default:!1},mouseInfluence:{default:.2},hoverScale:{default:1.2},parallax:{default:.05},clickBurst:{type:Boolean,default:!1},isActive:{type:Boolean,default:!0}},setup(e){const t=e,n=Tt(()=>{if(typeof window>"u")return!0;const f=window.devicePixelRatio||1,x=navigator.hardwareConcurrency||2;return f<1||x<2}),i=zt(null);let r=null,s=null,a=null,o=null,c=null,l=0,u=0,h=0,d=0,m=0,S=0,M=!1,p=0;return ll(()=>{if(n.value)return;const f=i.value;if(!f)return;try{r=new Wp({alpha:!0})}catch{return}r.setClearColor(0,0),f.appendChild(r.domElement),s=new kd,a=new Oa(-.5,.5,.5,-.5,.1,10),a.position.z=1;const x={uTime:{value:0},uAttenuation:{value:t.attenuation},uResolution:{value:new ft},uColor:{value:new rt(t.color)},uColorTwo:{value:new rt(t.colorTwo)},uLineThickness:{value:t.lineThickness},uBaseRadius:{value:t.baseRadius},uRadiusStep:{value:t.radiusStep},uScaleRate:{value:t.scaleRate},uRingCount:{value:t.ringCount},uOpacity:{value:t.opacity},uNoiseAmount:{value:t.noiseAmount},uRotation:{value:t.rotation*Math.PI/180},uRingGap:{value:t.ringGap},uFadeIn:{value:t.fadeIn},uFadeOut:{value:t.fadeOut},uMouse:{value:new ft},uMouseInfluence:{value:t.followMouse?t.mouseInfluence:0},uHoverAmount:{value:0},uHoverScale:{value:t.hoverScale},uParallax:{value:t.parallax},uBurst:{value:0},uPaused:{value:0}};o=new fn({vertexShader:Xp,fragmentShader:qp,uniforms:x,transparent:!0}),c=new En(new Fa(1,1),o),s.add(c);const b=()=>{const Y=f.clientWidth,A=f.clientHeight,H=Math.min(window.devicePixelRatio,2);r?.setSize(Y,A),r?.setPixelRatio(H),x.uResolution.value.set(Y*H,A*H)};b(),window.addEventListener("resize",b);const E=new ResizeObserver(b);E.observe(f);const C=Y=>{const A=f.getBoundingClientRect();u=(Y.clientX-A.left)/A.width-.5,h=-((Y.clientY-A.top)/A.height-.5)},R=()=>{M=!0},I=()=>{M=!1,u=0,h=0},v=()=>{p=1};f.addEventListener("mousemove",C),f.addEventListener("mouseenter",R),f.addEventListener("mouseleave",I),t.clickBurst&&f.addEventListener("click",v);const y=Y=>{l=requestAnimationFrame(y),d+=(u-d)*.08,m+=(h-m)*.08,S+=((M?1:0)-S)*.08,p*=.95,p<.001&&(p=0),x.uTime.value=Y*.001*t.speed,x.uAttenuation.value=t.attenuation,x.uColor.value.set(t.color),x.uColorTwo.value.set(t.colorTwo),x.uLineThickness.value=t.lineThickness,x.uBaseRadius.value=t.baseRadius,x.uRadiusStep.value=t.radiusStep,x.uScaleRate.value=t.scaleRate,x.uRingCount.value=t.ringCount,x.uOpacity.value=t.opacity,x.uNoiseAmount.value=t.noiseAmount,x.uRotation.value=t.rotation*Math.PI/180,x.uRingGap.value=t.ringGap,x.uFadeIn.value=t.fadeIn,x.uFadeOut.value=t.fadeOut,x.uMouse.value.set(d,m),x.uMouseInfluence.value=t.followMouse?t.mouseInfluence:0,x.uHoverAmount.value=S,x.uHoverScale.value=t.hoverScale,x.uParallax.value=t.parallax,x.uBurst.value=t.clickBurst?p:0,x.uPaused.value=t.isActive?0:1,r?.render(s,a)};l=requestAnimationFrame(y),hl(()=>{cancelAnimationFrame(l),window.removeEventListener("resize",b),E.disconnect(),f.removeEventListener("mousemove",C),f.removeEventListener("mouseenter",R),f.removeEventListener("mouseleave",I),f.removeEventListener("click",v),r?.domElement.parentNode===f&&f.removeChild(r.domElement),r?.dispose(),o?.dispose()})}),(f,x)=>(lt(),ct("div",{ref_key:"containerRef",ref:i,class:"magic-rings-container",style:Nt({filter:e.blur>0?`blur(${e.blur}px)`:void 0})},null,4))}}),Kp=dl(Yp,[["__scopeId","data-v-d818867e"]]),Zp={key:0,class:"celebration-overlay"},$p={class:"timer-content"},jp={class:"timer-header"},Jp={class:"header-left"},Qp={class:"task-selector-container"},em={class:"task-name"},tm=["onClick"],nm={class:"item-title"},im={class:"item-meta"},rm={key:0,class:"dropdown-empty"},sm={class:"header-right"},am={class:"date-display"},om={class:"timer-center"},lm={class:"session-label-wrapper"},cm={class:"mode-switcher"},um=["disabled","onClick"],dm={class:"magic-rings-wrap"},hm=["width","height"],fm=["r","stroke"],pm=["stroke"],mm=["stroke","stroke-width"],_m=["r","stroke"],vm=["cx","cy","fill","fill-opacity"],gm={class:"timer-center-content"},Sm={key:0,class:"free-duration-input"},Mm={class:"duration-field"},xm={class:"duration-field"},Tm={key:1,class:"timer-status-badge paused-badge"},ym={key:2,class:"timer-status-hint"},Em={class:"pomodoro-indicators"},bm={key:0,width:"10",height:"10",viewBox:"0 0 24 24",fill:"currentColor"},Am={key:1,class:"dot-number"},Rm={class:"timer-controls glass"},wm=["disabled"],Cm={key:0,width:"28",height:"28",viewBox:"0 0 24 24",fill:"currentColor"},Pm={key:1,width:"28",height:"28",viewBox:"0 0 24 24",fill:"currentColor"},Im={class:"control-label"},Dm=["disabled","title"],Lm={key:0,class:"session-prompt glass"},Nm={key:0,class:"session-prompt glass"},Um={key:0,class:"session-prompt glass ff-confirm"},Fm={class:"prompt-desc"},Om={class:"timer-footer"},Bm={class:"stat-card glass"},Vm={class:"stat-info"},zm={class:"stat-card glass"},km={class:"stat-info"},Gm={class:"stat-value"},Hm={class:"stat-card glass"},Wm={class:"stat-info"},Xm={class:"stat-value"},un=120,as=6,qm=ol({__name:"TimerView",setup(e){const t=Dc(),n=Rc(),i=Cc(),r=Ic(),s=Pc(),{sendNotification:a,requestPermission:o}=Nc(),c=zt(!1),l=zt(!1),u=zt([]),h=zt(!1),d=zt(""),m=zt(!1),S=zt(""),M=zt(null),p=zt(null),f=zt(!1),x=Tt(()=>{if(t.currentTaskId)return n.getTaskById(t.currentTaskId)}),b=Tt(()=>x.value?.title||"未选择任务"),E=Tt(()=>Qt[t.sessionType]),C=Tt(()=>E.value.labelZh),R=Tt(()=>E.value.color),I=Tt(()=>[{value:"work",label:Qt.work.labelZh,color:Qt.work.color},{value:"short_break",label:Qt.short_break.labelZh,color:Qt.short_break.color},{value:"long_break",label:Qt.long_break.labelZh,color:Qt.long_break.color},{value:"free",label:Qt.free.labelZh,color:Qt.free.color}]),v=Tt(()=>t.formattedRemaining),y=2*Math.PI*un,Y=Tt(()=>t.isRunning&&!t.isPaused),A=Tt(()=>t.isPaused),H=Tt(()=>!t.isRunning&&!t.isPaused),j=Tt(()=>{const G=new Date;return`${bc(G)} ${Ac(G)}`}),F=Tt(()=>r.todaySessions.filter(G=>G.type==="work"&&G.completed).reduce((G,N)=>G+N.duration,0)),O=Tt(()=>Ec(Math.round(F.value/60))),z=Tt(()=>t.completedPomodoros),V=Tt(()=>t.pomodoroStreak),ee=Tt(()=>i.settings.longBreakInterval),q=Tt(()=>n.activeTasks),ne=zt(30),de=zt(0);Jn(()=>t.sessionType,G=>{if(G==="free"&&!t.isRunning){const N=Math.round(t.remaining);ne.value=Math.floor(N/60),de.value=N%60}});const be=Tt(()=>{const G=t.sessionType;return G==="work"?{background:`
        radial-gradient(ellipse at 20% 50%, rgba(88, 166, 255, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(136, 100, 255, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(88, 166, 255, 0.04) 0%, transparent 50%),
        var(--bg)
      `}:G==="short_break"?{background:`
        radial-gradient(ellipse at 30% 40%, rgba(63, 185, 80, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 60%, rgba(56, 211, 159, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 90%, rgba(63, 185, 80, 0.04) 0%, transparent 50%),
        var(--bg)
      `}:G==="long_break"?{background:`
        radial-gradient(ellipse at 25% 50%, rgba(240, 136, 62, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 75% 30%, rgba(255, 183, 77, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(240, 136, 62, 0.04) 0%, transparent 50%),
        var(--bg)
      `}:{background:"var(--bg)"}}),We=Tt(()=>R.value),Pe=Tt(()=>{switch(t.sessionType){case"work":return"#58A6FF";case"short_break":return"#3FB950";case"long_break":return"#7C3AED";case"free":return"#FF6B35";default:return"#58A6FF"}}),Z=Tt(()=>{const G=R.value;return`0 0 20px ${G}40, 0 0 40px ${G}20, 0 0 60px ${G}10`});function se(){if(U(),t.isRunning&&!t.isPaused)t.pause();else if(t.isPaused)t.resume();else{if(t.sessionType==="work"&&t.currentTaskId){h.value=!0;return}me()}}function me(G){if(t.sessionType==="free"){const N=ne.value*60+de.value;if(N<=0)return;t.start(N)}else t.start(void 0,G);t.isWorkSession?Uc():Fc()}function he(){h.value=!1,me(d.value.trim()),setTimeout(()=>{d.value=""},300)}function ve(){d.value="",he()}function Me(){t.reset()}const ye=zt(!1);function Xe(){const G=t.fastForward();G.success||G.reason==="quota_exhausted"&&(ye.value=!0)}function Ie(){ye.value=!1,t.fastForward(!0)}function tt(){ye.value=!1}function Ke(G){t.setCurrentTaskId(G),c.value=!1}function st(){c.value=!c.value}function at(){l.value=!0;const G=["#58A6FF","#3FB950","#A371F7","#F0883E","#F85149","#FFD700"];u.value=Array.from({length:24},(N,$)=>({id:$,x:(Math.random()-.5)*300,y:(Math.random()-.5)*300,size:Math.random()*8+4,delay:Math.random()*.5,color:G[Math.floor(Math.random()*G.length)]})),setTimeout(()=>{l.value=!1,u.value=[]},3e3)}async function ot(){Oc(),Bc(),at(),await a(t.isWorkSession?"番茄钟完成!":"休息结束!",t.isWorkSession?`太棒了！你完成了一个番茄钟 ${x.value?`- ${x.value.title}`:""}`:"休息结束，准备开始下一个番茄钟吧！",{tag:"pomodorox-timer",onClick:()=>{window.focus()}})}async function P(){const G=t.pendingCompletionForTaskId;if(G&&S.value.trim()){const N=r.getSessionsByTask(G).sort(($,J)=>J.startedAt.localeCompare($.startedAt))[0];N&&await r.updateSession(N.id,{completion:S.value.trim()})}m.value=!1,S.value="",t.clearPendingCompletion()}function Je(){S.value="",m.value=!1,t.clearPendingCompletion()}function De(){se(),window.innerWidth<640&&!t.isRunning&&!t.isPaused&&s.toggleImmersiveMode()}let Ue="";function fe(G){if(!f.value||!G||G===Ue){Ue=G;return}const N=Ue.padEnd(5," "),$=G.padEnd(5," "),J=document.querySelectorAll(".timer-digits .digit-char");for(let Te=0;Te<Math.min(J.length,5);Te++){const Ae=J[Te];if(!Ae||Ae.classList.contains("digit-colon"))continue;const Ce=N[Te],ze=$[Te];if(Ce===ze)continue;const w=parseInt(Ce),K=parseInt(ze);if(isNaN(w)||isNaN(K)){Ae.textContent=ze;continue}const ae={v:w};Fr(ae,{v:[w,K],duration:350,ease:"inOutBack",onUpdate:()=>{Ae.textContent=Math.round(Math.abs(ae.v)).toString();const ce=Math.abs((ae.v-w)/(K-w||1));Ae.style.transform=`translateY(${(1-ce)*5}px)`,Ae.style.opacity=String(.55+.45*ce)},onComplete:()=>{Ae.style.transform="",Ae.style.opacity=""}})}Ue=G}let nt=!1,xe=0;function T(G){if(!M.value||nt){xe=G;return}nt=!0;const N=xe,$=G,J={v:N},Te=2*Math.PI*un;Fr(J,{v:[N,$],duration:600,ease:"inOutCubic",onUpdate:()=>{const Ae=Te-J.v/100*Te;M.value?.setAttribute("stroke-dashoffset",String(Ae))},onComplete:()=>{xe=$,nt=!1}})}const _=Au({stiffness:220,damping:14});function U(){p.value&&Fr(p.value,{scale:[1,.92,1],duration:500,ease:_})}function Q(G,N){G&&Fr(G,{color:N,duration:500,ease:"inOutQuad"})}let te=r.todayPomodoros;Jn(()=>r.todayPomodoros,G=>{G>te&&ot(),te=G}),Jn(()=>t.pendingCompletionForTaskId,G=>{G&&(m.value=!0)}),Jn(()=>t.sessionType,G=>{const N=Qt[G]?.labelZh||"计时器";document.title=`${N} - PomodoroX`}),Jn(()=>t.formattedRemaining,G=>{fe(G)}),Jn(()=>t.progress,G=>{T(G)}),Jn(()=>t.sessionType,()=>{$a(()=>{Qt[t.sessionType]&&oe()})});function oe(){const G=Qt[t.sessionType]?.color||"";G&&document.querySelectorAll(".timer-digits, .session-type-badge").forEach(N=>{Q(N,G)})}function ue(G){const N=G.target;N.tagName==="INPUT"||N.tagName==="TEXTAREA"||N.isContentEditable||G.code==="Space"&&!G.ctrlKey&&!G.metaKey&&(G.preventDefault(),se())}function D(G){const N=G.target;c.value&&!N.closest(".task-selector-container")&&(c.value=!1)}return ll(async()=>{if(await t.loadTodaySessions(),await n.loadTasks(),t.initRemainingIfZero(),await o(),document.addEventListener("keydown",ue),document.addEventListener("click",D),await $a(),Ue=t.formattedRemaining,xe=t.progress,M.value){const G=2*Math.PI*un,N=G-t.progress/100*G;M.value.setAttribute("stroke-dashoffset",String(N))}f.value=!0}),hl(()=>{document.removeEventListener("keydown",ue),document.removeEventListener("click",D)}),(G,N)=>(lt(),ct("div",{class:"timer-view",style:Nt(be.value)},[ie("div",{class:vn(["timer-bg-layer",`session-${It(t).sessionType}`])},[...N[8]||(N[8]=[wc('<div class="bg-deep" data-v-2ef4336f></div><div class="bg-orb bg-orb-1" data-v-2ef4336f></div><div class="bg-orb bg-orb-2" data-v-2ef4336f></div><div class="bg-orb bg-orb-3" data-v-2ef4336f></div><div class="bg-mesh" data-v-2ef4336f></div>',5)])],2),Si(ji,{name:"celebration"},{default:Ji(()=>[l.value?(lt(),ct("div",Zp,[(lt(!0),ct(gi,null,Mi(u.value,$=>(lt(),ct("div",{key:$.id,class:"celebration-particle",style:Nt({transform:`translate(${$.x}px, ${$.y}px)`,width:`${$.size}px`,height:`${$.size}px`,animationDelay:`${$.delay}s`,backgroundColor:$.color})},null,4))),128))])):An("",!0)]),_:1}),ie("div",$p,[ie("header",jp,[ie("div",Jp,[ie("div",Qp,[ie("button",{class:"current-task-btn glass",onClick:wr(st,["stop"])},[N[10]||(N[10]=ie("span",{class:"task-icon"},[ie("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none"},[ie("path",{d:"M3 3h10v1H3V3zm0 4h7v1H3V7zm0 4h10v1H3v-1z",fill:"currentColor",opacity:"0.7"})])],-1)),ie("span",em,Lt(b.value),1),(lt(),ct("svg",{class:vn(["chevron-icon",{open:c.value}]),width:"12",height:"12",viewBox:"0 0 12 12",fill:"none"},[...N[9]||(N[9]=[ie("path",{d:"M3 4.5L6 7.5L9 4.5",stroke:"currentColor","stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"},null,-1)])],2))]),Si(ji,{name:"dropdown"},{default:Ji(()=>[c.value?(lt(),ct("div",{key:0,class:"task-dropdown glass-strong",onClick:N[1]||(N[1]=wr(()=>{},["stop"]))},[N[12]||(N[12]=ie("div",{class:"dropdown-header"},"选择任务",-1)),ie("button",{class:vn(["dropdown-item",{active:It(t).currentTaskId===null}]),onClick:N[0]||(N[0]=$=>Ke(null))},[...N[11]||(N[11]=[ie("span",{class:"item-indicator"},null,-1),ie("span",null,"无任务",-1)])],2),N[13]||(N[13]=ie("div",{class:"dropdown-divider"},null,-1)),(lt(!0),ct(gi,null,Mi(q.value,$=>(lt(),ct("button",{key:$.id,class:vn(["dropdown-item",{active:It(t).currentTaskId===$.id}]),onClick:J=>Ke($.id)},[ie("span",{class:"item-indicator",style:Nt({backgroundColor:$.status==="in_progress"?"#58A6FF":"transparent"})},null,4),ie("span",nm,Lt($.title),1),ie("span",im,Lt($.actualPomodoros)+"/"+Lt($.estimatedPomodoros),1)],10,tm))),128)),q.value.length===0?(lt(),ct("div",rm," 暂无任务，去添加一个吧 ")):An("",!0)])):An("",!0)]),_:1})])]),ie("div",sm,[ie("span",am,Lt(j.value),1)])]),ie("div",om,[ie("div",lm,[ie("span",{class:"session-type-badge",style:Nt({color:R.value,borderColor:R.value+"40",background:R.value+"15"})},Lt(C.value),5),ie("div",cm,[(lt(!0),ct(gi,null,Mi(I.value,$=>(lt(),ct("button",{key:$.value,class:vn(["mode-chip",{active:It(t).sessionType===$.value}]),style:Nt(It(t).sessionType===$.value?{color:$.color,borderColor:$.color+"40",background:$.color+"12"}:{}),disabled:It(t).isRunning,onClick:J=>It(t).setSessionType($.value)},Lt($.label),15,um))),128))])]),ie("div",{class:vn(["timer-ring-container",{breathing:Y.value,paused:A.value}]),onClick:De},[ie("div",dm,[Si(Kp,{color:R.value,colorTwo:Pe.value,ringCount:6,speed:.8,attenuation:8,lineThickness:2,baseRadius:.35,radiusStep:.1,scaleRate:.08,opacity:.8,blur:5,noiseAmount:.05,rotation:0,ringGap:1.6,fadeIn:.6,fadeOut:.4,followMouse:!0,mouseInfluence:.15,hoverScale:1.1,parallax:.03,clickBurst:!1,isActive:Y.value},null,8,["color","colorTwo","isActive"])]),ie("div",{class:"ring-glow",style:Nt({boxShadow:`0 0 60px ${R.value}20, 0 0 120px ${R.value}10`})},null,4),(lt(),ct("svg",{class:"timer-ring-svg",width:un*2+as*2+60,height:un*2+as*2+60,viewBox:"0 0 340 340"},[ie("circle",{cx:"170",cy:"170",r:un+12,fill:"none",stroke:R.value,"stroke-opacity":"0.04","stroke-width":"1"},null,8,fm),ie("circle",{cx:"170",cy:"170",r:un,fill:"none",stroke:R.value,"stroke-opacity":"0.08","stroke-width":as},null,8,pm),ie("circle",{ref_key:"ringCircleRef",ref:M,cx:"170",cy:"170",r:un,fill:"none",stroke:We.value,"stroke-width":as+2,"stroke-linecap":"round","stroke-dasharray":y,"stroke-dashoffset":y,class:"progress-ring",style:Nt({filter:Y.value?Z.value:"none"}),transform:"rotate(-90 170 170)"},null,12,mm),ie("circle",{cx:"170",cy:"170",r:un-16,fill:"none",stroke:R.value,"stroke-opacity":"0.06","stroke-width":"1","stroke-dasharray":"4 6"},null,8,_m),(lt(),ct(gi,null,Mi(12,$=>ie("g",{key:"tick-"+$},[ie("circle",{cx:170+(un+20)*Math.cos((($-1)*30-90)*Math.PI/180),cy:170+(un+20)*Math.sin((($-1)*30-90)*Math.PI/180),r:"2",fill:R.value,"fill-opacity":$%3===0?.5:.15},null,8,vm)])),64))],8,hm)),ie("div",gm,[ie("div",{class:"timer-digits",style:Nt({color:R.value})},[(lt(!0),ct(gi,null,Mi(v.value.split(""),($,J)=>(lt(),ct("span",{key:J,class:vn(["digit-char",{"digit-colon":$===":"}])},Lt($),3))),128))],4),H.value&&It(t).sessionType==="free"?(lt(),ct("div",Sm,[ie("div",Mm,[Pr(ie("input",{ref:"minInputRef","onUpdate:modelValue":N[2]||(N[2]=$=>ne.value=$),type:"number",min:"1",max:"999",class:"duration-input",style:Nt({borderColor:R.value+"40",color:R.value}),onKeydown:N[3]||(N[3]=wr(()=>{},["stop"]))},null,36),[[Cr,ne.value,void 0,{number:!0}]]),ie("span",{class:"duration-unit",style:Nt({color:R.value})},"分",4)]),N[14]||(N[14]=ie("span",{class:"duration-sep"},":",-1)),ie("div",xm,[Pr(ie("input",{"onUpdate:modelValue":N[4]||(N[4]=$=>de.value=$),type:"number",min:"0",max:"59",class:"duration-input",style:Nt({borderColor:R.value+"40",color:R.value}),onKeydown:N[5]||(N[5]=wr(()=>{},["stop"]))},null,36),[[Cr,de.value,void 0,{number:!0}]]),ie("span",{class:"duration-unit",style:Nt({color:R.value})},"秒",4)])])):An("",!0),A.value?(lt(),ct("div",Tm," 已暂停 ")):H.value&&It(t).sessionType!=="free"?(lt(),ct("div",ym," 按空格键开始 ")):An("",!0)])],2),ie("div",Em,[(lt(!0),ct(gi,null,Mi(ee.value,$=>(lt(),ct("span",{key:"pomo-"+$,class:vn(["pomodoro-dot",{filled:$<=V.value,current:$===V.value+1&&It(t).isWorkSession}]),style:Nt({backgroundColor:$<=V.value?R.value:void 0,borderColor:$<=V.value?R.value:void 0,boxShadow:$<=V.value?`0 0 10px ${R.value}40`:"none"})},[$<=V.value?(lt(),ct("svg",bm,[...N[15]||(N[15]=[ie("path",{d:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"},null,-1)])])):(lt(),ct("span",Am,Lt($),1))],6))),128))])]),ie("div",Rm,[ie("button",{class:"control-btn secondary-btn",disabled:H.value,title:"重置 (Ctrl+R)",onClick:Me},[...N[16]||(N[16]=[ie("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[ie("polyline",{points:"1 4 1 10 7 10"}),ie("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})],-1),ie("span",{class:"control-label"},"重置",-1)])],8,wm),ie("button",{ref_key:"primaryBtnRef",ref:p,class:vn(["control-btn primary-btn",{"is-running":Y.value}]),style:Nt({"--btn-color":R.value,"--btn-glow":`${R.value}40`}),onClick:se},[Y.value?(lt(),ct("svg",Cm,[...N[17]||(N[17]=[ie("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"},null,-1),ie("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"},null,-1)])])):(lt(),ct("svg",Pm,[...N[18]||(N[18]=[ie("path",{d:"M8 5v14l11-7z"},null,-1)])])),ie("span",Im,Lt(Y.value?"暂停":A.value?"继续":"开始"),1)],6),ie("button",{class:"control-btn secondary-btn ff-btn",disabled:H.value,title:`快进 10 分钟 (已用 ${It(t).sessionFastForwardCount}/3)`,onClick:Xe},[N[19]||(N[19]=ie("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"currentColor"},[ie("polygon",{points:"13 19 22 12 13 5 13 19"}),ie("polygon",{points:"2 19 11 12 2 5 2 19"})],-1)),N[20]||(N[20]=ie("span",{class:"control-label"},"快进 10′",-1)),It(t).sessionFastForwardCount>0?(lt(),ct("span",{key:0,class:vn(["ff-count",{"ff-count-over":It(t).sessionFastForwardCount>=3}])},Lt(It(t).sessionFastForwardCount>=3?It(t).sessionFastForwardCount:It(t).sessionFastForwardCount+"/3"),3)):An("",!0)],8,Dm)]),Si(ji,{name:"dropdown"},{default:Ji(()=>[h.value?(lt(),ct("div",Lm,[N[21]||(N[21]=ie("div",{class:"prompt-label"},"本次专注目标（可选）",-1)),Pr(ie("input",{"onUpdate:modelValue":N[6]||(N[6]=$=>d.value=$),type:"text",class:"prompt-input",placeholder:"例如：完成登录页面的 UI 设计...",onKeydown:Ka(he,["enter"])},null,544),[[Cr,d.value]]),ie("div",{class:"prompt-actions"},[ie("button",{class:"btn btn-secondary btn-sm",onClick:ve},"跳过"),ie("button",{class:"btn btn-primary btn-sm",onClick:he},"开始专注")])])):An("",!0)]),_:1}),Si(ji,{name:"dropdown"},{default:Ji(()=>[m.value?(lt(),ct("div",Nm,[N[22]||(N[22]=ie("div",{class:"prompt-label"},"本次专注总结（可选）",-1)),Pr(ie("input",{"onUpdate:modelValue":N[7]||(N[7]=$=>S.value=$),type:"text",class:"prompt-input",placeholder:"例如：完成了登录页原型，遇到一个小兼容性问题...",onKeydown:Ka(P,["enter"])},null,544),[[Cr,S.value]]),ie("div",{class:"prompt-actions"},[ie("button",{class:"btn btn-secondary btn-sm",onClick:Je},"跳过"),ie("button",{class:"btn btn-primary btn-sm",onClick:P},"保存总结")])])):An("",!0)]),_:1}),Si(ji,{name:"dropdown"},{default:Ji(()=>[ye.value?(lt(),ct("div",Um,[N[25]||(N[25]=ie("div",{class:"prompt-label"},"本周快进额度已用完",-1)),ie("p",Fm,[Za(" 当前 session 已快进 "+Lt(It(t).sessionFastForwardCount)+" 次，本周额度（"+Lt(It(i).settings.weeklyFastForwardQuota)+" 次）也已用尽。",1),N[23]||(N[23]=ie("br",null,null,-1)),N[24]||(N[24]=Za(" 确定继续快进？超额使用将在下周一自动恢复。 ",-1))]),ie("div",{class:"prompt-actions"},[ie("button",{class:"btn btn-secondary btn-sm",onClick:tt},"取消"),ie("button",{class:"btn btn-primary btn-sm",onClick:Ie},"继续快进")])])):An("",!0)]),_:1}),ie("footer",Om,[ie("div",Bm,[ie("div",{class:"stat-icon-wrapper",style:Nt({background:R.value+"20",color:R.value})},[...N[26]||(N[26]=[ie("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"currentColor"},[ie("circle",{cx:"12",cy:"12",r:"10",opacity:"0.3"}),ie("circle",{cx:"12",cy:"12",r:"4"})],-1)])],4),ie("div",Vm,[ie("span",{class:"stat-value",style:Nt({color:R.value})},Lt(z.value),5),N[27]||(N[27]=ie("span",{class:"stat-label"},"今日番茄",-1))])]),ie("div",zm,[N[29]||(N[29]=ie("div",{class:"stat-icon-wrapper",style:{background:"rgba(63, 185, 80, 0.2)",color:"var(--success)"}},[ie("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[ie("circle",{cx:"12",cy:"12",r:"10"}),ie("polyline",{points:"12 6 12 12 16 14"})])],-1)),ie("div",km,[ie("span",Gm,Lt(O.value),1),N[28]||(N[28]=ie("span",{class:"stat-label"},"专注时长",-1))])]),ie("div",Hm,[N[31]||(N[31]=ie("div",{class:"stat-icon-wrapper",style:{background:"rgba(240, 136, 62, 0.2)",color:"var(--warning)"}},[ie("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[ie("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})])],-1)),ie("div",Wm,[ie("span",Xm,Lt(V.value)+"/"+Lt(ee.value),1),N[30]||(N[30]=ie("span",{class:"stat-label"},"连续进度",-1))])])])])],4))}}),Jm=dl(qm,[["__scopeId","data-v-2ef4336f"]]);export{Jm as default};
