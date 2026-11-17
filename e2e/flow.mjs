// Core user journeys in a real browser: sign-up → enrol → learn, account, role guards, admin curriculum.
import { chromium } from "playwright-core";

const SITE = process.env.SITE ?? "http://localhost";
const ADMIN = { email: process.env.ADMIN_EMAIL ?? "admin@yasunstudio.com", password: process.env.ADMIN_PASSWORD ?? "ChangeMe123!" };
const OUT = new URL("./.output/", import.meta.url).pathname;
const email = `budi.${Date.now()}@example.com`;
const results = [];
const check = (name, ok) => results.push(`${ok ? "PASS" : "FAIL"} ${name}`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
process.on("uncaughtException", (e) => {
  console.log(results.join("\n"));
  console.error(e);
  process.exit(1);
});

// ---------------------------------------------------------------- learner
const learner = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
const p = await learner.newPage();

await p.goto(`${SITE}/kelas/dasar-pemrograman-python`);
await p.getByRole("button", { name: "Daftar & Mulai Gratis" }).click();
await p.waitForURL(/\/daftar\?next=/);
check("guest enroll → /daftar with next", true);

// Validation errors must NOT wipe what the user typed (React 19 form reset regression).
await p.fill("#full_name", "Budi Santoso");
await p.fill("#email", email);
await p.fill("#password", "rahasia123");
await p.fill("#password_confirm", "beda12345");
await p.getByRole("button", { name: "Buat Akun Gratis" }).click();
await p.getByText("Konfirmasi kata sandi tidak sama").first().waitFor();
check("validation error keeps typed values", (await p.inputValue("#full_name")) === "Budi Santoso" && (await p.inputValue("#email")) === email);

await p.fill("#password_confirm", "rahasia123");
await p.getByRole("button", { name: "Buat Akun Gratis" }).click();
await p.waitForURL(/\/kelas\/dasar-pemrograman-python$/);
check("register → back to course page", true);

await p.getByRole("button", { name: "Mulai Belajar Gratis" }).click();
await p.waitForURL(/\/belajar\/dasar-pemrograman-python$/);
check("enroll → learner course page", true);

await p.getByRole("link", { name: /^Mulai$/ }).click();
await p.waitForURL(/kenapa-belajar-python/);
await p.getByRole("button", { name: "Tandai selesai & lanjut" }).click();
await p.waitForURL(/instalasi-python-vs-code/);
check("complete → auto-advance to next lesson", true);

await p.goto(`${SITE}/belajar`);
const dash = await p.textContent("body");
check("dashboard shows 5% progress (1 of 20 lessons)", dash.includes("5%"));

await p.goto(`${SITE}/kelas/web-modern-dengan-next-js`);
check("paid course: payment notice", (await p.textContent("body")).includes("Pembayaran online segera hadir"));

await p.goto(`${SITE}/akun`);
await p.fill("#full_name", "Budi S.");
await p.getByRole("button", { name: "Simpan profil" }).click();
await p.getByText("Profil diperbarui.").waitFor();
check("profile update", true);
await p.fill("#current_password", "salah-sekali");
await p.fill("#new_password", "barubaru123");
await p.fill("#new_password_confirm", "barubaru123");
await p.getByRole("button", { name: "Ganti kata sandi" }).click();
await p.getByText("Kata sandi saat ini salah").first().waitFor();
check("wrong current password rejected", true);

await p.goto(`${SITE}/admin`);
check("learner blocked from /admin", p.url().endsWith("/belajar"));

// ------------------------------------------------------------------ admin
const a = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" })).newPage();
await a.goto(`${SITE}/login`);
await a.fill("#email", ADMIN.email);
await a.fill("#password", ADMIN.password);
await a.getByRole("button", { name: "Masuk" }).click();
await a.waitForURL(/\/admin$/);
check("admin login → /admin", true);

// Creating a course with switches left OFF (regression: unchecked switch failed validation).
await a.goto(`${SITE}/admin/kelas/baru`);
await a.fill("#title", "Kelas Uji E2E");
await a.fill("#summary", "Kelas sementara untuk pengujian otomatis.");
await a.fill("#category", "QA");
await a.getByRole("button", { name: "Simpan" }).click();
await a.waitForURL(/\/admin\/kelas\?saved=1/, { timeout: 15000 }).catch(() => {});
check("admin creates course with switches off", a.url().includes("saved=1"));
const row = a.getByRole("row", { name: /Kelas Uji E2E/ });
if (await row.count()) {
  await row.getByRole("button", { name: /Hapus/ }).click();
  await a.getByRole("button", { name: "Hapus", exact: true }).click();
  await a.getByText("Kelas dihapus.").waitFor();
}

await a.goto(`${SITE}/admin/kelas`);
await a.getByRole("link", { name: "Kurikulum Dasar Pemrograman Python" }).click();
await a.waitForURL(/kurikulum$/);
await a.fill('input[name="title"]', "Bab Uji Proyek Akhir");
await a.getByRole("button", { name: "Tambah bab" }).click();
await a.getByText("Bab Uji Proyek Akhir").waitFor();
check("admin adds chapter", true);
check("add-chapter input cleared after success", (await a.inputValue('input[name="title"]')) === "");

await a.getByRole("button", { name: "Naikkan bab" }).last().click();
await a.waitForTimeout(1500);
await a.reload();
const titles = await a.locator("div.bg-muted\\/50 button.font-semibold span").allTextContents();
check(`reorder persisted (${titles.join(" | ")})`, titles[titles.length - 2] === "Bab Uji Proyek Akhir");
await a.screenshot({ path: `${OUT}flow-admin-curriculum.png`, fullPage: true });

const chapter = a.locator("div.bg-muted\\/50", { hasText: "Bab Uji Proyek Akhir" });
await chapter.getByRole("button", { name: /Hapus/ }).click();
await a.getByRole("button", { name: "Hapus", exact: true }).click();
await a.getByText("Bab dan seluruh materinya dihapus.").waitFor();
check("admin deletes chapter", true);

await a.goto(`${SITE}/admin/pelajar`);
check("admin sees new learner", (await a.textContent("body")).includes(email));

await browser.close();
console.log(results.join("\n"));
process.exitCode = results.some((r) => r.startsWith("FAIL")) ? 1 : 0;
