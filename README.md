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

---

## 📊 Setting up Monitoring

The project includes a complete monitoring stack with Prometheus, Loki, and Grafana for observability.

### Prerequisites
- Minikube running with ingress addon enabled (`minikube addons enable ingress`)
- Helm installed
- kubectl configured to use your minikube cluster

### Installation

1. Add the required hosts entry:
   ```bash
   # Add to /etc/hosts
   127.0.0.1 pacman.local grafana.local
   ```

2. Navigate to the monitoring setup directory and run the setup script:
   ```bash
   cd k8s/monitoring
   ./setup-monitoring.sh
   ```

### Accessing Monitoring Tools

- **Grafana Dashboard**: http://grafana.local
  - Default username: `admin`
  - Password: Get it by running:
    ```bash
    kubectl get secret loki-stack-grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 --decode
    ```

### Included Components

- **Prometheus**: Metrics collection and storage
  - Game performance metrics
  - Kubernetes cluster metrics
  - Node metrics

- **Loki**: Log aggregation
  - Application logs from both frontend and backend
  - Kubernetes system logs

- **Grafana**: Visualization and dashboards
  - Pre-configured dashboards for:
    - Kubernetes cluster overview
    - Node metrics
    - Application metrics
    - Log visualization

### Troubleshooting

If you can't access Grafana:
1. Ensure both ingress controllers are running:
   ```bash
   kubectl get ingress -A
   ```
2. Verify Grafana pod is running:
   ```bash
   kubectl get pods -n monitoring
   ```
3. Check Grafana logs:
   ```bash
   kubectl logs -n monitoring -l app.kubernetes.io/name=grafana
   ```
