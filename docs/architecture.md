# Cloud Architecture

Campus Connect is fully containerized and deployed inside a single-node Kubernetes cluster (via Minikube) on CloudLab. All components are managed using Helm and exposed through an NGINX ingress controller.

---

## Application Overview

The app consists of:

- A **React frontend** built and served through NGINX
- A **Node.js/NestJS backend** connected to MongoDB and Redis
- Kubernetes-managed services for container networking
- A Helm-based config injection system for runtime flexibility

!!! example "" 

    ```mermaid
    flowchart LR
      subgraph "Kubernetes Cluster (Minikube)"
        Ingress[NGINX Ingress Controller<br>campus-connect-ingress]
        
        Frontend[Frontend Pod<br>campus-connect-frontend]
        Backend[Backend Pod<br>campus-connect-backend]
        Redis[Redis Pod<br>redis]
        Mongo[MongoDB Pod<br>mongo]

        Ingress -->|HTTP Requests| Frontend
        Ingress -->|/api, /socket.io| Backend

        Backend -->|Sessions| Redis
        Backend -->|Database| Mongo
      end

      User[User Browser<br>cloudlab.hostname] --> Ingress
    ```
---

## Backend Container

The backend is a stateless Node.js API built with NestJS, containerized using a multi-stage Dockerfile.

??? note "Dockerfile (Backend)"
    ```dockerfile
    FROM node:20-alpine AS builder
    WORKDIR /app

    COPY package*.json ./
    RUN npm install --production
    COPY . .

    RUN npm install -g @nestjs/cli

    RUN addgroup -S appgroup && adduser -S appuser -G appgroup
    RUN chown -R appuser:appgroup /app
    USER appuser

    ENV NODE_ENV=production
    EXPOSE ${BACKEND_PORT}

    CMD ["npm", "run", "start"]
    ```

- **Non-root user (`appuser`)** for improved security
- Uses environment variables passed via ConfigMap
- Exposes port `3000` inside the cluster
- All logic resides in memory (stateless), with Redis and Mongo for storage/session

---

## Frontend Container

The frontend is built as a static React site, then served through an NGINX container with custom configuration. This also acts as a **reverse proxy** for backend API and WebSocket traffic.

??? note "Dockerfile (Frontend)"
    ```dockerfile
    # Build React App
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    # Serve with NGINX
    FROM nginx:alpine
    COPY --from=build /app/build /usr/share/nginx/html
    COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
    COPY nginx/nginx.conf /etc/nginx/nginx.conf

    RUN mkdir -p /var/cache/nginx \
     && chown -R nginx:nginx /usr/share/nginx /var/cache/nginx /etc/nginx

    USER nginx
    EXPOSE 80

    CMD ["/bin/sh", "-c", "envsubst '$DOMAIN $NGINX_BACKEND_UPSTREAM' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'pid /tmp/nginx.pid; daemon off;'"]
    ```

- NGINX config is dynamically rendered at runtime using `envsubst`
- Handles frontend routing and API proxying

---

## NGINX 

The frontend container uses a templated NGINX config to:

- Serve static frontend files (`/`)
- Proxy API traffic to the backend (`/api`)
- Proxy WebSocket traffic to backend endpoints (e.g., `/notifications/socket.io`)

??? note "default.conf.template"
    ```nginx
    server {
      listen 80;
      server_name $DOMAIN;

      location /api/ {
        proxy_pass http://$NGINX_BACKEND_UPSTREAM/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
      }

      location /notifications/socket.io {
        proxy_pass http://$NGINX_BACKEND_UPSTREAM/notifications/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
      }

      location /channels/socket.io {
        proxy_pass http://$NGINX_BACKEND_UPSTREAM/channels/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
      }

      location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
      }
    }
    ```

This configuration allows all services to run behind a single domain using paths like:

- `/` → React frontend
- `/api/` → Backend REST API
- `/channels/socket.io` → WebSocket real-time messaging

!!! example "" 
    ```mermaid
    flowchart LR
      User["User Request: (hostname -f)"] --> NGINX_Frontend["NGINX (Frontend Container)"]
      
      NGINX_Frontend -->|"/"| ReactApp["/usr/share/nginx/html"]

      NGINX_Frontend -->|"/api/"| BackendAPI[campus-connect-backend-service:3000]

      NGINX_Frontend -->|"/notifications/socket.io"| WS1[campus-connect-backend-service:3000/notifications/socket.io]
      NGINX_Frontend -->|"/channels/socket.io"| WS2[campus-connect-backend-service:3000/channels/socket.io]
    ```
---

## Runtime Configuration via Helm

At deploy time, values like `DOMAIN` and service hostnames are injected into the container via:

- Helm templates (from `values.yaml`)
- Kubernetes `ConfigMap`s
- Environment variable substitution at container startup (`envsubst`)

This allows switching between environments (local, CloudLab) without rebuilding containers.

---
!!! danger "Security Notes"
    - All containers run as **non-root** users
    - Sensitive values like passwords and encryption keys are currently in plain-text ***(TODO: migrate to Kubernetes/Helm Secrets)***
---
