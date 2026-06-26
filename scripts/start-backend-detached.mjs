import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const backendDir = path.join(rootDir, "backend");
const logDir = path.join(rootDir, ".dev-logs");
const npmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
const outPath = path.join(logDir, `backend-detached-${stamp}.out.log`);
const errPath = path.join(logDir, `backend-detached-${stamp}.err.log`);

fs.mkdirSync(logDir, { recursive: true });

const out = fs.createWriteStream(outPath, { flags: "a" });
const err = fs.createWriteStream(errPath, { flags: "a" });

const child = spawn(process.execPath, [npmCli, "run", "dev"], {
  cwd: backendDir,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});

child.stdout.pipe(out);
child.stderr.pipe(err);
child.unref();

child.on("exit", (code, signal) => {
  out.write(`\n[backend-detached-exit] code=${code} signal=${signal}\n`);
  out.end();
  err.end();
});

console.log(JSON.stringify({ pid: child.pid, outPath, errPath }, null, 2));
