import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

// In a CJS bundle (esbuild --format=cjs), __dirname is provided by Node's
// module wrapper. We declare it here so TypeScript accepts it.
declare const __dirname: string;

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Debug route — remove after confirming paths
app.get("/api/debug-paths", (_req, res) => {
  const cwdPath = path.resolve(process.cwd(), "dist", "public");
  const dirPath = path.resolve(__dirname, "..", "dist", "public");
  res.json({
    cwd: process.cwd(),
    __dirname,
    cwdStaticPath: cwdPath,
    cwdIndexExists: fs.existsSync(path.join(cwdPath, "index.html")),
    dirStaticPath: dirPath,
    dirIndexExists: fs.existsSync(path.join(dirPath, "index.html")),
  });
});

// Serve frontend static files
// __dirname = api/ directory in the bundle; go up one level to project root
const staticPath = path.resolve(__dirname, "..", "dist", "public");
app.use(express.static(staticPath));
app.use("*", (_req, res) => {
  res.sendFile(path.resolve(staticPath, "index.html"));
});

export default app;
