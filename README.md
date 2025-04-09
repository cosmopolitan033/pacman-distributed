# 🕹️ Multiplayer Pacman Game (Docker + Kubernetes)

This project is a browser-based **Multiplayer Pacman** game using:
- **Frontend**: JavaScript (with `socket.io-client`)
- **Backend**: Python Flask + Socket.IO + Redis
- **Deployment**: Docker Compose (for local dev), Kubernetes with Minikube (for scalable setup)

---

## 📦 Project Structure

```
.
├── docker-compose.yml          # For local development
├── multiplayer/                # Python backend
│   ├── Dockerfile
│   └── main.py
├── pacman-js/                  # Frontend app
│   ├── Dockerfile
│   ├── index.js                # Connects to Socket.IO backend
│   ├── sounds/ etc.
├── k8s/                        # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── redis.yaml
```

---

## 🚀 Run with Docker Compose (Local Dev)

### 🧰 Prerequisites

- Docker Desktop installed

### ▶️ Steps

```bash
# Build and start services
docker compose up --build -d
```

### ✅ Access the Game

Open your browser at:

```
http://localhost:1234
```

All connected players will sync scores via Socket.IO and Redis.

---

## ☸️ Run with Kubernetes (Minikube)

### 🧰 Prerequisites

- Docker
- Minikube
- kubectl

### ▶️ Start Minikube and use its Docker daemon

```bash
minikube start --driver=docker
eval $(minikube docker-env)
```

### 🛠️ Build Docker images inside Minikube

```bash
# From project root
docker build -t pacman-backend -f multiplayer/Dockerfile .
docker build -t pacman-frontend -f pacman-js/Dockerfile .
```

### 📂 Deploy Redis, Backend, and Frontend

```bash
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### 🧪 Check status

```bash
kubectl get pods
kubectl get services
```

Wait until all pods are `Running`.

### 🌐 Access the Game in Browser

```bash
minikube service pacman-frontend
```

This will open a browser window at something like:

```
http://127.0.0.1:31234
```

### ✅ Multiplayer Sync via Redis

The backend is configured to use Redis for:
- Socket.IO pub/sub
- Score storage (via Redis hash `scores`)
  So all players, no matter which backend pod they hit, share the same state.

---

## 🧹 Clean Up

```bash
kubectl delete -f k8s/
minikube stop
```

---

## 🛠 Notes

- `main.py` uses `message_queue='redis://redis:6379'` to enable multi-instance sync.
- `index.js` (frontend) must connect to the backend using:
  ```js
  const socket = io("http://pacman-backend:5050");
  ```
- To enable scaling, you can increase backend replicas in Kubernetes.

---
