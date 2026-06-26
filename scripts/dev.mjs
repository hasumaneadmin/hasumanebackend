import { spawn, execSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const processes = [
  { name: "front", args: ["run", "dev:frontend"] },
  { name: "api", args: ["run", "dev:backend"] },
];

let shuttingDown = false;
const children = [];

function sleep(ms) {
  const sab = new SharedArrayBuffer(4);
  const int32 = new Int32Array(sab);
  Atomics.wait(int32, 0, 0, ms);
}

function ensureServices() {
  console.log("[dev] Launching Docker Compose infrastructure (PostgreSQL & Redis)...");
  try {
    execSync("docker compose up -d", { stdio: "inherit" });
  } catch (error) {
    console.error("[dev] Failed to start Docker Compose. Make sure Docker Desktop is running.", error);
    process.exit(1);
  }

  console.log("[dev] Verifying database readiness (pg_isready)...");
  const maxRetries = 30;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      execSync("docker exec hasumane-postgres pg_isready -U postgres -d hasumane", { stdio: "ignore" });
      console.log("[dev] PostgreSQL is ready and accepting connections.");
      return;
    } catch {
      if (i === maxRetries) {
        console.error("[dev] Error: PostgreSQL did not become ready within 30 seconds.");
        process.exit(1);
      }
      sleep(1000);
    }
  }
}

// Ensure database and infrastructure are ready before launching backend and frontend
ensureServices();


function prefixStream(stream, name, writer) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.length) writer.write(`[${name}] ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (buffer.length) writer.write(`[${name}] ${buffer}\n`);
  });
}

function stopAll(signal = "SIGTERM") {
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

for (const processConfig of processes) {
  const child = spawn(npmCommand, processConfig.args, {
    cwd: process.cwd(),
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push(child);
  prefixStream(child.stdout, processConfig.name, process.stdout);
  prefixStream(child.stderr, processConfig.name, process.stderr);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    stopAll();
    const label = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[dev] ${processConfig.name} exited with ${label}`);
    process.exit(code || 1);
  });
}

process.on("SIGINT", () => {
  stopAll("SIGINT");
  process.exit(130);
});

process.on("SIGTERM", () => {
  stopAll("SIGTERM");
  process.exit(143);
});
