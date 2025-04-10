## 🕹️ Pacman Multiplayer Game on Kubernetes

This project is a multiplayer Pacman game with a Flask+Socket.IO backend and a static frontend. It uses Redis for real-time score synchronization and runs entirely on Kubernetes using Minikube.

---

## 🛠️ Requirements

- Docker
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- kubectl
- Node.js (for building frontend)
- Python (for backend if running locally)

---

## 🚀 Quickstart

### 1. Start Minikube with Ingress enabled

```bash
minikube start --driver=docker
minikube addons enable ingress
```

---

### 2. Build Docker Images inside Minikube

```bash
eval $(minikube docker-env)

# Build frontend
docker build -t pacman-frontend ./pacman-js

# Build backend
docker build -t pacman-backend ./multiplayer
```

---

### 3. Deploy to Kubernetes

```bash
kubectl apply -f k8s/
```

> Make sure your `k8s/` folder contains:
> - `backend.yaml`
> - `frontend.yaml`
> - `redis.yaml`
> - `ingress.yaml`

---

### 4. Add `pacman.local` to your `/etc/hosts`

```bash
sudo vim /etc/hosts
```

Add this line:

```ini
127.0.0.1 pacman.local
```

---

### 5. Expose Ingress Controller (if not already)

```bash
kubectl patch svc ingress-nginx-controller \
  -n ingress-nginx \
  -p '{"spec": {"type": "LoadBalancer"}}'
```

Or if it's pending, just run:

```bash
sudo minikube tunnel
```

⚠️ Keep that terminal open if using `minikube tunnel`.

---

### 6. Open in browser

```bash
http://pacman.local
```

---

## 🧱 Folder Structure

```
pacman-distributed/
├── pacman-js/           # Frontend code (Node.js + http-server)
├── multiplayer/         # Backend code (Flask + Socket.IO)
├── k8s/                 # All Kubernetes manifests
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── redis.yaml
│   └── ingress.yaml
```

---

## 📦 Built With

- Flask + Flask-SocketIO
- Redis
- Node.js (Frontend build)
- Kubernetes (Minikube + Ingress NGINX)

---

## 🔧 Useful Commands

```bash
# View logs
kubectl logs -l app=pacman-backend
kubectl logs -l app=pacman-frontend

# View services
kubectl get svc

# View pods
kubectl get pods

# View ingress
kubectl get ingress
```
