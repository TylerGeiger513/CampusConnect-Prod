# CI/CD & Deployment Setup 

# 1. Deployment Setup

One of our biggest technical challenges was setting up a development workflow that worked both **locally on Windows** and for **production-like deployments** on CloudLab (Linux). Since Kubernetes behaves differently across platforms, we needed a system that could abstract those differences and streamline the process.

We decided to use [**Minikube**](https://minikube.sigs.k8s.io/docs/), [**Skaffold**](https://skaffold.dev/), and [**Helm**](https://helm.sh/).

These tools allow us to:

- Develop and test services locally with real Kubernetes behavior.
- Dynamically configure services depending on the environment (dev or prod).
- Deploy with fast cached rebuilds.

---

??? abstract "Skaffold Integrations" 

    Skaffold manages the entire build-deploy process, automatically rebuilding and redeploying services when code changes. This significantly improves our development speed, especially with Node.js on a slow network connection where rebuilding and downloading `node_modules` can take ages.
    
    ```yaml title="skaffold.yaml"
    build:
    artifacts:
        - image: campus-connect-backend
        context: backend
        docker:
            dockerfile: Dockerfile.backend.prod
        - image: campus-connect-frontend
        context: frontend
        docker:
            dockerfile: Dockerfile.frontend.prod
    ```

    Skaffold also supports [**profiles**](https://skaffold.dev/docs/environment/profiles/), which allow us to use different configuration values and behaviors depending on whether we're developing locally or deploying to CloudLab.

    ```yaml title="skaffold.yaml"
    # Development Profile (Local Machine)
    profiles:
    - name: dev
        deploy:
        helm:
            releases:
            - name: campus-connect
                chartPath: ./helm
                valuesFiles:
                - ./helm/values.dev.yaml
                setValueTemplates:
                domain: "localhost"  # Passed to Helm for templating
    # Production Profile (Cloudlab)
    - name: prod
        deploy:
        helm:
            releases:
            - name: campus-connect
                chartPath: ./helm
                valuesFiles:
                - ./helm/values.prod.yaml
                setValueTemplates:
                domain: '{{cmd "hostname" "-f"}}'  # Injects CloudLab hostname at runtime
    ```

    This setup allows us to toggle between environments simply by changing the Skaffold profile in the command line: 

    ```sh 
    skaffold run --p dev 
    skaffold run --p prod
    ```
??? info "**Helm** *– Environment Templating*"

    Helm is used to manage our Kubernetes manifests. Instead of hardcoding values like the `domain` *(used in ingress, nginx, backend CORS settings, etc...)*, we inject them at deploy time using Helm and Skaffold.

    In production, for example, we inject the domain dynamically to resolve to the cloudlab environments hostname using:

    ```yaml title="skaffold.yaml"
    setValueTemplates:
        domain: '{{cmd "hostname" "-f"}}'
    ```
    
    The `domain` value is then injected into multiple resources using Helm Templating:

    ```yaml title="ingress.yaml"
    rules:
      - host: "{{ .Values.domain }}"
    ```

    ```yaml title="configmap.yaml"
    data:
      DOMAIN: "{{ .Values.domain }}"
      CORS_ORIGIN: "{{ .Values.domain }}"
    ```

    And finally used in our nginx config template, and backend CORS settings:

    ```nginx title="default.conf.template"
    server {
        listen 80;
        server_name $DOMAIN;
    }
    ```

---

# 2. CI/CD Pipeline

Currently, our CI/CD setup is functional but partially manual. Code changes are pushed to GitHub, and a webhook triggers a sync with CloudLab. However, a user must still log into CloudLab and instantiate the deployment manually.

Our goal is to evolve this into a fully automated pipeline using GitHub Actions and the CloudLab PortalAPI.

---

## A. Continuous Integration (CI)
??? note "Current Webhook-Based Workflow"

    The current workflow uses a GitHub webhook that sends a `POST` request to a CloudLab endpoint when code is pushed. That endpoint simply pulls the latest changes — **but does not instantiate the deployment automatically**.

    ```mermaid
    flowchart LR
        A[Push to GitHub] --> B[GitHub Webhook Fires]
        B --> C[CloudLab Webhook Endpoint]
        C --> D[CloudLab Repository Updates]
        D --> E["Manual Profile Instantiation (User)"]
        E --> F[Run Startup Scripts]
    ```

??? Note "Future CI Plans:"

    We are planning to integrate GitHub Actions with the CloudLab PortalAPI. On push this would:

    - Automatically instantiate the profile
    - SSH into the node
    - Tail deployment logs 
    - Optionally run e2e tests after deploy (if we have time)

    ```mermaid
    flowchart LR
        A[Code Push to GitHub] --> B[GitHub Action Triggered]
        B --> C[Call CloudLab PortalAPI]
        C --> D[Instantiate Profile]
        D --> E[SSH into Node + Run Startup Script]
        E --> F[Live Deployment Logs + Health Checks]
        F --> G["Run Tests (optional)"]
    ```

## B. Continous Deployment (CD)

??? "1. Instantiation"

    Once our project is instantiated, `profile.py` starts the deployment process with this line:

    ```python title="profile.py"
    node.addService(pg.Execute(
        shell="sh",
        command=(
            "sudo bash /local/repository/deploy_scripts/install_deps.sh "
            "&& sudo -u ccuser -i bash /local/repository/deploy_scripts/startup.sh"
        )
    ))
    ```

    This does two things:

    1. **Runs `install_deps.sh` as root** – installs Docker, Minikube, Skaffold, kubectl, and Helm.
    2. **Runs `startup.sh` as a non-root user (`ccuser`)** – starts Minikube, enables ingress, patches the controller, sets up port forwarding, and deploys via Skaffold.

    !!! danger "Security Concerns"

        - **Root access** is used only where necessary (system-level package installs, permissions).

        - The rest of the app lifecycle runs under a **limited, non-root user** for security and isolation.

??? note "2. install_deps.sh"

    This script installs dependencies like Docker, Minikube, Skaffold, and Helm, and provisions the non-root deployment user: `ccuser`

    ```bash title="install_deps.sh"
    USERNAME=ccuser

    if ! id "$USERNAME" &>/dev/null; then
      adduser --disabled-password --gecos "" $USERNAME
      usermod -aG docker $USERNAME
      usermod -aG sudo $USERNAME
      echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME
      chmod 0440 /etc/sudoers.d/$USERNAME
    fi
    ```

    - `ccuser` is created 
    - The user is added to the **`docker` group** so it can run Docker containers.
    - All non-critical operations like starting Minikube, forwarding ports, and deploying with Skaffold are executed under this non-root user.
    - Logs are outputed to `/local/logs/install.log`

??? note "3. startup.sh"

    This script is run as the non-root user `ccuser` and handles cluster initialization, ingress setup, port forwarding, and application deployment.

    ### 1. Start Minikube

    ```bash
    minikube start --driver=docker
    ```

    ### 2. Enable the NGINX Ingress Addon

    ```bash
    minikube addons enable ingress
    ```

    This installs the NGINX Ingress Controller, which acts as a **reverse proxy** that routes incoming HTTP(S) requests to the  Kubernetes frontend service. 

    ### 3. Patch the Ingress Controller to `LoadBalancer`

    ```bash
    kubectl patch svc ingress-nginx-controller \
      -n ingress-nginx \
      -p '{"spec": {"type": "LoadBalancer"}}'
    ```

    By default, Minikube deploys the ingress controller as a `ClusterIP` service, which means it’s only reachable from **inside the cluster**. This patch changes it to `LoadBalancer`, allowing traffic to be routed from **outside** the cluster.

    ### 4. Start the Minikube Tunnel

    ```bash
    echo "password" | sudo -S nohup minikube tunnel > /local/logs/tunnel.log 2>&1 &
    ```

    This command starts a tunnel background process that makes LoadBalancer services accessible from outside the cluster.

    ### 5. Use socat to Forward Port 80

    ```bash
    echo "password" | sudo -S nohup socat TCP-LISTEN:80,fork TCP:192.168.49.2:80 > /local/logs/socat.log 2>&1 &
    ```

    Even with the tunnel running, CloudLab doesn’t let us bind directly to port 80 on the public network interface. To get around this, we use socat, to listen on port 80 and forward incoming traffic to the internal `Minikube ingress IP`. This makes the app accessible from a browser using the node’s hostname, even though it’s running inside Minikube.

    This makes the app reachable from:

    ```
    http://$(hostname -f)
    ```

    ### 6. Deploy the Application with Skaffold

    ```bash
    skaffold run -p prod
    ```

    This command deploys the app using the production profile. The `prod` profile dynamically injects the correct domain as described above in `Skaffold`.

    ```yaml
    setValueTemplates:
      domain: '{{cmd "hostname" "-f"}}'
    ```

    That hostname is then used by the ingress configuration, nginx templates, and backend CORS logic etc...

    When the startup process is finished - the script prints:

    ```bash
    echo "App should be accessible at: http://$(hostname -f)"
    ```

    