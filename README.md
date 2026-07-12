# ATLAS

**Civilian Threat Intelligence Platform**

ATLAS uncovers coordinated employment fraud campaigns by reconstructing hidden relationships between recruiters, companies, domains, emails, phone numbers, infrastructure, and behavioral fingerprints.

Instead of asking *"Is this recruiter fake?"*, ATLAS answers *"What hidden fraud network does this recruiter belong to?"*

---

## Mission

Help people detect coordinated recruitment fraud campaigns before they lose money or sensitive information.

The relationship graph is the centerpiece of the experience. Every conclusion is explainable. Every connection has evidence.

---

## Tech Stack

### Backend
- **Python 3.13** — Primary language
- **FastAPI** — Async web framework
- **Celery + Redis** — Asynchronous task queue
- **PostgreSQL** — Relational data (reports, evidence, entities)
- **Neo4j** — Graph database (relationships, campaigns)
- **SQLAlchemy 2** — ORM
- **Pydantic v2** — Data validation

### Frontend
- **React 18 + TypeScript** — UI framework
- **Vite** — Build tool and dev server
- **Sigma.js + graphology** — Graph visualization
- **Tailwind CSS + shadcn/ui** — Styling and components
- **Zustand** — State management
- **React Query** — Server state

### Infrastructure
- **Docker Compose** — Local orchestration
- **Nginx** — Reverse proxy

---

## Repository Structure

atlas/
├── backend/ Python FastAPI application
├── frontend/ React TypeScript application
├── data/ Seed data (JSON source files)
├── seed/ Database seeding scripts
├── scripts/ Development and demo shell scripts
├── docs/ Technical and demo documentation
├── deploy/ Deployment configuration
├── tests/ Backend and frontend tests
├── .env.example Environment variable template
├── docker-compose.yml Local development orchestration
└── README.md This file


For detailed architecture and folder purpose, see `docs/architecture/`.

---

## Getting Started

### Prerequisites

- Docker Desktop 24+
- Node.js 18+
- Python 3.13+
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd atlas

   Copy environment configuration:

Bash

cp .env.example .env
Start all services:

Bash

docker compose up

Access the application:

Frontend: http://localhost:3000
Backend API: http://localhost:8000
Neo4j Browser: http://localhost:7474
API Documentation: http://localhost:8000/docs

Documentation
Architecture: docs/architecture/
API Contract: docs/api/contract.md
Demo Script: docs/demo/script.md
Data Model: docs/data/seed-data-narrative.md
Architecture Decisions: docs/decisions/

Team
Engineer A — Backend Infrastructure Lead
Engineer B — Data & Intelligence Lead
Engineer C — Frontend & Animation Lead
License

Proprietary — Hackathon project.

Save with **Ctrl + S**.

---

## 1.10 — Create `.gitkeep` Placeholder Files

Git doesn't track empty folders. We add tiny `.gitkeep` files so our folder structure is preserved in Git.

Run each of these commands. **You can copy the entire block below and paste it into the terminal all at once** — PowerShell will run them one after another.

```powershell
New-Item -Path "backend\migrations\versions\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\api\routers\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\api\middleware\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\services\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\workers\tasks\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\models\postgres\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\models\schemas\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\database\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "backend\config\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\entry\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\investigation\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\graph\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\campaign\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\evidence\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\report\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\components\shared\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\stores\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\services\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\orchestration\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\hooks\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\types\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\constants\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\mocks\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "frontend\src\styles\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "data\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "seed\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "scripts\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "docs\architecture\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "docs\api\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "docs\demo\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "docs\data\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "docs\decisions\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "deploy\nginx\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "deploy\docker\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "deploy\railway\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "tests\backend\unit\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "tests\backend\integration\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "tests\frontend\components\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path "tests\frontend\stores\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path ".github\ISSUE_TEMPLATE\.gitkeep" -ItemType File -Force | Out-Null
New-Item -Path ".github\workflows\.gitkeep" -ItemType File -Force | Out-Null

The | Out-Null at the end suppresses the noisy output. If everything succeeds, you'll just see the prompt return with no messages. That's normal and expected.