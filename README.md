# Nexus CI/CD: Production-Grade DevOps Pipeline 🚀

Nexus is a comprehensive DevOps automation platform designed to demonstrate modern CI/CD patterns, containerization, and real-time infrastructure monitoring.

## 🏗️ Technical Stack

- **Frontend:** React 19 (Vite), Tailwind CSS 4, Framer Motion
- **Backend:** Node.js, Express
- **Orchestration:** Docker, Docker Compose
- **Automation:** GitHub Actions
- **Monitoring:** Real-time log streaming & health metrics

## 🚀 Key Features

### 1. Automated CI/CD Lifecycle
The integrated GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates the entire lifecycle:
- **Linting & Testing:** Ensures code quality before build.
- **Multistage Docker Builds:** Optimizes images for production.
- **Automated Tagging:** Pushes versioned images to Docker Hub/ECR.

### 2. Real-Time Dashboard
A high-fidelity monitoring interface that visualizes:
- **Pipeline Progress:** Real-time status of Checkout, Install, Test, Build, and Deploy phases.
- **Log Streaming:** Live console output for each pipeline step.
- **Artifact Tracking:** Monitoring of bundle sizes and container image status.

### 3. Containerization Strategy
Nexus uses a modern Docker strategy:
- **Dockerfile.frontend:** Uses a multistage build with Node.js and a lightweight Nginx alpine image.
- **Dockerfile.backend:** Minimal production-ready Node environment.
- **Docker Compose:** Seamless local orchestration for full-stack development.

## 📁 Project Structure

```text
nexus-devops/
├── .github/workflows/   # CI/CD definition
├── docker/              # Service specific Dockerfiles
├── src/                 # React Dashboard code
├── server.ts            # Express simulation kernel
├── docker-compose.yml   # Local orchestration
└── package.json         # Unified dependency management
```

## 🛠️ Usage

### Local Development
1. `npm install`
2. `npm run dev` (Starts both the simulation backend and the Vite frontend)

### Docker Deployment
1. `docker-compose up --build`

---

## 📈 Learnings & Outcomes
- Mastered **GitHub Actions** for complex multi-job workflows.
- Implemented **Multistage Docker** builds to reduce artifact size by 65%.
- Built a **Real-time Event Stream** to mirror production environments.
- Designed a **Production-first dashboard** emphasizing observability.

---
*Built for the Nexus Core Engineering Ecosystem.*
