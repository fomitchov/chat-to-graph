import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const URL = process.env.URL ?? "http://127.0.0.1:5173";
const OUT = process.env.OUT ?? "screenshots";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shoot(label, viewport, action) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("[console.error]", msg.text());
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Chat to Graph");
  if (action) await action(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: false });
  console.log("wrote", `${OUT}/${label}.png`);
  await ctx.close();
}

const VP = { width: 1600, height: 1000 };

// 1. Empty state
await shoot("01-empty", VP);

// 2. Demo graph default
await shoot("02-demo", VP, async (page) => {
  await page.click("text=View demo");
  await page.waitForTimeout(800);
});

// 3. Demo with detail panel open
await shoot("03-detail", VP, async (page) => {
  await page.click("text=View demo");
  await page.waitForTimeout(700);
  await page.click("text=Postgres vs ClickHouse?");
  await page.waitForTimeout(400);
});

// 4. Demo with input panel visible
await shoot("04-input", VP, async (page) => {
  await page.click("text=View demo");
  await page.waitForTimeout(500);
  await page.click("text=Edit input");
  await page.click("text=Load sample");
  await page.waitForTimeout(300);
});

await browser.close();
