/* Yasun Studio — Python runner (Pyodide / WebAssembly) in an isolated Web Worker.
 * Protocol: in  {id, code}
 *           out {type:"ready"} | {id, type:"stdout"|"stderr", text} | {id, type:"done", ok}
 * The page terminates this worker on timeout (infinite-loop protection).
 */
const PYODIDE_VERSION = "0.29.5";
importScripts(`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`);

let current = null;
const ready = loadPyodide({
  indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  stdout: (text) => current !== null && postMessage({ id: current, type: "stdout", text: text + "\n" }),
  stderr: (text) => current !== null && postMessage({ id: current, type: "stderr", text: text + "\n" }),
}).then((py) => {
  py.setStdin({
    stdin: () => {
      throw new Error("input() tidak didukung di latihan ini — gunakan nilai variabel langsung.");
    },
  });
  postMessage({ type: "ready" });
  return py;
});

self.onmessage = async ({ data }) => {
  const py = await ready;
  current = data.id;
  const ns = py.globals.get("dict")(); // fresh namespace on every run
  try {
    await py.runPythonAsync(data.code, { globals: ns });
    postMessage({ id: data.id, type: "done", ok: true });
  } catch (err) {
    // Keep only the useful tail of the traceback (drop Pyodide internals).
    const msg = String(err && err.message ? err.message : err);
    const lines = msg.split("\n");
    const start = lines.findIndex((l) => l.includes('File "<exec>"'));
    const tidy = (start >= 0 ? ["Traceback (most recent call last):", ...lines.slice(start)] : lines).join("\n");
    postMessage({ id: data.id, type: "stderr", text: tidy.trim() + "\n" });
    postMessage({ id: data.id, type: "done", ok: false });
  } finally {
    ns.destroy();
    current = null;
  }
};
