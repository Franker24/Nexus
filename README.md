# NEXUS — Autonomous AI Operations Platform

> **Autonomous operations. Governed by humans.**

*NEXUS doesn't just make agents autonomous. It makes autonomy governable.*

---

## Overview

**NEXUS** is an autonomous multi-agent operations platform that investigates production incidents, retrieves organizational context, evaluates remediation risk, requests human authorization for high-risk actions, executes approved operational tools, independently verifies recovery, and generates an auditable incident report.

```
                  ┌──────────────────────────────────────────────┐
                  │          NEXUS Mission Control               │
                  │   (React + Vite + SSE Telemetry Stream)      │
                  └──────────────────────┬───────────────────────┘
                                         │ REST / SSE
                  ┌──────────────────────▼───────────────────────┐
                  │          NEXUS Express Server                │
                  │         (Authoritative Backend)              │
                  └──────────────────────┬───────────────────────┘
                                         │
 ┌───────────────────────────────────────┼───────────────────────────────────────┐
 │                                       │                                       │
 ▼                                       ▼                                       ▼
┌───────────────────┐          ┌───────────────────┐           ┌───────────────────┐
│ Orchestrator      │          │ Diagnostic        │           │ Context & Research│
│ Agent             │          │ Specialist        │           │ Agent             │
└─────────┬─────────┘          └─────────┬─────────┘           └─────────┬─────────┘
          │                              │                               │
          └──────────────────────────────┼───────────────────────────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │ Security Agent    │
                               │ & Policy Engine   │
                               └─────────┬─────────┘
                                         │
                       ┌─────────────────┴─────────────────┐
                       │   HUMAN APPROVAL GATEWAY (POL-01)  │
                       │     (AWAITING AUTHORIZATION)      │
                       └─────────────────┬─────────────────┘
                                         │ Approved
                                         ▼
                               ┌───────────────────┐
                               │ Operations Agent  │
                               │ & Tool Gateway    │
                               └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │ Verification      │
                               │ Engine            │
                               └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │ Audit & Reporting │
                               │ Agent             │
                               └───────────────────┘
```

---

## The Problem

As AI agents grow increasingly capable of complex reasoning and direct system tool invocation, enterprise deployment of autonomous agents faces critical hurdles:

* **Unregulated Execution Risk:** Standard agentic loops execute tool invocations directly from LLM output reasoning without intermediate policy evaluation.
* **Lack of Governance:** High-risk operational actions (e.g., restarting core financial infrastructure, flushing production databases, modifying routing rules) cannot safely be left to unconstrained model outputs.
* **Opacity and Non-Auditability:** Production engineering teams require granular, cryptographically traceable audit logs showing *why* an action was proposed, *what* policies evaluated it, *who* approved it, and *how* recovery was verified.

NEXUS bridges this gap by placing a strict **Security Governance Engine & Tool Gateway** between agent reasoning and operational tool execution.

---

## Solution & Architecture

NEXUS operates as an authoritative backend state machine connected to a real-time reactive frontend dashboard via REST APIs and Server-Sent Events (SSE).

### Core Execution Loop

```
  [ Incident Ingestion ]
           │
           ▼
     1. DETECTION           System anomaly triggers operational task & trace ID
           │
           ▼
    2. INVESTIGATION        Diagnostic Specialist queries telemetry & pinpoint root cause
           │
           ▼
       3. CONTEXT           Research Agent searches historical memory & post-mortems
           │
           ▼
      4. GOVERNANCE         Security Agent evaluates action risk & policy rules (POL-01)
           │
           ▼
   =====================  HUMAN APPROVAL GATEWAY  =====================
   5. HUMAN APPROVAL        Workflow pauses until explicit operator authorization
   ====================================================================
           │
           ▼
     6. REMEDIATION         Operations Agent executes approved tool via Tool Gateway
           │
           ▼
    7. VERIFICATION         Verification Engine independently validates telemetry recovery
           │
           ▼
      8. RESOLUTION         Reporting Agent compiles & archives post-mortem audit report
```

---

## Agent Fleet

NEXUS deploys six specialized autonomous agents powered by Gemini AI (`@google/genai`):

