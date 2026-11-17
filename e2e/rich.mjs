// Real-browser E2E of rich lessons: highlighting, callouts, notes, quiz, Python & JS exercises, quiz builder.
import { chromium } from "playwright-core";

const SITE = "http://localhost";
const API = SITE + "/api/v1";
const OUT = new URL("./.output/", import.meta.url).pathname;
const results = [];
const check = (name, ok) => results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
const j = (r) => r.json();
const adminTok = (await j(await fetch(`${API}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "admin@yasunstudio.com", password: "ChangeMe123!" }) }))).access_token;
const adminGet = async (p) => j(await fetch(API + p, { headers: { authorization: `Bearer ${adminTok}` } }));

// Fresh learner via the UI flow's API (keeps demo users untouched).
const email = `rich.${Date.now()}@example.com`;
await fetch(`${API}/auth/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ full_name: "Uji Materi", email, password: "Pelajar123!" }) });

const browser = await chromium.launch({ channel: "chrome", headless: true });
process.on("uncaughtException", (e) => { console.log(results.join("\n")); console.error(e); process.exit(1); });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
const p = await ctx.newPage();
const consoleErrors = [];
p.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
await p.goto(`${SITE}/login`);
await p.fill("#email", email);
await p.fill("#password", "Pelajar123!");
await p.getByRole("button", { name: "Masuk" }).click();
await p.waitForURL(/\/belajar$/);
await p.goto(`${SITE}/kelas/dasar-pemrograman-python`);
await p.getByRole("button", { name: "Mulai Belajar Gratis" }).click();
await p.waitForURL(/\/belajar\/dasar-pemrograman-python$/);

// ---------------------------------------------------------------- rich article
await p.goto(`${SITE}/belajar/dasar-pemrograman-python/instalasi-python-vs-code`, { waitUntil: "networkidle" });
check("objectives card", await p.getByText("Setelah materi ini kamu mampu").isVisible());
check("shiki highlighting (dual theme vars)", (await p.locator("pre.shiki span[style*='--shiki-light']").count()) > 0);
check("code block header + copy button", await p.getByRole("button", { name: "Salin kode" }).first().isVisible());
check("callout rendered", (await p.locator("aside[role=note]").count()) > 0);
// Official resources are attached to the first lesson of each chapter.
await p.goto(`${SITE}/belajar/dasar-pemrograman-python/kenapa-belajar-python`, { waitUntil: "networkidle" });
check("resources listed (chapter opener)", await p.getByText("Dokumentasi resmi Python").isVisible());
await p.goto(`${SITE}/belajar/dasar-pemrograman-python/instalasi-python-vs-code`, { waitUntil: "networkidle" });
await p.screenshot({ path: `${OUT}rich-article.png`, fullPage: true });

await p.fill('textarea[id^="note-"]', "Ingat centang Add Python to PATH!");
await p.getByText("Tersimpan").waitFor({ timeout: 8000 });
await p.reload({ waitUntil: "networkidle" });
check("note autosaved & persisted", (await p.inputValue('textarea[id^="note-"]')) === "Ingat centang Add Python to PATH!");

// ------------------------------------------------------------------------- quiz
const course = await adminGet("/admin/courses?q=Python");
const cid = course.items[0].id;
const cur = await adminGet(`/admin/courses/${cid}/curriculum`);
const quizOutline = cur[0].lessons.find((l) => l.kind === "quiz");
const quizFull = (await adminGet(`/admin/lessons/${quizOutline.id}`)).quiz;
await p.goto(`${SITE}/belajar/dasar-pemrograman-python/${quizOutline.slug}`, { waitUntil: "networkidle" });
check("quiz has no manual complete button", (await p.getByRole("button", { name: /Tandai selesai/ }).count()) === 0);
const submit = p.getByRole("button", { name: "Kirim jawaban" });
check("submit disabled until all answered", await submit.isDisabled());
// wrong answers first
for (const q of quizFull.questions) {
  const wrong = q.options.find((o) => !q.answer.includes(o.id));
  await p.locator(`input[name="${q.id}"][value="${wrong.id}"]`).check();
}
await submit.click();
await p.getByText("Belum lulus").waitFor();
check("wrong → not passed + explanations shown", (await p.getByText("Pembahasan").count()) === quizFull.questions.length);
await p.getByRole("button", { name: "Coba lagi" }).click();
for (const q of quizFull.questions) for (const a of q.answer) await p.locator(`input[name="${q.id}"][value="${a}"]`).check();
await p.getByRole("button", { name: "Kirim jawaban" }).click();
await p.getByText("Lulus! Kerja bagus").waitFor();
check("correct → passed", true);
await p.screenshot({ path: `${OUT}rich-quiz.png`, fullPage: true });

