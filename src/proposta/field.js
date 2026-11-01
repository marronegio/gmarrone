import { onFrame } from "../lib/scroll.js";

// The particles of the opening scene. The same grains are dust around the envelope, the
// envelope's outline as it forms and speed lines on the way through the iris; the page itself
// has none, so it reads without distraction. All of it runs in the vertex shader, driven by a
// few numbers, so a phone only ever pays for one draw call.

const VERT = `
precision highp float;
attribute vec4 aSeed; // xy: place on screen, z: depth, w: random
attribute vec2 aShape; // where the grain goes when a shape forms, in px

uniform vec2 uRes, uCenter, uMouse, uShock;
uniform float uT, uDpr, uForm, uWarp, uShockT, uMouseOn, uLight;

varying float vA;
varying float vThin;
varying vec3 vC;
varying vec2 vDir;

const vec3 AZ  = vec3(.302, .608, 1.);
const vec3 ICE = vec3(.86, .93, 1.);
const vec3 IND = vec3(.42, .36, .95);

void main() {
  float depth = aSeed.z;

  // Dust: rises and sways, nearer grains a little faster
  vec2 p = aSeed.xy;
  p.y = fract(p.y - uT * (.003 + .011 * depth));
  p += .014 * vec2(sin(uT * .19 + aSeed.w * 6.28 + p.y * 5.), cos(uT * .16 + aSeed.w * 9.4 + p.x * 5.));
  p *= uRes;

  // Shape: every grain sets off at its own moment
  float k = clamp((uForm - aSeed.w * .4) / .6, 0., 1.);
  k = k * k * (3. - 2. * k);
  p = mix(p, aShape, k);

  // The pointer parts the dust
  vec2 m = p - uMouse;
  float md = dot(m, m);
  p += m / sqrt(md + 1.) * 52. * uMouseOn * exp(-md / 16000.);

  // Shockwave, as the seal gives way
  vec2 s = p - uShock;
  float sd = length(s);
  float wave = sd - uShockT * 1100.;
  p += s / (sd + 1.) * 64. * (1. - uShockT) * exp(-wave * wave / 5200.);

  // Warp: grains leave the centre and stretch along their way out
  vec2 c = p - uCenter;
  p = uCenter + c * (1. + uWarp * uWarp * (1.6 + depth * 7.));
  float stretch = 1. + uWarp * (3. + depth * 9.);
  vDir = normalize(c + vec2(.001));
  vThin = stretch;

  float twinkle = .62 + .38 * sin(uT * (1. + aSeed.w * 2.) + aSeed.w * 40.);
  vA = (.22 + .78 * depth * depth) * twinkle * uLight * (1. + k * 1.5);
  vC = aSeed.w < .14 ? IND : mix(AZ, ICE, aSeed.x * aSeed.y);

  gl_PointSize = (1.1 + depth * 2.3) * uDpr * stretch * (1. + k * .35);
  gl_Position = vec4(p / uRes * 2. - 1., 0., 1.);
  gl_Position.y *= -1.;
}`;

const FRAG = `
precision mediump float;
varying float vA;
varying float vThin;
varying vec3 vC;
varying vec2 vDir;

void main() {
  vec2 q = gl_PointCoord - .5;
  float along = dot(q, vDir);
  float across = dot(q, vec2(-vDir.y, vDir.x)) * vThin;
  float a = min(smoothstep(.5, .12, length(vec2(along, across))) * vA, 1.);
  if (a < .004) discard;
  gl_FragColor = vec4(vC * a, a);
}`;

const EASE = {
  out: (t) => 1 - (1 - t) ** 3,
  in: (t) => t ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
};

const UNIFORMS = ["uRes", "uCenter", "uMouse", "uShock", "uT", "uDpr", "uForm", "uWarp", "uShockT", "uMouseOn", "uLight"];

function shader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

