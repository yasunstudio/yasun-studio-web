// UI quality audit: pages × viewports × themes.
// Reports horizontal overflow, clipped content, rendered font sizes, small tap targets and
// axe-core WCAG 2.2 AA violations. Usage: node audit.mjs [--shots]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const SITE = process.env.SITE ?? "http://localhost";
const API = SITE + "/api/v1";
const OUT = new URL("./.output/", import.meta.url).pathname;
const SHOTS = process.argv.includes("--shots");
const AXE = readFileSync(new URL("node_modules/axe-core/axe.min.js", import.meta.url), "utf8");
mkdirSync(`${OUT}shots`, { recursive: true });

const VIEWPORTS = { mobile: { width: 390, height: 844 }, tablet: { width: 820, height: 1180 }, desktop: { width: 1440, height: 900 } };
const THEMES = ["light", "dark"];
const CREDS = {
  learner: ["siti@example.com", process.env.LEARNER_PASSWORD ?? "Pelajar123!"],
  admin: [process.env.ADMIN_EMAIL ?? "admin@yasunstudio.com", process.env.ADMIN_PASSWORD ?? "ChangeMe123!"],
};

const json = (r) => r.json();
const adminTok = (await json(await fetch(`${API}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: CREDS.admin[0], password: CREDS.admin[1] }) }))).access_token;
const adminGet = async (p) => json(await fetch(API + p, { headers: { authorization: `Bearer ${adminTok}` } }));
const py = (await adminGet("/admin/courses?q=Python")).items[0];
const outline = await adminGet(`/admin/courses/${py.id}/curriculum`);
const quiz = outline[0].lessons.find((l) => l.kind === "quiz").slug;
const exercise = outline[0].lessons.find((l) => l.kind === "exercise").slug;

const ONLY = process.env.ONLY; // e.g. ONLY=latihan to audit a subset
const PAGES = {
  guest: ["/", "/kelas", "/kelas/dasar-pemrograman-python", "/artikel", "/artikel/belajar-coding-dari-nol-mulai-dari-mana", "/tentang", "/kontak", "/login", "/daftar", "/halaman-tidak-ada"],
  learner: [
    "/belajar",
    "/belajar/dasar-pemrograman-python",
    "/belajar/dasar-pemrograman-python/instalasi-python-vs-code",
    `/belajar/dasar-pemrograman-python/${quiz}`,
    `/belajar/dasar-pemrograman-python/${exercise}`,
    "/akun",
  ],
  admin: ["/admin", "/admin/kelas", `/admin/kelas/${py.id}`, `/admin/kelas/${py.id}/kurikulum`, "/admin/artikel", "/admin/pesan", "/admin/pelajar", "/admin/pengguna"],
};

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function contextFor(role, theme, vp) {
  const ctx = await browser.newContext({ viewport: vp, colorScheme: theme, reducedMotion: "reduce" });
  if (role !== "guest") {
    const p = await ctx.newPage();
    await p.goto(SITE + "/login");
    await p.fill("#email", CREDS[role][0]);
    await p.fill("#password", CREDS[role][1]);
    await p.getByRole("button", { name: "Masuk" }).click();
    await p.waitForURL(/\/(belajar|admin)$/);
    await p.close();
  }
  return ctx;
}

const report = [];
const fontSizes = new Map();
for (const [role, allPaths] of Object.entries(PAGES)) {
  const paths = ONLY ? allPaths.filter((x) => x.includes(ONLY)) : allPaths;
  if (!paths.length) continue;
  for (const theme of THEMES) {
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      const ctx = await contextFor(role, theme, vp);
      const page = await ctx.newPage();
      for (const path of paths) {
        await page.goto(SITE + path, { waitUntil: "networkidle" });
        await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
        const m = await page.evaluate(() => {
          const doc = document.documentElement;
          const vw = doc.clientWidth;
          const overflowX = doc.scrollWidth - vw;
          const offenders =
            overflowX > 1
              ? [...document.querySelectorAll("body *")]
                  .filter((el) => el.getBoundingClientRect().right > vw + 1 && getComputedStyle(el).position !== "fixed")
                  .slice(0, 3)
                  .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 4).join(".")}`)
              : [];
          const sizes = {};
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const t = walker.currentNode;
            if (!t.textContent.trim()) continue;
            const el = t.parentElement;
            if (!el.getBoundingClientRect().width || getComputedStyle(el).visibility === "hidden") continue;
            if (el.closest(".cm-editor")) continue; // code editor uses its own monospace metrics
            const fs = getComputedStyle(el).fontSize;
            sizes[fs] = (sizes[fs] ?? 0) + 1;
          }
          const small = [...document.querySelectorAll("a[href], button, input, select, textarea, [role=button]")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              if (!r.width || !r.height) return false;
              if (el.matches('input[type="radio"], input[type="checkbox"]') && el.closest("label")) return false; // label is the target
              const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
              return !inline && (r.width < 24 || r.height < 24);
            })
            .slice(0, 4)
            .map((el) => `${el.tagName.toLowerCase()}「${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 20)}」${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`);
          const inScroller = (el) => {
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              const ox = getComputedStyle(p).overflowX;
              if (ox === "auto" || ox === "scroll") return true;
            }
            return false;
          };
          const clipped = [...document.querySelectorAll("body *")]
            .filter((el) => {
              if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
              const r = el.getBoundingClientRect();
              const cs = getComputedStyle(el);
              if (!r.width || cs.visibility === "hidden" || cs.position === "fixed") return false;
              if (el.closest("[aria-hidden=true], [data-slot=sidebar], [data-state=closed]")) return false;
              return (r.right > vw + 1 || r.left < -1) && !inScroller(el);
            })
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}「${el.textContent.trim().slice(0, 24)}」`);
          return { overflowX, offenders, sizes, small, clipped };
        });
        for (const [k, v] of Object.entries(m.sizes)) fontSizes.set(k, (fontSizes.get(k) ?? 0) + v);

        await page.addScriptTag({ content: AXE });
        const axe = await page.evaluate(async () => {
          const r = await window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
            resultTypes: ["violations"],
            exclude: [["iframe"]], // third-party embeds (YouTube) are outside our control
          });
          return r.violations.map((v) => ({ id: v.id, n: v.nodes.length, sample: v.nodes[0]?.target?.join(" ").slice(0, 70), detail: v.nodes[0]?.any?.[0]?.message?.slice(0, 110) }));
        });
        report.push({ role, theme, vp: vpName, path, ...m, axe });
        if (SHOTS) await page.screenshot({ path: `${OUT}shots/${theme}-${vpName}-${role}${path.replace(/[/?=]/g, "_")}.png` });
      }
      await ctx.close();
    }
  }
}
await browser.close();
writeFileSync(`${OUT}audit.json`, JSON.stringify({ report, fontSizes: Object.fromEntries(fontSizes) }, null, 1));

const sizes = [...fontSizes.entries()].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
console.log(`Rendered font sizes (${sizes.length} distinct): ` + sizes.map(([k, v]) => `${k}×${v}`).join(", "));
const over = report.filter((r) => r.overflowX > 1);
console.log(`\nHorizontal overflow: ${over.length}/${report.length} page-views`);
for (const r of over) console.log(`  ${r.vp.padEnd(7)} ${r.theme.padEnd(5)} ${r.path}  +${r.overflowX}px  ${r.offenders.join(" | ")}`);
const clip = report.filter((r) => r.clipped.length);
console.log(`\nClipped content: ${clip.length}/${report.length} page-views`);
for (const r of clip) console.log(`  ${r.vp.padEnd(7)} ${r.theme.padEnd(5)} ${r.path}  ${r.clipped.join(" | ")}`);
const axeAgg = new Map();
for (const r of report)
  for (const v of r.axe) {
    const key = `${v.id} [${r.theme}]`;
    const e = axeAgg.get(key) ?? { count: 0, pages: new Set(), sample: v.sample, detail: v.detail };
    e.count += v.n;
    e.pages.add(r.path);
    axeAgg.set(key, e);
  }
console.log(`\naxe WCAG AA violations: ${axeAgg.size} rule×theme`);
for (const [k, e] of axeAgg) console.log(`  ${k}: ${e.count} nodes on ${e.pages.size} pages — e.g. ${e.sample} — ${e.detail ?? ""} [${[...e.pages].slice(0, 3).join(", ")}]`);
const smallAgg = new Map();
for (const r of report) for (const s of r.small) smallAgg.set(s.replace(/\d+×\d+$/, "").trim(), `${s}  (${r.path})`);
console.log(`\nTap targets < 24px: ${smallAgg.size} distinct`);
for (const s of smallAgg.values()) console.log("  " + s);
process.exitCode = over.length || clip.length || axeAgg.size ? 1 : 0;