// ------------------------------------------------------------- python exercise
async function solveExercise(slug, lessonId, label) {
  const spec = (await adminGet(`/admin/lessons/${lessonId}`)).exercise;
  await p.goto(`${SITE}/belajar/dasar-pemrograman-python/${slug}`.replace("dasar-pemrograman-python", label.course), { waitUntil: "networkidle" });
  await p.locator(".cm-content").first().waitFor();
  // 1) starter code → run → fails
  await p.getByRole("button", { name: "Periksa jawaban" }).click();
  await p.getByText("Output belum sesuai").waitFor({ timeout: 60000 });
  check(`${label.name}: starter code fails`, true);
  // 2) solution typed into the editor → passes
  await p.locator(".cm-content").first().click();
  await p.keyboard.press("ControlOrMeta+a");
  await p.keyboard.press("Delete");
  await p.keyboard.insertText(spec.solution);
  await p.getByRole("button", { name: "Jalankan" }).click();
  await p.waitForFunction((exp) => document.querySelector('pre[aria-live="polite"]')?.textContent?.includes(exp.split("\n")[0]), spec.expected_output, { timeout: 60000 });
  check(`${label.name}: run shows output`, true);
  await p.getByRole("button", { name: "Periksa jawaban" }).click();
  await p.getByText("Output sudah sesuai").waitFor({ timeout: 60000 });
  check(`${label.name}: solution passes`, true);
  const unlocked = await p
    .waitForFunction(() => {
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes("Lihat solusi"));
      return b && !b.disabled;
    }, null, { timeout: 15000 })
    .then(() => true, () => false);
  check(`${label.name}: solution unlocked after passing`, unlocked);
  if (unlocked) {
    await p.getByRole("button", { name: "Lihat solusi" }).click();
    await p.getByRole("button", { name: "Salin ke editor" }).waitFor({ timeout: 15000 });
    check(`${label.name}: solution revealed`, true);
  }
}
const pyEx = cur[0].lessons.find((l) => l.kind === "exercise");
const t0 = Date.now();
await solveExercise(pyEx.slug, pyEx.id, { course: "dasar-pemrograman-python", name: "Python (Pyodide)" });
check(`python first run incl. runtime download: ${((Date.now() - t0) / 1000).toFixed(1)}s`, true);
await p.screenshot({ path: `${OUT}rich-python.png`, fullPage: true });

// infinite loop protection (python)
await p.locator(".cm-content").first().click();
await p.keyboard.press("ControlOrMeta+a");
await p.keyboard.press("Delete");
await p.keyboard.insertText("while True:\n    pass\n");
await p.getByRole("button", { name: "Jalankan" }).click();
await p.getByText(/Eksekusi dihentikan setelah/).waitFor({ timeout: 20000 });
check("infinite loop terminated by timeout", true);

// ------------------------------------------------------------------ JS exercise
await p.goto(`${SITE}/kelas/javascript-modern-untuk-pemula`);
await p.getByRole("button", { name: "Mulai Belajar Gratis" }).click();
await p.waitForURL(/\/belajar\/javascript-modern-untuk-pemula$/);
const jsCid = (await adminGet("/admin/courses?q=JavaScript")).items[0].id;
const jsCur = await adminGet(`/admin/courses/${jsCid}/curriculum`);
const jsEx = jsCur[3].lessons.find((l) => l.kind === "exercise"); // async/await exercise
await solveExercise(jsEx.slug, jsEx.id, { course: "javascript-modern-untuk-pemula", name: "JavaScript async (sandbox)" });

