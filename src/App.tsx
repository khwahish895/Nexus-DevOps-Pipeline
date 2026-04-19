import React, { useState, useEffect, useRef, ReactNode } from "react";
import { 
  Activity, 
  Terminal as TerminalIcon, 
  Box, 
  Cloud, 
  Settings, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  LayoutDashboard,
  Zap,
  Github,
  HardDrive,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  logs: string[];
}

interface Pipeline {
  id: string;
  status: "idle" | "running" | "success" | "failed";
  currentStep: string | null;
  steps: Step[];
  lastRun: string | null;
}

export default function App() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchPipeline = async () => {
    try {
      const res = await fetch("/api/pipeline");
      const data = await res.json();
      setPipeline(data);
      if (data.currentStep && !selectedStep) {
        setSelectedStep(data.currentStep);
      }
    } catch (err) {
      console.error("Failed to fetch pipeline", err);
    }
  };

  const triggerPipeline = async () => {
    try {
      await fetch("/api/pipeline/trigger", { method: "POST" });
      fetchPipeline();
    } catch (err) {
      console.error("Failed to trigger pipeline", err);
    }
  };

  useEffect(() => {
    fetchPipeline();
    const interval = setInterval(fetchPipeline, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [pipeline?.steps]);

  if (!pipeline) return <div className="min-h-screen flex items-center justify-center font-mono text-tech-ink text-sm tracking-widest animate-pulse">SYSTEM_INITIALIZING...</div>;

  const currentStepData = pipeline.steps.find(s => s.id === (selectedStep || pipeline.currentStep));

  return (
    <div className="flex h-screen bg-tech-bg text-tech-ink font-sans border border-tech-line overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-tech-line flex flex-col">
        <div className="p-6 border-b-2 border-tech-line bg-tech-ink text-tech-bg">
          <h1 className="font-serif italic text-2xl uppercase tracking-tighter">
            Fullstack CI/CD
          </h1>
          <p className="font-mono text-[10px] opacity-60 mt-1 uppercase tracking-widest">
            Control Dashboard v1.0.1
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={14} />} label="Overview" active />
          <NavItem icon={<Activity size={14} />} label="Pipelines" />
          <NavItem icon={<Box size={14} />} label="Registry" />
          <NavItem icon={<Cloud size={14} />} label="Deployments" />
          <NavItem icon={<Settings size={14} />} label="Settings" />
        </nav>

        <div className="p-6 border-t border-tech-line space-y-4">
          <div>
            <span className="section-label">Project Structure</span>
            <div className="font-mono text-[11px] leading-relaxed opacity-80 whitespace-pre">
              📁 project-root/<br />
              &nbsp;├─📁 frontend/<br />
              &nbsp;├─📁 backend/<br />
              &nbsp;├─📁 docker/<br />
              &nbsp;│&nbsp;└─Dockerfile.fe<br />
              &nbsp;├─📁 workflows/<br />
              &nbsp;└─📄 docker-compose.yml
            </div>
          </div>
          <div>
            <span className="section-label">System Metadata</span>
            <div className="font-mono text-[10px] space-y-1 opacity-70">
              <div>REGION: us-east-1</div>
              <div>PROVIDER: AWS</div>
              <div>COMMIT: b8a3f21</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-tech-line px-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif italic text-sm">Deployment Session</span>
            <span className="font-mono text-[10px] opacity-60 uppercase">{pipeline.id}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] opacity-50 uppercase tracking-widest">State:</span>
              <div className="tech-badge">
                {pipeline.status === "running" ? "ACTIVE_PROCESS" : pipeline.status === "idle" ? "READY_SYSTEM" : "DEPLOYED_SUCCESS"}
              </div>
            </div>
            
            <button 
              onClick={triggerPipeline}
              disabled={pipeline.status === "running"}
              className={`font-mono text-sm px-6 py-2 border transition-all ${
                pipeline.status === "running" 
                  ? "border-tech-line/20 text-tech-ink/30 cursor-not-allowed bg-tech-ink/5"
                  : "border-tech-line bg-tech-ink text-tech-bg hover:bg-tech-bg hover:text-tech-ink active:translate-y-px"
              }`}
            >
              {pipeline.status === "running" ? "RUNNING_PIPELINE" : "TRIGGER_BUILD_SEQUENCE"}
            </button>
          </div>
        </header>

        {/* Pipeline Graph Area */}
        <section className="h-24 border-b border-tech-line px-8 flex items-center justify-between relative">
          {pipeline.steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div 
                onClick={() => setSelectedStep(step.id)}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  selectedStep === step.id ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100"
                }`}
              >
                <div className={`w-3 h-3 rounded-full border border-tech-line ${
                  step.status === "completed" ? "bg-tech-success" :
                  step.status === "running" ? "bg-tech-ink animate-pulse" :
                  "bg-transparent"
                }`} />
                <span className="font-mono text-[9px] uppercase tracking-tighter">
                  {step.name}
                </span>
              </div>
              {idx < pipeline.steps.length - 1 && (
                <div className="flex-1 h-px bg-tech-line opacity-20 mx-4" />
              )}
            </React.Fragment>
          ))}
        </section>

        {/* Dashboard Content */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto terminal-scroll">
          {/* Terminal / Logs */}
          <section className="col-span-8 flex flex-col border border-tech-line shadow-[4px_4px_0px_#14141410]">
            <div className="p-3 border-b border-tech-line flex items-center justify-between bg-tech-ink text-tech-bg">
              <div className="flex items-center gap-2">
                <TerminalIcon size={14} />
                <h3 className="font-mono text-xs uppercase tracking-widest">
                  Console_Output::{currentStepData?.id || "nexus"}
                </h3>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-tech-bg opacity-30" />
                <div className="w-1 h-1 bg-tech-bg opacity-30" />
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto terminal-scroll bg-[#1e1e1e] text-[#d1d1d1] leading-relaxed">
              {currentStepData ? (
                <div className="space-y-1">
                  <div className="text-[#9cdcfe] mb-3 uppercase tracking-tighter">Initiating sequence: {currentStepData.name}</div>
                  {currentStepData.logs.map((log, i) => (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={i} 
                      className="border-l border-white/5 pl-3"
                    >
                      <span className="opacity-40 mr-4 inline-block w-4 text-right select-none">{i + 1}</span>
                      <span className={log.includes("PASS") || log.includes("Done") ? "text-[#4ec9b0]" : ""}>
                        {log}
                      </span>
                    </motion.div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20 uppercase tracking-[0.2em] font-bold">
                  System Idle
                </div>
              )}
            </div>
          </section>

          {/* Metrics Sidebar */}
          <section className="col-span-4 flex flex-col gap-8">
            <div className="border border-tech-line p-5 group transition-colors hover:bg-tech-ink hover:text-tech-bg">
              <span className="section-label group-hover:text-tech-bg group-hover:opacity-100">Performance Metrics</span>
              <div className="space-y-6 mt-4">
                <MetricItem label="System Uptime" value="99.98%" trend="+0.01%" />
                <MetricItem label="Avg Execution" value="2m 14s" trend="-5s" />
                <MetricItem label="Build Reliability" value="98.2%" trend="+1.2%" />
                <MetricItem label="Storage Load" value="42.8 GB" trend="+0.4" />
              </div>
            </div>

            <div className="border border-tech-line p-5">
              <span className="section-label">Active Environment</span>
              <div className="mt-4 space-y-3">
                <ArtifactItem label="Frontend" type="Vite/React" value="1.4 MB" />
                <ArtifactItem label="API Layer" type="Express" value="442 MB" />
                <ArtifactItem label="Test Coverage" type="LCOV" value="94.2%" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="h-10 border-t border-tech-line px-8 flex items-center justify-between font-mono text-[10px] bg-tech-ink/5">
          <div className="flex items-center gap-4">
             <span className="text-tech-success italic">"Built a full CI/CD pipeline using GitHub Actions and Docker..."</span>
          </div>
          <div className="opacity-40 uppercase tracking-widest">
            SYstem_Ready // v 1.0.1-STABLE
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 border transition-all group ${
      active ? "bg-tech-ink text-tech-bg border-tech-line" : "border-transparent text-tech-ink/60 hover:text-tech-ink hover:border-tech-line/20"
    }`}>
      <span className="opacity-60 group-hover:opacity-100">{icon}</span>
      <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
      {active && <ArrowRight size={10} className="ml-auto opacity-40" />}
    </div>
  );
}

function MetricItem({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="flex flex-col border-b border-tech-line/10 pb-4 last:border-0 last:pb-0">
      <div className="flex items-end justify-between">
        <span className="font-mono text-[22px] font-bold leading-none">{value}</span>
        <span className={`font-mono text-[10px] ${trend.startsWith("+") ? "text-tech-success" : "text-tech-error opacity-60"}`}>
          {trend}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-widest opacity-60 font-medium mt-1">{label}</span>
    </div>
  );
}

function ArtifactItem({ label, value, type }: { label: string, value: string, type: string }) {
  return (
    <div className="flex items-center justify-between p-2 border-l border-tech-line">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase">{label}</span>
        <span className="text-[9px] font-mono opacity-50 tracking-tighter">{type}</span>
      </div>
      <span className="font-mono text-xs font-bold">{value}</span>
    </div>
  );
}


