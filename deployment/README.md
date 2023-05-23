# Deployment

This document describes how to deploy the App on Kubernetes

Following services will be used:

    - Kube-Flannel as networking service (you could also use calico)
    - Metallb as loadbalancer
    - Traefik as ingress controller

### Requirements

Install and build a K8s Cluster ([instruction](https://github.com/Megakuul/Kubernetes/blob/main/README.md))


#### Install Metallb with helm

Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Install Metallb

```bash
helm repo add metallb https://metallb.github.io/metallb
helm repo update

kubectl create namespace metallb-system
kubectl config set-context --current --namespace metallb-system

helm install metallb metallb/metallb
```

#### Or install Metallb by manifest

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.9/config/manifests/metallb-native.yaml
```

#### Install Traefik Resource Definitions by manifest

```bash
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
```