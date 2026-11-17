/* Yasun Studio — JavaScript runner in an isolated Web Worker (no DOM, no cookies).
 * Captures console output and waits for pending timers/promises before reporting "done".
 * The page terminates this worker on timeout (infinite-loop protection).
 */
const fmt = (v) => {
  if (typeof v === "string") return v;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  try {
    return typeof v === "object" ? JSON.stringify(v) : String(v);
  } catch {
    return String(v);
  }
};

let pending = 0;
const _setTimeout = self.setTimeout.bind(self);
const _clearTimeout = self.clearTimeout.bind(self);
const timers = new Set();
self.setTimeout = (fn, ms, ...args) => {
  pending++;
  const id = _setTimeout(() => {
    timers.delete(id);
    pending--;
    try {
      if (typeof fn === "function") fn(...args);
    } catch (err) {
      report("stderr", `Uncaught ${fmt(err)}`);
    }
  }, ms);
  timers.add(id);
  return id;
};
self.clearTimeout = (id) => {
  if (timers.delete(id)) pending--;
  _clearTimeout(id);
};
self.setInterval = () => {
  throw new Error("setInterval tidak didukung di latihan ini — gunakan setTimeout.");
};

let current = null;
const report = (type, text) => current !== null && postMessage({ id: current, type, text: text + "\n" });
console.log = console.info = (...a) => report("stdout", a.map(fmt).join(" "));
console.warn = console.error = (...a) => report("stderr", a.map(fmt).join(" "));

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const idle = () =>
  new Promise((resolve) => {
    const check = () => (pending === 0 ? _setTimeout(() => (pending === 0 ? resolve() : check()), 0) : _setTimeout(check, 10));
    check();
  });

self.addEventListener("unhandledrejection", (e) => {
  report("stderr", `Uncaught (in promise) ${fmt(e.reason)}`);
  e.preventDefault();
});

postMessage({ type: "ready" });

self.onmessage = async ({ data }) => {
  current = data.id;
  let ok = true;
  try {
    await new AsyncFunction(`"use strict";\n${data.code}`)();
    await idle();
  } catch (err) {
    ok = false;
    report("stderr", `Uncaught ${fmt(err)}`);
  }
  postMessage({ id: data.id, type: "done", ok });
  current = null;
};
