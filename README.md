# 🕹️ Pacman Multiplayer Game on Kubernetes

A real-time multiplayer Pacman game powered by **Flask + Socket.IO**, **Redis**, and a static JavaScript frontend. The entire stack is containerized and deployed on **Kubernetes** using **Minikube**, complete with observability via **Prometheus**, **Loki**, and **Grafana**.

---

## 📦 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Flask + Flask-SocketIO
- **Real-Time Sync**: Redis Pub/Sub
- **Deployment**: Kubernetes (Minikube)
- **Monitoring**: Prometheus, Loki, Grafana
- **Dev Tools**: Docker, kubectl, Helm

---

## 🛠️ Prerequisites

Ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Node.js](https://nodejs.org/en/) (for frontend build)
- [Python](https://www.python.org/) (for local backend testing)
- [Helm](https://helm.sh/) (for monitoring setup)

---

## 🚀 Quickstart

### 1. Start Minikube with Ingress Enabled

```bash
minikube start --driver=docker
minikube addons enable ingress
```

---

### 2. Build Docker Images Inside Minikube

```bash
eval $(minikube docker-env)

# Frontend
docker build -t pacman-frontend ./pacman-js

# Backend
docker build -t pacman-backend ./multiplayer
```

---

### 3. Deploy Kubernetes Resources

```bash
kubectl apply -f k8s/
```

> Ensure `k8s/` includes:
> - `backend-deployment.yaml`
> - `frontend-deployment.yaml`
> - `redis.yaml`
> - `ingress.yaml`

---

### 4. Configure Local DNS

Edit `/etc/hosts`:

```bash
sudo vim /etc/hosts
```

Add:

```
127.0.0.1 pacman.local grafana.local
```

---

### 5. Enable Ingress Exposure

```bash
kubectl patch svc ingress-nginx-controller \
  -n ingress-nginx \
  -p '{"spec": {"type": "LoadBalancer"}}'
```

If still inaccessible, run:

```bash
sudo minikube tunnel
```

> ⚠️ Keep this terminal open.

---

### 6. Access the Game

Open your browser:

```
http://pacman.local
```

---

## 📊 Monitoring & Observability

This project comes with a full observability stack using Prometheus, Loki, and Grafana.

### 🧰 Setup Instructions

1. Ensure `minikube` is running with ingress enabled.
2. Add the following to `/etc/hosts` (if not already):

   ```
   127.0.0.1 grafana.local
   ```

3. Navigate to the monitoring setup directory:

   ```bash
   cd k8s/monitoring
   ./setup-monitoring.sh
   kubectl apply -f grafana-ingress.yaml
   ```

---

### 📈 Access Grafana Dashboard

```
http://grafana.local
```

Default credentials:
- **Username**: `admin`
- **Password**:
  ```bash
  kubectl get secret loki-grafana -n monitoring \
    -o jsonpath="{.data.admin-password}" | base64 --decode
  ```

---

### 📦 Monitoring Components

- **Prometheus**: Collects metrics
    - Kubernetes cluster
    - Node & app performance
- **Loki**: Aggregates logs
    - Frontend + Backend logs
    - System logs
- **Grafana**: Visualization dashboards
    - Cluster overview
    - Application metrics
    - Logs

---

### 🧰 Troubleshooting Grafana Access

```bash
# Check all ingresses
kubectl get ingress -A

# Verify Grafana pod status
kubectl get pods -n monitoring

# Ensure correct Grafana service name
kubectl get svc -n monitoring

# Check Grafana logs
kubectl logs -n monitoring -l app.kubernetes.io/name=grafana

# Run minikube tunnel if access still fails
minikube tunnel
```

---

## 🧱 Project Structure

```
pacman-distributed/
├── docker-compose.yml          # Local dev option (non-K8s)
├── pacman-js/                  # Frontend game code
│   ├── Dockerfile
│   ├── *.js, *.css, *.html
│   └── sounds/
├── multiplayer/                # Flask backend
│   ├── Dockerfile
│   └── main.py
├── k8s/                        # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── redis.yaml
│   ├── ingress.yaml
│   └── monitoring/             # Monitoring setup
│       ├── grafana-ingress.yaml
│       ├── loki-stack-values.yaml
│       ├── prometheus-values.yaml
│       └── setup-monitoring.sh
```

---

## 🧪 Useful Kubernetes Commands

```bash
# Logs
kubectl logs -l app=pacman-backend
kubectl logs -l app=pacman-frontend

# Resources
kubectl get pods
kubectl get svc
kubectl get ingress
```