| Agent | Role | Key Capabilities | Position in Workflow |
| :--- | :--- | :--- | :--- |
| **Nexus Orchestrator** | `orchestrator` | Task decomposition, multi-agent coordination, workflow state management | Step 1: Objective Planning |
| **Diagnostic Specialist** | `diagnostic` | Anomaly detection, telemetry querying, root-cause identification | Step 2: Telemetry & Root Cause |
| **Context & Research Agent** | `research` | Historical memory search, pattern matching, post-mortem retrieval | Step 3: Historical Knowledge |
| **Governance & Security Agent** | `security` | Policy rule evaluation, risk scoring, human approval gatekeeping | Step 4: Security Policy Gate |
| **System Operations Agent** | `operations` | Tool Gateway execution, infrastructure remediation, lock flushing | Step 6: Authorized Remediation |
| **Audit & Reporting Agent** | `reporting` | Evidence synthesis, post-mortem generation, audit vault archiving | Step 8: Post-Mortem & Audit |

---

## Governance & Human-in-the-Loop

Operational safety in NEXUS is enforced through five decoupled governance services:

1. **Policy Engine (`policyEngine.ts`):** Evaluates agent permissions, tool risk levels (`low`, `medium`, `high`, `critical`), and declarative policy rules (`pol-01`).
2. **Tool Gateway (`toolGateway.ts`):** Centralized execution proxy. Validates inputs, verifies agent permissions, checks policy rules, and strictly verifies active human approval records before executing tools.
3. **Approval Service (`approvalService.ts`):** Manages `ApprovalRequest` records. Pauses the workflow state machine when a `REQUIRES_APPROVAL` decision is issued and resumes execution upon human operator approval.
4. **Verification Service (`verificationService.ts`):** Independently validates that system telemetry has returned to nominal operational baselines after tool execution.
5. **Audit Service (`auditService.ts`):** Records immutable event logs tied to unique `traceId` strings across every stage of the incident lifecycle.

---

## Interactive Demo Scenario: Revenue Operations Incident

NEXUS includes a pre-packaged, deterministic demonstration scenario modeling a critical production incident on a core financial processing pipeline.

### Scenario Baseline
* **Incident:** Payment Ingestion Stall on Revenue Pipeline `#1` (`rev-pipe-prod-01`).
* **Root Cause:** 142 stale Redis lock records accumulated during a webhook traffic spike, trapping worker threads in a deadlock loop.

### Telemetry Progression

| Metric | Incident Active (Degraded) | Post-Remediation (Nominal) |
| :--- | :--- | :--- |
| **Pipeline Status** | `DEGRADED` / `CRITICAL` | `HEALTHY` |
| **Queue Depth** | `18,420` pending transactions | `0 (Draining)` / `120` |
| **Processing Rate** | `0 tx/min` | `4,650 tx/min` |
| **Error Rate** | `87%` failures | `0.1%` (Normal baseline) |
| **Worker Saturation** | `96%` thread exhaustion | `42%` (Nominal) |
| **Active Stale Locks** | `142` stale Redis locks | `0` locks |

### Policy Governance Rule
* **Target Tool:** `restart_revenue_pipeline`
* **Risk Level:** `HIGH`
* **Applicable Policy:** `pol-01` (*Financial Infrastructure Restart Policy*)
* **Enforcement:** Workflow pauses in state `AWAITING_APPROVAL` until the human operator authorizes execution via the Security Gateway interface.

---

## Workflow State Machine

Task execution follows a strict 8-state workflow model managed by `workflowEngine.ts`:

```
   [ CREATED ] ──► [ QUEUED ] ──► [ RUNNING ] ──► [ AWAITING_APPROVAL ]
                                       │                    │
                                       ▼                    ▼
                                  [ FAILED ]           [ EXECUTING ]
                                                            │
                                                            ▼
                                                       [ VERIFYING ]
                                                            │
                                                            ▼
                                                      [ COMPLETED ]
```

* `CREATED`: Task instantiated with unique ID and trace ID.
* `RUNNING`: Multi-agent execution in progress (Diagnostic, Research, Security).
* `AWAITING_APPROVAL`: Workflow paused at Security Gate awaiting human authorization.
* `EXECUTING`: Approval granted; Operations Agent invoking tool through Tool Gateway.
* `VERIFYING`: Independent health verification validating system recovery.
* `COMPLETED`: Recovery verified and post-mortem report archived.
* `FAILED` / `CANCELLED`: Workflow halted due to policy denial, execution error, or human rejection.

---

## Real-Time Architecture (SSE)

