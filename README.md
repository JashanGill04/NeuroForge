# NeuroForge Nexus 🚀

NeuroForge Nexus is an Agile project management platform featuring Kanban boards, sprint tracking, blocker management, and real-time event-driven notifications powered by Kafka. 



This repository contains the full-stack Dockerized application (Spring Boot + React + Keycloak + PostgreSQL).

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

Create a `.env` file in the project root (same folder as `docker-compose.yml`). This file is git-ignored — each teammate creates their own, it is never committed:

```dotenv
# Database — use the SAME value you'll put in the GitHub repo's
# DB_PASSWORD secret in step 6, so local and CI stay in sync
DB_PASSWORD=<choose a random password for the local Postgres database>

# App-level encryption for stored GitHub tokens (project_integrations table)
# Any long random string works locally — just keep it the same across
# restarts, or saved GitHub connections will fail to decrypt
APP_ENCRYPTION_SECRET=<any long random string>
APP_ENCRYPTION_SALT=<a random hex string, e.g. from `openssl rand -hex 16`>
```

`DB_PASSWORD` can be any value — just don't reuse a real/sensitive password, since this is for local development only.

> ⚠️ **Note:** `.env` is gitignored — never commit it to the repository. Double-check `.env` is listed in `.gitignore`; if it isn't, add it now, since committing these values would leak them into git history.

---

## 3. Running the stack

**Run the "Start everything" command to boot the application. The remaining commands are for reference only.**

**Start everything (first run / after code changes):**
```bash
docker compose up --build
```

This starts, in order (each service waits on the previous being healthy): `postgres → keycloak → backend → frontend`.

First boot is slow — Keycloak's health check alone can take up to 10 minutes. If the backend fails to start immediately, it's almost always a missing/incomplete `.env` — recheck step 2 before debugging code.

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
| **Keycloak Admin Console** | http://localhost:8080 (login: `admin` / `admin`) |

---

## 5. Keycloak Configuration (do only if keycloak does not gets configured automatically)

Open **http://localhost:8080** and do the configurations exactly as shown in the `Keycloak_Configuration_Runbook`.

---

## 6. Connect a project to GitHub (CI/CD — in-app)

Each project in NeuroForge connects its own GitHub repository from that project's own Settings page. This is what powers the **Trigger build** and **Rollback** buttons on that project's Pipeline dashboard. GitHub credentials are set per-project inside the app, not in `.env`.

1. Open the project → **Settings** tab → **GitHub Repository** panel. *(Only Admins and Project Managers can open/edit this panel.)*
2. Fill in **Repo owner**, **Repo name**, **Branch** (defaults to `main`), and **Workflow file** (defaults to `ci-cd.yml`).
3. Generate a fine-grained Personal Access Token for the repo (you need write access to the repo to do this — ping the repo owner if you don't have it):
   - `github.com/settings/tokens` → Fine-grained tokens → **Generate new token**
   - Repository access → Only select repositories → choose the repo
   - Permissions → Repository permissions → **Actions** → Read and write
   - Generate → copy the token immediately (GitHub only shows it once)
4. Paste the token into the **Personal access token** field and click **Connect repository**. It's encrypted before it's stored and never returned by the API afterward.
5. Once connected, the panel shows a generated **Webhook secret** — copy it, you'll need it in step 7.

---

## 7. Add the matching values on GitHub

On that repo → **Settings → Secrets and variables → Actions**, add exactly these:

**Repository secrets**

| Name | Value |
| :--- | :--- |
| `CONTROLLER_URL` | Full URL of the backend's webhook endpoint, e.g. `https://<your-tunnel>.ngrok-free.app/api/pipelines/webhook`. |
| `DB_PASSWORD` | Same value you used in your local `.env` in step 2 (used by the throwaway Postgres service container the workflow spins up for tests). |
| `WEBHOOK_SECRET` | The value copied from that project's Settings → GitHub Repository panel at the end of step 6. The workflow signs its results with this; the backend rejects the webhook if the signature doesn't match. |

**Repository variables**

| Name | Value |
| :--- | :--- |
| `PROJECT_ID` | The numeric ID of this project inside NeuroForge (visible on the project's Settings → Overview card, or in its URL: `/projects/<id>/...`). The workflow sends this as `projectId` so the build/deploy gets attached to the right project. |
| `DEPLOY_ENV` *(optional)* | Default deployment environment for plain `git push` triggers (e.g. `STAGING`). Falls back to `STAGING` automatically if you don't set it. |

Nothing else needs to be added manually — `GITHUB_TOKEN` is provided automatically by GitHub Actions on every run (used to push images to GHCR), and repo → **Settings → Actions → General → Workflow permissions** should already be set to **Read and write permissions** at the repo level.

> **Known temporary limitation:** nothing is deployed yet, so `CONTROLLER_URL` currently has to point at whichever teammate's local machine is running the backend + an active `ngrok http 9000` tunnel. Webhook delivery only works while that tunnel is running and the secret is current. Coordinate who's "hosting" the controller before testing Trigger/Rollback end-to-end, and update `CONTROLLER_URL` whenever the tunnel restarts (free ngrok URLs rotate).

### Quick troubleshooting checklist

| Symptom | Likely cause |
| :--- | :--- |
| Backend won't start | `.env` missing or incomplete — needs `DB_PASSWORD`, `APP_ENCRYPTION_SECRET`, `APP_ENCRYPTION_SALT` (step 2) |
| Can't save the GitHub Repository form in Settings | Not signed in as Admin/Project Manager, or the token was left blank on first connect |
| Trigger/Rollback button fails silently | No repo connected for this project yet, or the saved PAT is expired / lacks Actions read-and-write permission |
| Webhook POST from Actions gets a 401 | `WEBHOOK_SECRET` on GitHub doesn't match the current value in Settings — someone may have regenerated it without updating GitHub |
| Webhook POST from Actions gets a 404 "no GitHub repository connected" | `PROJECT_ID` variable doesn't match a real project ID, or that project's integration was disconnected |
| Dashboard never updates after a build | `CONTROLLER_URL` tunnel isn't running / has rotated (ngrok free URLs change on restart) |
| `docker compose up` hangs on Keycloak | Normal — its health check window is long (up to 10 min) on first boot |

---

## 8. How to Push Your Code

Direct pushes to the `main` branch are blocked. Please follow these steps to add your changes:

**1. Pull the latest code**
```bash
git checkout main
git pull origin main
```

**2. Create a new branch for your work**
```
git checkout -b feature/your-branch-name
```

**3. Make your changes and test them locally**
```
docker compose up --build
```

**4. Commit and push your branch**
```
git add .
git commit -m "Add your commit message here"
git push origin feature/your-branch-name
```

**5. Open a Pull Request (PR)**
```
Go to the GitHub repository.

Click the Compare & pull request button.

Once the automated checks pass, your code will be merged into main.
```