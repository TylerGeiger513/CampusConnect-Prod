# Deployment Setup

One of our biggest technical challenges was setting up a development workflow that worked both **locally on Windows** and for **production-like deployments** on CloudLab (Linux). Since Kubernetes behaves differently across platforms, we needed a system that could abstract those differences and streamline the process.

We decided to use [**Minikube**](https://minikube.sigs.k8s.io/docs/), [**Skaffold**](https://skaffold.dev/), and [**Helm**](https://helm.sh/).

These tools allow us to:

- Develop and test services locally with real Kubernetes behavior.
- Dynamically configure services depending on the environment (dev or prod).
- Deploy with fast cached rebuilds.

---

??? skaffold
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
??? skaffold "**Helm** *– Environment Templating*"

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
