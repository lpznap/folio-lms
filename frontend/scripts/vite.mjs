// Vite treats # as a URL fragment. A temporary drive keeps source paths intact.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { build, createServer, preview } from "vite";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let mapped = "";
let runRoot = root;
if (process.platform === "win32" && root.includes("#")) {
  for (let n = 90; n >= 68; n--) {
    const drive = String.fromCharCode(n) + ":";
    if (!existsSync(drive + "\\")) {
      execFileSync("subst", [drive, root]);
      mapped = drive;
      runRoot = drive + "\\";
      break;
    }
  }
  if (!mapped)
    throw new Error(
      "No free drive letter. Move the project to a path without #.",
    );
}
let cleaned = false;
function cleanup() {
  if (mapped && !cleaned) {
    cleaned = true;
    try {
      execFileSync("subst", [mapped, "/D"]);
    } catch {}
  }
}
const config = {
  // Inline configuration avoids watching the same config through two drive paths.
  configFile: false,
  root: runRoot,
  resolve: { preserveSymlinks: true },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://localhost:5080" },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    proxy: { "/api": "http://localhost:5080" },
  },
};
process.on("exit", cleanup);
try {
  const mode = process.argv[2] || "dev";
  if (mode === "build") {
    await build(config);
    cleanup();
  } else {
    const server =
      mode === "preview" ? await preview(config) : await createServer(config);
    if (mode !== "preview") await server.listen();
    server.printUrls();
    const close = async () => {
      if ("close" in server) await server.close();
      cleanup();
      process.exit(0);
    };
    process.on("SIGINT", close);
    process.on("SIGTERM", close);
  }
} catch (error) {
  console.error(error);
  cleanup();
  process.exit(1);
}