// ------------------------------------------------------------- dark mode check
const dctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "dark", storageState: await ctx.storageState() });
const d = await dctx.newPage();
await d.goto(`${SITE}/belajar/dasar-pemrograman-python/${pyEx.slug}`, { waitUntil: "networkidle" });
await d.locator(".cm-content").first().waitFor();
await d.screenshot({ path: `${OUT}rich-python-dark.png`, fullPage: true });
await d.goto(`${SITE}/belajar/dasar-pemrograman-python/instalasi-python-vs-code`, { waitUntil: "networkidle" });
await d.screenshot({ path: `${OUT}rich-article-dark.png`, fullPage: true });

// -------------------------------------------------------------- admin builder
const a = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await a.goto(`${SITE}/login`);
await a.fill("#email", "admin@yasunstudio.com");
await a.fill("#password", "ChangeMe123!");
await a.getByRole("button", { name: "Masuk" }).click();
await a.waitForURL(/\/admin$/);
await a.goto(`${SITE}/admin/kelas/${cid}/kurikulum/materi/baru?bab=${cur[0].id}`);
await a.fill("#title", "Kuis uji builder");
await a.locator("#kind").click();
await a.getByRole("option", { name: "Kuis" }).click();
await a.getByLabel("Pertanyaan soal 1").fill("Apa fungsi `len()`?");
await a.getByLabel("Teks opsi A").fill("Menghitung panjang");
await a.getByLabel("Teks opsi B").fill("Mencetak teks");
await a.getByRole("button", { name: "Tambah soal" }).click();
await a.getByLabel("Pertanyaan soal 2").fill("Pilih tipe data angka");
await a.getByRole("switch", { name: /Pilihan ganda/ }).nth(1).click();
await a.getByLabel("Teks opsi A").nth(1).fill("int");
await a.getByLabel("Teks opsi B").nth(1).fill("str");
await a.getByRole("button", { name: "Tambah opsi" }).nth(1).click();
await a.getByLabel("Teks opsi C").fill("float");
await a.getByRole("button", { name: "Tandai opsi C sebagai jawaban benar" }).click();
await a.screenshot({ path: `${OUT}rich-admin-builder.png`, fullPage: true });
await a.getByRole("button", { name: "Simpan" }).click();
try {
  await a.waitForURL(/kurikulum\?saved=1/, { timeout: 15000 });
} catch {
  const alerts = await a.locator('[role=status]').allInnerTexts();
  console.log("admin save did not redirect; form messages:", alerts.filter(Boolean).slice(0, 6));
  await a.screenshot({ path: `${OUT}rich-admin-error.png`, fullPage: true });
}
const after = await adminGet(`/admin/courses/${cid}/curriculum`);
const created = after[0].lessons.find((l) => l.title === "Kuis uji builder");
const createdFull = created && (await adminGet(`/admin/lessons/${created.id}`)).quiz;
check(
  "admin quiz builder saves valid quiz",
  createdFull?.questions.length === 2 && createdFull.questions[1].multiple && createdFull.questions[1].answer.join() === "a,c",
);
// clean up
if (created) await fetch(`${API}/admin/lessons/${created.id}`, { method: "DELETE", headers: { authorization: `Bearer ${adminTok}` } });

check(`no console errors (${consoleErrors.length})`, consoleErrors.filter((e) => !/favicon|youtube|ERR_BLOCKED|Permissions policy violation/i.test(e)).length === 0);
if (consoleErrors.length) console.log(consoleErrors.slice(0, 5).join("\n"));
await browser.close();
console.log(results.join("\n"));
process.exitCode = results.some((r) => r.startsWith("FAIL")) ? 1 : 0;
