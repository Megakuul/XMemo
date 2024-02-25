# XMEMO - Memory Game Platform

![XMEMO Favicon](/app/static/favicon.svg "XMemo Icon")
  
  
🔥 XMEMO is a full stack Application built with SvelteKit, Express and Mongodb 🔥

🏆 Play memory games against other players and compete in the leaderboard.🏆

🚀 Built stateless and designed to scale horizontal in Kubernetes Workloads 🚀

  
## Deployment

For deploying the application on a kubernetes-workload, there is a documentation in the */deploy* folder.

If you consider deploying it in another environment, just make sure that you have a proxy server that routes traffic from "/api" to the backend-instances and from "/" to the frontend-instances, the software is split up into microservices and needs to be carefully deployed.


## API Documentation

You can find extensive API documentation [here](/api/README.md).



## Configurations

---

### Administrator Role

**What is it:**

There is a administrator role, that allows control over the administrator interface.
- It allows updating users values (u.a. add others to administrator role)
- It allows changing configuration document, which holds configurations of the XMemo platform

**How to activate it:**

When starting the application, xmemo checks if there is already a user with ADMIN role in the database.
If not, it adds a default administrator user. By default, the administrator uses `admin` as username, `password` as password and `admin@xmemo` as mail.
Those credentials can be changed over the API (webinterface) or you can specify the following environment variables to directly set it to custom values:
- DEFAULT_ADMIN_USERNAME = admin
- DEFAULT_ADMIN_PASSWORD = password
- DEFAULT_ADMIN_EMAIL = admin@xmemo

### Frontend Debug Mode

**What is it:**

You can enable a "Frontend Debug Mode" (its not labeled like this in the code). This option is set in the frontend to debug the application, it allows you to use insecure websocket connections (localhost) and gives you the option to run the Frontend on another server then the Backend (this can be usefull, to test e.g. the API by connecting to a public API from your localhost Frontend).

**When should it be used:**

Only when you are debugging the software.

**When not to use it:**

In production.

**How to activate it:**

To activate Frontend Debug Mode, set two environment variables on the APP (frontend) instance:

`VITE_API_URL = http://<API_URL>`
`VITE_DISABLE_SOCKET_TLS=true`

Remember that those variables must be present before building the svelte-app and cannot be injected when already running. If you do not set the "VITE_DISABLE_SOCKET_TLS" option, websockets will run on WSS (SSL).
The "VITE_API_URL" will make the frontend-app send API-Requests to the defined API_URL instead of using its own origin.


To mitigate CORS issues you also have to set the following environment variable on the API (backend) instance:

`ALLOWED_CORS_ORIGIN = "http://<APP_URL>"`

This will set the HTTP "Access-Control-Allow-Origin" response header to the frontend origin.
Without this, the preflight request from the browser will fail and requests to this server will be denied.

### Partial Update Mode

**What is it:**

Partial Update Mode enables the API to incrementally construct the client-side game object. With this mode, the database sends only the changed objects, which are then incorporated into the server&#39;s virtual game board.

**When should it be used:**

Using Partial Update Mode can significantly reduce database lookups and improve performance.

**When not to use it:**

Partial Update Mode is currently in beta and may contain bugs. It also requires slightly more processing power on the API instance. In a horizontally scaled environment, you&#39;ll need to configure the load balancer to use sticky sessions.

**How to activate it:**

To activate Partial Update Mode, set an environment variable on the API instance:

`PARTIAL_UPDATE_MODE = true`

In a horizontally scaled environment, remember to configure the load balancer for sticky sessions.



### OpenID Connect Login

**What is it:**

OpenID Connect (OIDC) is an extended standard for OAuth 2.0.

XMemo can integrate an OpenID Connect provider for user registration. While the actual authorization processes are still handled by the XMemo system, it allows users to register themselves with the integrated provider, thus not having to create a separate XMemo account.


Under the hood, XMemo creates a user account that is linked to the OIDC provider via the subject identifier. The users `jwt` can then be received by authenticating with the OIDC provider instead of using the classical "username+password" authentication.

**How to activate it:**

You can enable the provider by setting the following environment variables on the API instance:
```bash
# Enables OpenID Connect authentication
OIDC_ENABLED = true
# Base URL where the provider can redirect the client to the xmemo API
OIDC_BASEURL = http://localhost:3000
# Base URL where the provider is reachable for the xmemo API
OIDC_ISSUERBASEURL = https://youroidcprovider.com
# OIDC Client ID -> You get this information from the provider
OIDC_CLIENTID = "youroidcappid"
# OIDC Secret -> You get this information from the provider
OIDC_SECRET = "youroidcsecret"
# Route where the xmemo API redirects the user after OIDC login
# If your frontend runs on a different url, you can specify the full frontend path here (e.g. http://localhost:5173/profile)
OIDC_FRONTEND_REDIRECT_ROUTE = "/profile" 
```

The following values `OIDC_ISSUERBASEURL`, `OIDC_CLIENTID`, `OIDC_SECRET` must be obtained from the OIDC provider.

`OIDC_BASEURL` must be set to the base url where the application will be publicly available.

## Known issues

---

### Ranking/Queue/Games not updating in real time (not live)

Possible causes:

**Proxy Server & other Middleware**

*Symptom:*

Websocket fails to connect to the API-Server.

*Cause:*

Proxy or other middleware does not support Websockets or Websockets are not enabled.

NGINX & Traefik Ingress ressources support websockets by default, this is not the case on all proxys/loadbalancers etc.

*Solution:*

Check if all of your middleware does support websockets. Especially check all application-layer middleware, e.g. a network-loadbalancer that operates on layer 4 does not impact websockets, while things like application-gateways or application-loadbalancer must have support for websockets to work. 

When using Cloudflare proxy on free plan, you will also notice some performance losses, as they do not offer websockets on maximum performance.

**Database**

*Symptom:*

Websocket connects and on every reload of the page you will get fresh and correct results, the results are just not rendered in real-time to the page.

*Cause:*

The XMemo-API opens a real-time watcher stream to the Mongodb database, for gameboards such a stream is opened whenever you connect to the websocket, for things like the leaderboard/queue there is a "collective" stream that is opened and made available for every websocket-connection.

Most likely this is caused by either an old version of Mongodb that does not support watchers or because your database is not setup as replication-server (even single-node databases must be setup as replication to support watchers).

*Solution:*

Make sure your mongod version is above version *MongoDB 3.6*.

Make sure your database is setup as replication, you can do this by connecting to the database and running *rs.initiate()*