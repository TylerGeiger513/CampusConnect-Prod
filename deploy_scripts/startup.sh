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
  
echo "🌉 Starting Minikube tunnel..."
echo "password" | sudo -S nohup minikube tunnel > /local/logs/tunnel.log 2>&1 &

echo "🔁 Starting socat port forward from 80 -> 192.168.49.2:80..."
echo "password" | sudo -S nohup socat TCP-LISTEN:80,fork TCP:192.168.49.2:80 > /local/logs/socat.log 2>&1 &

echo "🐳 Configuring Docker to use Minikube's Docker daemon..."
eval $(minikube docker-env)

export TMPDIR=/var/tmp/ccuser-tmp
sudo chown -R ccuser:ccuser /local/
sudo chmod -R 775 /local/

# Run Helm commands as ccuser
sudo -u ccuser -i bash <<EOF
helm repo add keel https://keel-hq.github.io/keel/
helm repo update
cd /local/repository/helm
helm dependency update
EOF

echo "🚀 Deploying app with Skaffold..."
cd /local/repository

echo "current directory: $(pwd)" # debug
echo "current user: $(whoami)"  # debug


skaffold deploy -p prod-deploy -v debug 2>&1 | tee -a /local/logs/app.log


HOSTNAME=$(hostname -f)

echo ""
echo "✅ All done! App should be accessible at: http://$HOSTNAME"
echo ""