NEXUS uses Server-Sent Events (SSE) to push real-time EventBus updates to the frontend without heavy polling.

```
  ┌────────────────────────┐
  │  Server EventBus       │
  │  (Node.js EventEmitter)│
  └───────────┬────────────┘
              │
              ▼
  ┌────────────────────────┐
  │  GET /api/events/stream│ (Global SSE)
  │  GET /api/tasks/:id/   │ (Task-Specific SSE)
  │  events                │
  └───────────┬────────────┘
              │
              ▼
  ┌────────────────────────┐
  │  NexusSSEClient        │ (EventSource Wrapper)
  └───────────┬────────────┘
              │
              ▼
  ┌────────────────────────┐
  │  NexusProvider         │ (React Context Sync)
  └───────────┬────────────┘
              │
              ▼
  ┌────────────────────────┐
  │  Mission Control UI    │
  └────────────────────────┘
```

### EventBus Event Types
`task.created` • `task.started` • `agent.started` • `agent.tool_called` • `agent.finding_created` • `memory.retrieved` • `policy.evaluated` • `approval.requested` • `approval.approved` • `approval.rejected` • `action.executed` • `verification.completed` • `report.generated` • `task.completed` • `task.failed`

---

## API Reference

The backend Express server exposes REST endpoints for state management and demo control:

### System & Health
* `GET /api/health` — System status, agent counters, pending approvals, uptime.

### Agents
* `GET /api/agents` — List all registered agents and current status.
* `GET /api/agents/:id` — Details for a specific agent.

### Tasks & Workflows
* `GET /api/tasks` — List all operational tasks.
* `GET /api/tasks/:id` — Retrieve task details, messages, workflow graph, and approvals.
* `POST /api/tasks` — Create a new task.
* `POST /api/tasks/:id/start` — Start executing a task workflow.

### Real-Time Streaming
* `GET /api/events/stream` — Global SSE stream for real-time telemetry and activity.
* `GET /api/tasks/:id/events` — Task-specific SSE stream.

### Approvals
* `GET /api/approvals` — List approval requests.
* `POST /api/approvals/:id/approve` — Authorize a pending high-risk tool execution.
* `POST /api/approvals/:id/reject` — Reject a pending request and cancel task execution.

### Memory, Tools & Audit
* `GET /api/tools` — List registered operational tools and risk classifications.
* `GET /api/memory?q=:query` — Query semantic and episodic organizational memory.
* `GET /api/audit?limit=100` — Retrieve immutable audit trail events.

### Demo Scenario Controls
* `POST /api/demo/trigger` — Trigger the Revenue Operations Incident scenario.
* `POST /api/demo/reset` — Reset backend state to initial deterministic nominal state.

---

## Tech Stack

### Frontend
* **React 19** & **TypeScript** — Component architecture & strict type safety.
* **Vite 6** — Fast frontend build tool and dev server.
* **Tailwind CSS 4** — Enterprise Monochrome utility styling system.
* **Lucide React** — Minimalist icon system.
* **Motion** — Smooth layout transitions and state animations.

### Backend
* **Node.js** & **Express 4** — Authoritative backend application server.
* **`tsx`** — TypeScript execution engine for server development.
* **`esbuild`** — Production server bundler (outputs CJS `dist/server.cjs`).

### AI & SDK Integration
* **`@google/genai` (v2.4.0)** — Google GenAI SDK driving structured Gemini outputs.
* **Gemini 2.5 Flash (`gemini-2.5-flash`)** — High-speed reasoning and structured JSON synthesis.

---

## AI Model Configuration

NEXUS uses the Google GenAI SDK (`@google/genai`). The target model is configured via environment variables:

```env
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
```

If `GEMINI_API_KEY` is not present, agents automatically fall back to deterministic, structured fallback payloads to guarantee flawless demonstration continuity.

---

## Data & Persistence Model

NEXUS utilizes a server-side **deterministic in-memory repository container** (`NexusMemoryRepositoryContainer`) implemented in `src/repositories/memoryStore.ts`.

### Why Deterministic In-Memory Persistence?
* **Zero External DB Flakiness:** Ensures instant, reliable setup for live hackathon demonstrations without requiring external database migrations or network latency.
* **Reproducible Scenarios:** The `POST /api/demo/reset` endpoint instantly restores backend state to nominal baselines.
* **Interface-Driven Design:** All repositories implement clear interfaces (`IAgentRepository`, `ITaskRepository`, etc.), allowing seamless swapping with Cloud SQL or Firestore for production deployments.