// Scatters `count` points along the envelope's edges, flap and pocket folds.
export function envelopeOutline({ left: x, top: y, width: w, height: h }, count) {
  const tip = [x + w / 2, y + h * 0.56];
  const fold = [x + w / 2, y + h * 0.5];
  const lines = [
    [[x, y], [x + w, y]], [[x + w, y], [x + w, y + h]], [[x + w, y + h], [x, y + h]], [[x, y + h], [x, y]],
    [[x, y], tip], [[x + w, y], tip],
    [[x, y + h], fold], [[x + w, y + h], fold],
  ];
  const lengths = lines.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);

  const points = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    let along = Math.random() * total;
    let line = 0;
    while (along > lengths[line]) along -= lengths[line++];
    const [a, b] = lines[line];
    const t = along / lengths[line];
    points[i * 2] = a[0] + (b[0] - a[0]) * t + (Math.random() - 0.5) * 2.4;
    points[i * 2 + 1] = a[1] + (b[1] - a[1]) * t + (Math.random() - 0.5) * 2.4;
  }
  return points;
}

// Returns null without WebGL: the page works without particles, it only loses the atmosphere.
// `still` draws a single quiet frame for people who asked for reduced motion.
export function createField(canvas, { still = false } = {}) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);

  const u = {};
  UNIFORMS.forEach((name) => { u[name] = gl.getUniformLocation(program, name); });

  // Density follows the screen, so a phone gets fewer grains rather than a crowded view
  const count = Math.round(Math.min(11000, Math.max(2600, (window.innerWidth * window.innerHeight) / 130)));

  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  const seedAttr = gl.getAttribLocation(program, "aSeed");
  gl.enableVertexAttribArray(seedAttr);
  gl.vertexAttribPointer(seedAttr, 4, gl.FLOAT, false, 0, 0);

  const shapeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(count * 2), gl.DYNAMIC_DRAW);
  const shapeAttr = gl.getAttribLocation(program, "aShape");
  gl.enableVertexAttribArray(shapeAttr);
  gl.vertexAttribPointer(shapeAttr, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  const values = { form: 0, warp: 0, shock: 1, mouse: 0, light: still ? 0.6 : 0 };
  const tweens = new Map();
  const tween = (name, to, ms, ease = EASE.out) => {
    tweens.set(name, { from: values[name], to, ms, ease, start: performance.now() });
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = 0;
  let clock = 0;
  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  const draw = () => {
    gl.uniform1f(u.uT, clock);
    gl.uniform1f(u.uForm, values.form);
    gl.uniform1f(u.uWarp, values.warp);
    gl.uniform1f(u.uShockT, values.shock);
    gl.uniform1f(u.uMouseOn, values.mouse);
    gl.uniform1f(u.uLight, values.light);
    gl.uniform2f(u.uMouse, pointer.x, pointer.y);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, width, height);
    gl.uniform2f(u.uCenter, width / 2, height / 2);
    gl.uniform1f(u.uDpr, dpr);
    if (still) draw();
  };
  resize();
  gl.uniform2f(u.uShock, -9999, -9999);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const onMove = (event) => {
    if (event.pointerType !== "mouse") return;
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    if (pointer.x < -9000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
    if (values.mouse === 0 && !tweens.has("mouse")) tween("mouse", 1, 500);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const off = still ? () => {} : onFrame((_, time) => {
    if (document.hidden) { lastTime = time; return; }
    const dt = Math.min(time - lastTime, 50);
    lastTime = time;
    clock += dt * 0.001;

    const now = performance.now();
    tweens.forEach((t, name) => {
      const p = Math.min((now - t.start) / t.ms, 1);
      values[name] = t.from + (t.to - t.from) * t.ease(p);
      if (p === 1) tweens.delete(name);
    });

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    draw();
  });

  return {
    still,
    count,
    fadeIn(ms = 1200) { tween("light", 1, ms); },
    form(points, ms = 1500) {
      if (still) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, points);
      tween("form", 1, ms, EASE.inOut);
    },
    release(ms = 1500) { tween("form", 0, ms, EASE.inOut); },
    shock(x, y) {
      if (still) return;
      gl.uniform2f(u.uShock, x, y);
      values.shock = 0;
      tween("shock", 1, 1500, (t) => t);
    },
    // Out through the iris: the grains race off the screen and leave it empty for the page
    warp() {
      if (still) return;
      tween("warp", 1, 900, EASE.in);
      tween("light", 0, 1100);
    },
    destroy() {
      off();
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    },
  };
}
