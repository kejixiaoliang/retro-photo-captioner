import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = path.join(root, "docs", "superpowers", "artifacts", "editor-quality-upgrade");
const port = 5177;
const url = `http://127.0.0.1:${port}`;

function log(message) {
  console.log(`[verify-browser] ${message}`);
}

function startServer() {
  return spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    cwd: root,
    shell: true,
    stdio: "pipe"
  });
}

async function stopServer(server) {
  if (!server.pid) return;

  if (process.platform === "win32") {
    const stop = new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
        stdio: "ignore"
      });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
    await Promise.race([stop, timeout]);
    return;
  }

  server.kill();
}

function getInstalledBrowserPath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function waitForServer(page) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 1500 });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw new Error(`Vite server did not respond at ${url}`);
}

async function makeSamplePng(page) {
  return page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create sample canvas context");

    const gradient = context.createLinearGradient(0, 0, 900, 600);
    gradient.addColorStop(0, "#d7c6a4");
    gradient.addColorStop(1, "#314f56");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 900, 600);

    context.fillStyle = "#f1e6cf";
    context.fillRect(100, 120, 230, 320);
    context.fillStyle = "#9b2738";
    context.fillRect(520, 160, 210, 260);
    context.fillStyle = "#24353b";
    context.font = "700 48px sans-serif";
    context.fillText("TEST", 360, 320);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
}

async function uploadSample(page) {
  const bytes = await makeSamplePng(page);
  const input = page.locator(".empty-preview input[type=file]");
  await input.setInputFiles({
    name: "browser-verify-sample.png",
    mimeType: "image/png",
    buffer: Buffer.from(bytes)
  });
  await page.locator("canvas.preview-canvas").waitFor({ state: "visible", timeout: 10_000 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas.preview-canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return false;
    const context = canvas.getContext("2d");
    if (!context || canvas.width === 0 || canvas.height === 0) return false;
    const sampleWidth = Math.min(40, canvas.width);
    const sampleHeight = Math.min(40, canvas.height);
    const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    return Array.from(data).some((value) => value !== 0);
  }, { timeout: 10_000 });
}

async function main() {
  const timeout = setTimeout(() => {
    console.error("[verify-browser] timed out after 60 seconds");
    process.exit(1);
  }, 60_000);

  await mkdir(artifactDir, { recursive: true });
  log("starting Vite dev server");
  const server = startServer();
  const executablePath = getInstalledBrowserPath();
  log(`launching browser${executablePath ? ` at ${executablePath}` : ""}`);
  const browser = await chromium.launch(executablePath ? { executablePath } : {});

  try {
    log("checking desktop viewport");
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 980 } });
    await waitForServer(desktop);
    await desktop.screenshot({ path: path.join(artifactDir, "empty.png"), fullPage: true });
    await uploadSample(desktop);
    await desktop.screenshot({ path: path.join(artifactDir, "desktop.png"), fullPage: true });

    log("checking mobile viewport");
    const mobile = await browser.newPage({ viewport: { width: 390, height: 920 } });
    await mobile.goto(url, { waitUntil: "domcontentloaded" });
    await uploadSample(mobile);
    await mobile.screenshot({ path: path.join(artifactDir, "mobile.png"), fullPage: true });
    log("screenshots captured");
  } finally {
    await browser.close();
    clearTimeout(timeout);
    await stopServer(server);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
