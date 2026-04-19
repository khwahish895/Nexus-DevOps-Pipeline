import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Pipeline State
  let pipelineSession = {
    id: "nexus-" + Math.random().toString(36).substring(7),
    status: "idle",
    currentStep: null,
    steps: [
      { id: "checkout", name: "Checkout Code", status: "pending", logs: [] },
      { id: "install", name: "Install Dependencies", status: "pending", logs: [] },
      { id: "test", name: "Unit Tests", status: "pending", logs: [] },
      { id: "build", name: "Build Assets", status: "pending", logs: [] },
      { id: "docker", name: "Containerize", status: "pending", logs: [] },
      { id: "deploy", name: "Cloud Sync", status: "pending", logs: [] },
    ],
    lastRun: null,
  };

  const logMessages: Record<string, string[]> = {
    checkout: ["Fetching refs/heads/main...", "Checking out commit 4f2e91a...", "Done."],
    install: ["npm install --frozen-lockfile", "Added 1243 packages in 4s", "Done."],
    test: ["Running Jest tests...", "PASS src/App.test.tsx", "PASS src/server.test.ts", "Tests passed."],
    build: ["vite build", "Transforming...", "dist/index.html 0.45kB", "dist/assets/index.js 142.12kB", "Build complete."],
    docker: ["docker build -t nexus/app .", "Step 1/8 : FROM node:20", "Successfully built ab4f1291", "Pushed to ECR."],
    deploy: ["Updating ECS service...", "New task definition registered.", "Health check: passed.", "Deployment successful."],
  };

  app.get("/api/pipeline", (req, res) => {
    res.json(pipelineSession);
  });

  app.post("/api/pipeline/trigger", (req, res) => {
    if (pipelineSession.status === "running") {
      return res.status(400).json({ error: "Pipeline already running" });
    }

    pipelineSession.status = "running";
    pipelineSession.steps.forEach(s => {
      s.status = "pending";
      s.logs = [];
    });
    
    // Start simulation
    runSimulation();
    
    res.json({ message: "Pipeline triggered", id: pipelineSession.id });
  });

  async function runSimulation() {
    for (const step of pipelineSession.steps) {
      step.status = "running";
      pipelineSession.currentStep = step.id;
      
      // Simulate logs streaming
      const messages = logMessages[step.id] || ["Processing..."];
      for (const msg of messages) {
        step.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        await new Promise(r => setTimeout(r, 800));
      }
      
      step.status = "completed";
    }
    pipelineSession.status = "success";
    pipelineSession.currentStep = null;
    pipelineSession.lastRun = new Date().toISOString();
  }

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Server running on http://localhost:${PORT}`);
  });
}

startServer();
