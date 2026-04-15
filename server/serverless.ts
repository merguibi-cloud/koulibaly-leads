import "dotenv/config";
import express from "express";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

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

// Serve frontend static files — process.cwd() is the project root on Vercel
const staticPath = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(staticPath));
app.use("*", (_req, res) => {
  res.sendFile(path.resolve(staticPath, "index.html"));
});

export default app;
