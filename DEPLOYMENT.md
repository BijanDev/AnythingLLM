# AnythingLLM Deployment Guide

This guide covers how to deploy AnythingLLM to cloud platforms.

---

## Why Vercel Cannot Host the Full Application

Vercel is designed for static frontends and ephemeral serverless functions. AnythingLLM is a stateful full-stack application that requires:

1. **Persistent Local Storage:** AnythingLLM stores its SQLite database (`anythingllm.db`), uploaded files, vector cache, and embedded LanceDB vector database on local disk. On Vercel, the filesystem is ephemeral and reset between invocations, causing complete data loss.
2. **Persistent WebSockets:** AnythingLLM uses persistent WebSockets (`@mintplex-labs/express-ws`) for streaming agent interactions, which Vercel serverless functions do not support.
3. **Background Microservices:** AnythingLLM includes a dedicated document collector service (`collector/`) for parsing PDFs, docs, OCR, and web scraping that runs continuously.
4. **Execution Timeouts:** Vercel functions time out after 10–60 seconds, which will interrupt document parsing and multi-step LLM agent flows.

---

## Recommended: 1-Click / Git-Push Deployment on Railway

[Railway](https://railway.app) provides the closest developer experience to Vercel (Git-push deployments, automatic HTTPS, custom domains), but with full Docker support and persistent storage volumes.

### Steps to Deploy on Railway:

1. **Push your repository to GitHub.**
2. Go to **[railway.app](https://railway.app)** and log in.
3. Click **"New Project"** -> **"Deploy from GitHub repo"** and select your repository.
4. Railway will automatically detect the root [`Dockerfile`](./Dockerfile) and [`railway.json`](./railway.json).
5. **Attach Persistent Storage (Critical):**
   - Click on your deployed service in the Railway canvas.
   - Go to the **Volumes** tab.
   - Click **"Add Volume"**.
   - Set the mount path to: `/app/server/storage`
6. **Environment Variables:**
   - Under the **Variables** tab, you can configure your optional variables:
     - `SERVER_PORT=3001` (or let Railway set `$PORT` automatically; the server supports both)
     - `STORAGE_DIR=/app/server/storage`
     - Any LLM API keys (e.g. `OPEN_AI_KEY`, etc. if you prefer setting via ENV rather than the UI)
7. **Networking:**
   - Under the **Settings** tab -> **Networking**, click **"Generate Domain"** (or add your custom domain).
8. Visit your generated domain to complete onboarding!

---

## Alternative: Deploy on Render

[Render](https://render.com) supports Docker web services with persistent disks via Blueprint [`render.yaml`](./render.yaml).

### Steps to Deploy on Render:

1. Push your repository to GitHub.
2. Log in to **[render.com](https://render.com)**.
3. Click **"New +"** -> **"Blueprint"** and connect your repository.
4. Render will read [`render.yaml`](./render.yaml) and configure:
   - Docker build from [`Dockerfile`](./Dockerfile)
   - Persistent Disk mounted at `/app/server/storage`
   - Healthcheck on `/api/ping`
5. Click **Apply** to deploy.

---

## Alternative: Deploy on Fly.io

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Authenticate: `fly auth login`
3. Create the persistent volume:
   ```bash
   fly volumes create anythingllm_storage --size 10 --region iad
   ```
4. Deploy using the included [`fly.toml`](./fly.toml):
   ```bash
   fly deploy
   ```

---

## Alternative: Frontend on Vercel (Connecting to External Backend)

If you specifically want your frontend UI served via Vercel's global CDN, you can host the frontend on Vercel and point it to an AnythingLLM backend hosted on Railway, Render, or a VPS:

1. Deploy the backend on Railway or a VPS first to get your backend URL (e.g. `https://my-anythingllm.up.railway.app`).
2. Go to **[vercel.com](https://vercel.com)** -> **"Add New Project"**.
3. Select your repository.
4. Configure Project Settings:
   - **Root Directory:** Click edit and select `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `yarn build`
   - **Output Directory:** `dist`
5. In **Environment Variables**, add:
   - `VITE_API_BASE`: `https://my-anythingllm.up.railway.app/api`
6. Click **Deploy**. The included [`frontend/vercel.json`](./frontend/vercel.json) handles client-side SPA routing.
