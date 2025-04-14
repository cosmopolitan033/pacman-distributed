#!/bin/bash

# Create monitoring namespace if it doesn't exist
kubectl create namespace monitoring 2>/dev/null || true

# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  -f prometheus-values.yaml

# Install Loki Stack (includes Grafana and Promtail)
helm upgrade --install loki grafana/loki-stack \
  --namespace monitoring \
  -f loki-stack-values.yaml

# Print setup instructions
echo "
Monitoring stack has been installed!

To access Grafana:
1. Make sure grafana.local is in your /etc/hosts file
2. Username: admin
Password: $(kubectl get secret loki-stack-grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 --decode)

Note: Make sure Minikube's ingress addon is enabled (minikube addons enable ingress)
"