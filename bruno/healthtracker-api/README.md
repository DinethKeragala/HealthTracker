# HealthTracker API (Bruno)

This folder contains a Bruno collection for exercising the HealthTracker backend API.

## Quick start

1. Start the backend (local):
   - `cd server`
   - `npm install`
   - `npm run dev`

2. Open this collection in Bruno:
   - Open Bruno → **Open Collection** → select `bruno/healthtracker-api`

3. Pick an environment:
   - `local` → `http://localhost:5000`
   - `docker` → `http://localhost:5002` (matches `docker-compose.yml`)

4. Run requests in order:
   - Auth → Register (optional) / Login
   - Then use Activities / Goals / Profile / Stats

Notes:
- `Login` stores `token` for subsequent authorized requests.
- `Create Activity` stores `activityId` and `Create Goal` stores `goalId`.