---

## Security Model & Trade-offs

NEXUS implements defense-in-depth governance for AI agents:

1. **Role-Based Agent Permissions:** Agents hold explicit permission sets (e.g., `execute:pipeline-restart`). The Tool Gateway rejects invocations if an agent lacks the required permission.
2. **Policy Evaluation:** All tool requests are evaluated against security policies (`policyEngine.ts`).
3. **Cryptographic Traceability:** Every log entry, approval request, and tool execution is tagged with an immutable `traceId`.
4. **Human-in-the-Loop Binding:** Approvals strictly bind to exact `taskId`, `toolId`, and `approvalId` parameters.

*Note on Prototype Scope:* In this hackathon reference architecture, approval requests are stored in the server memory store. For production enterprise hardening, approval signatures should be cryptographically signed via OIDC/OAuth tokens and persisted in immutable ledger storage.

---

## Project Structure

```
NEXUS/
├── package.json               # Dependencies, Vite build & esbuild server scripts
├── server.ts                  # Express backend entrypoint (REST APIs, SSE, Vite middleware)
├── vite.config.ts             # Vite configuration
├── .env.example               # Environment variable declarations
├── README.md                  # System documentation
│
└── src/
    ├── App.tsx                # Main React application shell & route switcher
    ├── main.tsx               # Client entry point
    ├── index.css              # Global styles with Tailwind CSS
    │
    ├── components/            # UI Components
    │   ├── activity/          # ActivityStream (SSE telemetry feed)
    │   ├── agents/            # AgentFleetGrid & AgentCard
    │   ├── approvals/         # ApprovalCenter & ApprovalCard
    │   ├── audit/             # AuditTrail & TraceExplorerModal
    │   ├── layout/            # TopBar & Navigation
    │   ├── memory/            # MemoryExplorer
    │   ├── mission/           # MissionControl, IncidentPanel, GuidedStoryPipeline, SystemOverview
    │   ├── reports/           # IncidentReportModal
    │   └── workflow/          # WorkflowInspector, WorkflowGraph, WorkflowNodeCard
    │
    ├── context/               # State Management
    │   └── NexusContext.tsx   # Central provider syncing REST & SSE with UI
    │
    ├── repositories/          # Server Repositories
    │   ├── interfaces.ts      # Repository interface definitions
    │   └── memoryStore.ts     # In-memory repository container & seed data
    │
    ├── server/                # Backend Core Engine
    │   ├── agents/            # 6 Specialized Autonomous Agents
    │   │   ├── baseAgent.ts         # Base agent class with GenAI integration
    │   │   ├── orchestratorAgent.ts # Task decomposition agent
    │   │   ├── diagnosticAgent.ts   # Anomaly diagnosis agent
    │   │   ├── researchAgent.ts     # Memory research agent
    │   │   ├── securityAgent.ts     # Governance agent
    │   │   ├── operationsAgent.ts   # Tool execution agent
    │   │   └── reportingAgent.ts    # Post-mortem report agent
    │   │
    │   ├── approvalService.ts # Human approval request manager
    │   ├── auditService.ts    # Trace log recorder
    │   ├── eventBus.ts        # Node.js EventEmitter for SSE broadcasting
    │   ├── memoryService.ts   # Organizational memory search
    │   ├── orchestrator.ts    # Central workflow coordinator
    │   ├── policyEngine.ts    # Security rule evaluator
    │   ├── simulation.ts      # Simulated telemetry environment
    │   ├── toolGateway.ts     # Secure execution proxy
    │   ├── verificationService.ts # Health recovery validator
    │   └── workflowEngine.ts  # Workflow state graph manager
    │
    ├── services/              # Frontend API & SSE Clients
    │   ├── api.ts             # REST API fetch methods
    │   └── sse.ts             # Server-Sent Events client hook
    │
    └── types/                 # TypeScript Interfaces
        └── nexus.ts           # Canonical data models (Agent, Task, Tool, Policy, etc.)
```

---

## Installation & Running Locally

### Prerequisites
* **Node.js**: v18 or higher
* **npm**: v9 or higher

