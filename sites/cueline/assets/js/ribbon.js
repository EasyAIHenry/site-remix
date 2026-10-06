/* Cueline hero ribbon: a silk-like diagonal band of colour, drawn with a
   WebGL fragment shader written for this page. Two layered bands of
   domain-warped noise, streaked along the band direction, mapped to the
   Cueline palette (deep teal -> lagoon -> mint -> lime -> sun).
   Pauses off-screen; draws one still frame for prefers-reduced-motion;
   falls back to a CSS gradient when WebGL is not available. */
(function () {
  "use strict";
  var canvas = document.getElementById("ribbon");
  if (!canvas) return;
  var host = canvas.parentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true }) ||
         canvas.getContext("experimental-webgl");
  } catch (e) { gl = null; }
  if (!gl) { host.classList.add("is-fallback"); return; }

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;uniform float uTime;uniform float uDpr;uniform vec4 uLine;uniform vec2 uWidth;uniform float uScroll;",
    "float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);",
    " return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.02+3.1;a*=.5;}return v;}",
    "vec3 pal(float t){",
    " vec3 c0=vec3(.76,.95,.93);",   // pale aqua edge
    " vec3 c1=vec3(.08,.72,.77);",   // lagoon
    " vec3 c2=vec3(.04,.36,.39);",   // deep teal core
    " vec3 c3=vec3(.25,.88,.66);",   // mint
    " vec3 c4=vec3(.77,.95,.35);",   // lime
    " vec3 c5=vec3(1.,.81,.29);",    // sun
    " vec3 c6=vec3(1.,.62,.27);",    // amber tip
    " t=clamp(t,0.,1.);",
    " if(t<.16)return mix(c0,c1,t/.16);",
    " if(t<.3)return mix(c1,c2,(t-.16)/.14);",
    " if(t<.48)return mix(c2,c3,(t-.3)/.18);",
    " if(t<.66)return mix(c3,c4,(t-.48)/.18);",
    " if(t<.84)return mix(c4,c5,(t-.66)/.18);",
    " return mix(c5,c6,(t-.84)/.16);}",
    // one band: returns rgb in xyz and coverage in w
    "vec4 band(vec2 P,vec2 A,vec2 B,float w0,float w1,float seed,float tm){",
    " vec2 d=normalize(B-A);vec2 nn=vec2(-d.y,d.x);",
    " float L=length(B-A);",
    " float s=dot(P-A,d);float t=dot(P-A,nn);",
    " float sn=s/L;",
    // gentle bend and breathing
    " t+=60.*sin(sn*2.6+tm*.35+seed)+28.*sin(sn*5.1-tm*.22+seed*2.);",
    " float w=mix(w0,w1,clamp(sn,0.,1.2));",
    // domain warp for flowing silk
    " vec2 q=vec2(s/520.,t/210.);",
    " vec2 wv=vec2(fbm(q*1.3+vec2(tm*.06,seed)),fbm(q*1.3+vec2(seed,-tm*.05)+5.2));",
    " float fib=fbm(vec2(s/1100.+wv.x*.5-tm*.025,t/44.+wv.y*2.4+seed));",
    " float fine=n(vec2(s/420.,t/2.6+fib*5.));",
    " float x=t/w;",
    " float edgeN=(fbm(vec2(s/140.+seed,tm*.1))-.5)*.35;",
    " float cov=smoothstep(1.+edgeN,.72+edgeN*.5,abs(x));",
    // fibrous fringe: streaks that leak past the edge
    " float fringe=smoothstep(1.35,.95,abs(x))*smoothstep(.74,.9,fine)*.28;",
    " cov=max(cov,fringe);",
    " float ct=x*.5+.5;",
    " ct=ct*.86+(fib-.5)*.42+wv.x*.14+.05*sin(sn*3.+tm*.4);",
    " vec3 col=pal(ct);",
    // silk sheen: bright streaks along the band
    " float sheen=pow(smoothstep(.35,.95,fib),2.2);",
    " col=mix(col,vec3(1.),sheen*.32);",
    " float thr=pow(n(vec2(s/1700.+tm*.01,t/4.2+wv.y*5.+seed)),7.);",
    " col=mix(col,vec3(1.),thr*.55*smoothstep(1.,.3,abs(x)));",
    " col*=.95+.08*fine;col*=.9+.16*smoothstep(-1.,.6,x);",
    " return vec4(col,cov);}",
    "void main(){",
    " vec2 P=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;",
    " vec2 R=uRes/uDpr;",
    " P.y+=uScroll*.25;",
    " float tm=uTime;",
    " vec2 A=uLine.xy*R;vec2 B=uLine.zw*R;",
    " vec4 b1=band(P,A,B,uWidth.x,uWidth.y,1.7,tm);",
    " vec4 b2=band(P,A+vec2(R.x*.07,-20.),B+vec2(R.x*.05,40.),uWidth.x*.55,uWidth.y*.62,7.3,tm*1.15);",
    " vec3 col=b1.rgb;float a=b1.a;",
    // second, thinner band over the first, slightly brighter
    " col=mix(col,b2.rgb*1.04,b2.a*.78);a=max(a,b2.a*.9);",
    // fine grain to avoid banding
    " float g=h(gl_FragCoord.xy+fract(tm)*100.)-.5;",
    " col+=g*.035;",
    " a=clamp(a,0.,1.);",
    " gl_FragColor=vec4(col*a,a);}"
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
    return s;
  }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
  } catch (e) { host.classList.add("is-fallback"); canvas.style.display = "none"; return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "uRes");
  var uTime = gl.getUniformLocation(prog, "uTime");
  var uDpr = gl.getUniformLocation(prog, "uDpr");
  var uLine = gl.getUniformLocation(prog, "uLine");
  var uWidth = gl.getUniformLocation(prog, "uWidth");
  var uScroll = gl.getUniformLocation(prog, "uScroll");

  var dpr = 1, W = 0, H = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var r = host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // band geometry as fractions of the hero box, tuned per layout
    if (W < 900) {
      gl.uniform4f(uLine, 0.34, -0.12, 1.28, 0.34);
      gl.uniform2f(uWidth, 80, 170);
    } else {
      gl.uniform4f(uLine, 0.55, -0.10, 1.05, 1.02);
      gl.uniform2f(uWidth, 150, 300);
    }
    if (reduce || !running) draw(t0);
  }

  var start = performance.now(), raf = 0, running = false, t0 = 8.0, scrollY = 0;
  function draw(t) {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uDpr, dpr);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, scrollY);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    scrollY = window.scrollY || 0;
    draw(t0 + (now - start) / 1000);
    raf = requestAnimationFrame(loop);
  }
  function play() { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  window.addEventListener("resize", resize);
  if (reduce) { draw(t0); return; }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : stop(); }).observe(host);
  } else { play(); }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
})();
