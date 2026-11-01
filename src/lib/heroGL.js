import { clamp, onFrame } from "./scroll.js";

// Hero portrait: resolves out of a hexagon grid on load, and the pointer leaves a
// liquid trail that turns the photo back into hexagons. The <img> underneath stays
// as the LCP element and as the fallback when WebGL is unavailable.

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImg, uMask;
uniform vec2 uRes, uSize, uFocus;
uniform float uT, uIntro, uScroll, uCell;

const vec3 BG  = vec3(.027, .043, .082);
const vec3 AZ  = vec3(.302, .608, 1.);
const vec3 ICE = vec3(.86, .93, 1.);
const vec3 IND = vec3(.24, .2, .74);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}

// object-fit: cover, with the crop anchored at uFocus
vec2 cover(vec2 uv) {
  float ra = uRes.x / uRes.y, ia = uSize.x / uSize.y;
  vec2 s = ra > ia ? vec2(1., ia / ra) : vec2(ra / ia, 1.);
  return uv * s + (1. - s) * uFocus;
}

vec2 zoom(vec2 uv) {
  vec2 c = vec2(uFocus.x, .66);
  return (uv - c) / (1. + .1 * uScroll) + c;
}

// Pointy-top hexagon grid, same orientation as the logo
vec4 hexGrid(vec2 p) {
  const vec2 s = vec2(1., 1.7320508);
  vec2 h = s * .5;
  vec2 a = mod(p, s) - h;
  vec2 b = mod(p - h, s) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return vec4(g, p - g);
}
float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, vec2(.5, .8660254)), p.x);
}

// Dense and contrasty: deep shadows that melt into the page, skin left natural.
vec3 grade(vec3 c) {
  c = pow(c, vec3(.9));
  float l = dot(c, vec3(.299, .587, .114));
  c = mix(vec3(l), c, 1.14);
  c = mix(c * vec3(.94, .98, 1.08), c, smoothstep(.02, .34, l));
  c = clamp((c - .46) * 1.2 + .46, 0., 1.);
  return 1. - (1. - c) * (1. - BG * .9);
}

void main() {
  vec2 px = vUv * uRes;
  vec2 iuv = cover(zoom(vUv));

  // Pointer trail, with a liquid edge
  vec2 wob = vec2(noise(px * .007 + uT * .22), noise(px * .007 - uT * .18)) - .5;
  float m = smoothstep(.16, .46, texture2D(uMask, vUv + wob * .03).r);

  // Load sequence: large cells resolve from the face outwards
  vec4 big = hexGrid(px / (uCell * 4.));
  vec2 bigUv = big.zw * uCell * 4. / uRes;
  float dist = length((bigUv - vec2(uFocus.x * .86, .64)) * vec2(uRes.x / uRes.y, 1.));
  float resolved = smoothstep(0., .14, uIntro * 1.75 - dist * .62 - hash(big.zw) * .34);
  float hexAmt = max(m, 1. - resolved);

  vec3 photo = grade(texture2D(uImg, iuv).rgb);

  // Hexagon halftone: each cell's size follows the photo's luminance
  vec4 h = hexGrid(px / uCell);
  vec2 cellUv = cover(zoom(h.zw * uCell / uRes));
  vec3 cellCol = grade(texture2D(uImg, cellUv).rgb);
  float l = dot(cellCol, vec3(.299, .587, .114));
  float r = .5 * pow(clamp(l * 1.45, 0., 1.), .62);
  float fill = smoothstep(r + .05, r - .05, hexDist(h.xy));
  vec3 ramp = mix(IND, mix(AZ, ICE, smoothstep(.42, .85, l)), smoothstep(.06, .34, l));
  vec3 halftone = mix(BG * .75, ramp, fill * (.3 + l * 1.3));

  vec3 col = mix(photo, halftone, hexAmt);
  col += AZ * .3 * smoothstep(0., .18, m) * smoothstep(.62, .18, m);

  // Dissolve into the page below, then dim as the hero leaves
  col = mix(BG, col, smoothstep(.02, .24, vUv.y));
  col *= 1. - uScroll * .6;
  col += (hash(px + uT) - .5) * .02;
  gl_FragColor = vec4(col, 1.);
}`;

function shader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function texture(gl, unit, source) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  return t;
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function createHeroGL(canvas, { src, focus, fine }) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const image = await loadImage(src);

  const program = gl.createProgram();
  gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ["uImg", "uMask", "uRes", "uSize", "uFocus", "uT", "uIntro", "uScroll", "uCell"]
    .forEach((name) => { u[name] = gl.getUniformLocation(program, name); });

  // The trail is drawn on a small 2D canvas and uploaded as a texture each frame.
  const mask = document.createElement("canvas");
  mask.width = 256;
  mask.height = 160;
  const ctx = mask.getContext("2d", { willReadFrequently: false });
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, mask.width, mask.height);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  texture(gl, 0, image);
  const maskTex = texture(gl, 1, mask);
  gl.uniform1i(u.uImg, 0);
  gl.uniform1i(u.uMask, 1);
  gl.uniform2f(u.uSize, image.naturalWidth, image.naturalHeight);
  gl.uniform2f(u.uFocus, focus[0], focus[1]);

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uCell, (width < 700 ? 7 : 9) * dpr);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  // Pointer state; x/y are in CSS pixels relative to the hero.
  const pointer = { x: -1, y: -1, tx: -1, ty: -1, active: false };
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY > rect.bottom) return;
    pointer.tx = e.clientX - rect.left;
    pointer.ty = e.clientY - rect.top;
    if (!pointer.active) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
    pointer.active = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const stamp = (x, y, radius) => {
    const px = (x / width) * mask.width;
    const py = (y / height) * mask.height;
    const g = ctx.createRadialGradient(px, py, 0, px, py, radius);
    g.addColorStop(0, "rgba(255,255,255,.34)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  };

  // Tied to the clock, so a slow device reaches the photo just as fast as a quick one.
  let playedAt = null;
  let visible = true;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(canvas);

  const off = onFrame((scrollY, time) => {
    if (!visible || document.hidden) return;
    const intro = playedAt === null ? 0 : clamp((performance.now() - playedAt) / 1500);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,.07)";
    ctx.fillRect(0, 0, mask.width, mask.height);
    ctx.globalCompositeOperation = "lighter";

    if (fine) {
      if (pointer.active) {
        const steps = 5;
        for (let i = 1; i <= steps; i++) {
          const k = i / steps;
          stamp(pointer.x + (pointer.tx - pointer.x) * k, pointer.y + (pointer.ty - pointer.y) * k, 19);
        }
        pointer.x += (pointer.tx - pointer.x) * 0.28;
        pointer.y += (pointer.ty - pointer.y) * 0.28;
      }
    } else if (intro >= 1) {
      // No pointer on touch: a slow scan drifts across the portrait instead.
      const t = time * 0.00022;
      stamp(width * (0.5 + 0.34 * Math.sin(t * 2.1)), height * (0.3 + 0.16 * Math.cos(t * 3.1)), 22);
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);

    gl.uniform1f(u.uT, time * 0.001);
    gl.uniform1f(u.uIntro, intro);
    gl.uniform1f(u.uScroll, clamp(scrollY / height));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return {
    play() { playedAt = performance.now(); },
    destroy() {
      off();
      io.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    },
  };
}