### 1. Clone & Install
```bash
git clone https://github.com/your-org/nexus.git
cd nexus
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Gemini API key inside `.env`:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 4. Production Build & Start
```bash
# Build Vite frontend and bundle server with esbuild
npm run build

# Start production server
npm start
```

---

## Step-by-Step Demo Walkthrough

1. **Open Mission Control:** Navigate to `http://localhost:3000`. Observe the system in `SYSTEM NOMINAL` state.
2. **Reset Demo Environment:** Click **RESET DEMO** in the top navigation bar to ensure clean state.
3. **Trigger Incident:** Click **TRIGGER DEMO INCIDENT** on Mission Control.
4. **Observe Autonomous Investigation:**
   * Watch the **Autonomous Incident Lifecycle Pipeline** progress through `DETECTION`, `INVESTIGATION`, and `CONTEXT`.
   * Observe the Diagnostic Agent identify the 142 stale Redis locks and 18,420 pending queue items.
   * Observe the Research Agent retrieve matching past incident `INC-2025-11-04`.
5. **Observe Security Governance Gate:**
   * The Security Agent evaluates policy `pol-01` on tool `restart_revenue_pipeline`.
   * The workflow pauses in state **`AWAITING AUTHORIZATION`** (Step 5: `HUMAN APPROVAL`).
6. **Authorize Remediation:**
   * Locate the amber Approval Banner on Mission Control or navigate to the **Security Gateway** tab.
   * Review the risk level (`HIGH RISK`) and evidence (`Queue Depth: 18,420`, `Worker Saturation: 96%`).
   * Click **APPROVE ACTION**.
7. **Observe Remediation & Verification:**
   * The System Operations Agent executes `restart_revenue_pipeline` via the Tool Gateway.
   * Telemetry transitions dynamically: Queue depth drains to `0`, processing rate recovers to `4,650 tx/min`, error rate drops to `0.1%`.
   * The Verification Engine validates system recovery (`VERIFICATION COMPLETE`).
8. **Inspect Post-Mortem Report & Audit Trace:**
   * Review the generated Incident Post-Mortem Report on Mission Control.
   * Click any `TRACE: nxs-...` button to open the **Audit Trace Explorer** and inspect the cryptographic event log.

---

## Screenshots

*(Placeholders for application visual previews)*

| Mission Control Dashboard | Security Approval Gateway |
| :---: | :---: |
| ![Mission Control](https://placeholder.com/600x350?text=NEXUS+Mission+Control+Dashboard) | ![Security Gateway](https://placeholder.com/600x350?text=Security+Approval+Gateway) |

| Workflow Inspector Graph | Audit Trace Explorer |
| :---: | :---: |
| ![Workflow Inspector](https://placeholder.com/600x350?text=Workflow+Inspector+Graph) | ![Audit Trace](https://placeholder.com/600x350?text=Audit+Trace+Explorer) |

---

## Visual Design System

NEXUS uses an **Enterprise Monochrome** design system built with Tailwind CSS:
* **High Contrast Neutrals:** Off-white backgrounds (`#F7F7F5`), crisp border divides (`#E5E5E5`), and deep charcoal/black primary accents (`#111111`).
* **Purposeful Status Accents:** Emerald (`#22C55E`) for verified recovery, Amber (`#F59E0B`) for pending human authorization, and Crimson (`#EF4444`) for security rejections/failures.
* **Dense Information Architecture:** Compact monospace font pairings (`font-mono`) for telemetry data, IDs, and trace logs paired with clean sans-serif typography for executive summaries.

---

## Hackathon Context & Future Work

NEXUS was created as an enterprise AI agent governance prototype for Google AI Studio. 

### Future Engineering Roadmap
* **Production Infrastructure Bindings:** Replace simulated pipeline execution with real Kubernetes / Cloud Run SDK connectors.
* **Persistent Database Drivers:** Swap in-memory repositories with Cloud SQL (PostgreSQL) or Firestore drivers using the existing repository interface pattern.
* **Policy-as-Code (OPA / Rego):** Integrate Open Policy Agent for complex declarative security policy logic.
* **Cryptographic Authorization:** Sign human operator approval decisions with WebAuthn / OIDC tokens for tamper-proof audit trails.
* **Distributed Agent Workers:** Decouple agent execution into background Cloud Tasks workers for enterprise horizontal scaling.

---

## License

MIT License — free for open-source reference architectures and agentic governance implementations.
