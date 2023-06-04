# Deployment

This document describes how to deploy the App on Kubernetes

Following services will be used:

    - Kube-Flannel as networking service (you could also use calico)
    - Metallb as loadbalancer
    - Traefik as ingress controller

### Prerequisite

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

### Installation of the system

#### Add Namespace

You can apply the namespace (xmemo-system) by the provided manifest file`

```bash
kubectl apply -f ./namespace.yml
```

#### Install Metallb Loadbalancer

To distribute traffic between different Nodes, we will use Metallb

To set it up, you can apply the metallb.yml Manifest

```bash
kubectl apply -f ./metallb.yml
```

Make sure that the address space from the metallb Manifest is a free and accessible space in your network

#### Setup SSL Certificate

Get a Certificate and a Privatekey in PEM Format and base64 encoded from your DNS provider

Insert the Certificate and the Privatekey in the certificate-secret.yml

Now create the certificate secret by the certificate-secret.yml manifest

```bash
kubectl apply -f ./traefik/certificate-secret.yml
```

#### Install the Traefik Service account

The Traefik Service account is required, that the traefik controller can access the Ingress Ressources from the cluster

The Service account with Role and Role-Assignment can be installed by the provided manifest

```bash
kubectl apply -f ./traefik/service-account.yml
```

#### Install Traefik controller

For the Traefik system we need some components

First we need a Traefik deployment, this will contain the actual Traefik ingress controller

Then we need to create a service to expose the ports that traefik uses

In my case im using two different services, one for the Traefik dashboard (this IP will not be included in a NAT and is only available from the internal network)
and one for the Web and Websecure port (the base exposure ports from Traefik)

You can do this by applying the traefik.yml Manifest

```bash
kubectl apply -f ./traefik/service-account.yml
```

To add additional configurations you can use the args section from the deployment, in the Manifest, for example, there is also an option to redirect http to https

#### Deploy Core application

In the provided Manifest there are two ingress routes to route the traffic to the API and the Frontend Deployment/Service

The traffic gets routed based on the Path Pattern, this is a common practise, because CORS (Cross Origin Resource Sharing) will not block requests to the API.

To deploy it, use following Manifest

```bash
kubectl apply -f ./deployment.yml
```

Make sure that the Domain in the IngressRoute is matching the certificate defined in the certificate-secret

By this the xmemo-app should run on the desired url