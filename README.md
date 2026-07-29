# NeuroForge Nexus 🚀

NeuroForge Nexus is an Agile project management platform featuring Kanban boards, sprint tracking, blocker management, and real-time event-driven notifications powered by Kafka. 

This repository contains the full-stack Dockerized application (Spring Boot + React + Keycloak + Kafka + PostgreSQL).

---

## Prerequisites

*   **Docker Desktop** installed and running
    *   Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
    *   Verify installation: `docker --version` and `docker compose version`
*   Git

---

## 1. Clone the repository

```bash
git clone <repo-url>
cd <repo-folder>
```

---

## 2. Set up `.env`

Create a `.env` file in the project root:

```dotenv
DB_PASSWORD=<choose a password for the local Postgres database>
```

This is used to initialize the local Postgres container on its first run. Any value works — just don't reuse a real/sensitive password, since this is for local development only.

> ⚠️ **Note:** `.env` is gitignored — never commit it to the repository.

---

## 3. Running the stack

**Run the "Start everything" command to boot the application. The remaining commands are for reference only.**

**Start everything (first run / after code changes):**
```bash
docker compose up --build
```

**Start in the background:**
```bash
docker compose up --build -d
```

**Rebuild just the backend after code changes:**
```bash
docker compose up --build backend
```

**View logs for a service:**
```bash
docker compose logs backend -f
```

**Stop everything (keeps data):**
```bash
docker compose down
```

**Stop and wipe all data (fresh start — Postgres, Keycloak, Kafka all reset):**
```bash
docker compose down -v
```
*Use this if you hit a Postgres authentication error after changing `DB_PASSWORD`, or if you want a totally clean slate.*

---

## 4. Accessing services

| Service | URL |
| :--- | :--- |
| **Frontend UI** | http://localhost:5173 |
| **Backend API** | http://localhost:9000 |
| **Keycloak Admin Console** | http://localhost:8080 |


---

## 5. Keycloak Configuration (do only if keycloak does not gets configured automatically)

Open **http://localhost:8080** and do the configurations exactly as shown in the `Keycloak_Configuration_Runbook`.
