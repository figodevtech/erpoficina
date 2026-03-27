import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

function readEnvFile() {
  const envPath = path.join(ROOT_DIR, ".env");
  if (!fs.existsSync(envPath)) return {};

  const raw = fs.readFileSync(envPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const parsed = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    parsed[key] = value;
  }

  return parsed;
}

const fileEnv = readEnvFile();

function getEnv(name, fallback = "") {
  return process.env[name] ?? fileEnv[name] ?? fallback;
}

export function loadConfig() {
  return {
    host: getEnv("TEF_AGENT_HOST", "127.0.0.1"),
    port: Number(getEnv("TEF_AGENT_PORT", "18181")),
    provider: getEnv("TEF_AGENT_PROVIDER", "mock"),
    token: getEnv("TEF_AGENT_TOKEN", ""),
    sitef: {
      ip: getEnv("TEF_AGENT_SITEF_IP", ""),
      store: getEnv("TEF_AGENT_SITEF_STORE", ""),
      terminal: getEnv("TEF_AGENT_SITEF_TERMINAL", ""),
      additionalParams: getEnv("TEF_AGENT_SITEF_PARAMS", ""),
    },
  };
}
