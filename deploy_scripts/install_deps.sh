#!/bin/bash
set -e

LOG="/local/logs/install.log"
exec > >(tee -a "$LOG") 2>&1

USERNAME=ccuser

echo "📦 Installing Docker..."
apt-get update
apt-get install -y docker.io socat curl

echo "👤 Creating non-root user: $USERNAME"
if ! id "$USERNAME" &>/dev/null; then
  adduser --disabled-password --gecos "" $USERNAME
  usermod -aG docker $USERNAME
fi

echo "📦 Installing Minikube..."
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64

echo "📦 Installing Skaffold..."
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
install skaffold /usr/local/bin/ && rm skaffold

echo "📦 Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl

mkdir -p /local/logs
chown -R ccuser:ccuser /local/logs

echo "✅ Dependencies installed and $USERNAME is ready to deploy."
