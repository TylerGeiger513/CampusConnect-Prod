#!/bin/bash
set -e

LOG="/local/logs/startup.log"
exec > >(tee -a "$LOG") 2>&1

echo "🚀 Starting Minikube..."
minikube start --driver=docker

echo "🔌 Enabling Ingress..."
minikube addons enable ingress

echo "🔧 Patching ingress-nginx service to LoadBalancer..."
kubectl patch svc ingress-nginx-controller \
  -n ingress-nginx \
  -p '{"spec": {"type": "LoadBalancer"}}'

echo "⏱ Waiting for ingress-nginx-controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

skaffold run -p prod

echo "🧰 Installing socat"
sudo apt-get install -y socat

echo "🌉 Starting Minikube tunnel..."
sudo nohup minikube tunnel > tunnel.log 2>&1 &

echo "🔁 Starting socat port forward from 80 -> 192.168.49.2:80..."
nohup sudo socat TCP-LISTEN:80,fork TCP:192.168.49.2:80 > socat.log 2>&1 &

echo ""
echo "✅ All done! App should be accessible at: http://$HOSTNAME"
echo ""
