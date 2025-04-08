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

echo "📦 Installing Keel separately via Helm..."
sudo -u ccuser -i bash <<EOF
helm repo add keel https://charts.keel.sh
helm repo update
helm upgrade --install keel keel/keel \
  --namespace kube-system \
  --set image.repository=keelhq/keel \
  --set image.tag=latest \
  --set polling.enabled=true \
  --set polling.defaultSchedule="@every 1m" \
  --set basicauth.enabled=true \
  --set basicauth.user=admin \
  --set basicauth.password=password \
  --set service.enabled=true \
  --set service.type=LoadBalancer \
  --set service.externalPort=9300 \
  --set notificationLevel=info \
  --set helmProvider.enabled=true \
  --set XDG_DATA_HOME=/data

EOF

echo "🚀 Deploying app with Skaffold..."
cd /local/repository

echo "current directory: $(pwd)"
echo "current user: $(whoami)"

skaffold deploy -p prod-deploy -v debug 2>&1 | tee -a /local/logs/app.log

HOSTNAME=$(hostname -f)

echo ""
echo "✅ All done! App should be accessible at: http://$HOSTNAME"
echo ""
