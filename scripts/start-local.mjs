import { access, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const standalone = resolve(".next/standalone");
try {
  await access(resolve(standalone, "server.js"));
} catch {
  throw new Error("Chưa có bản standalone. Hãy chạy pnpm build trước pnpm start.");
}
// Next standalone does not copy static/public assets automatically.
await cp(resolve("public"), resolve(standalone, "public"), { recursive: true });
await cp(resolve(".next/static"), resolve(standalone, ".next/static"), { recursive: true });
process.env.PORT ??= "3100";
process.env.HOSTNAME = "127.0.0.1";
await import(pathToFileURL(resolve(standalone, "server.js")).href);
