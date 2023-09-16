# XMEMO - Memory Game Plattform

![XMEMO Favicon](/app/static/favicon.svg "XMemo Icon")
  
  
🔥 XMEMO is a full stack Application built with SvelteKit, Express and Mongodb 🔥

🏆 Play memory games against other players and compete in the leaderboard.🏆

🚀 Built stateless and designed to scale horizontal in Kubernetes Workloads 🚀
  
## Deployment

For deploying the application on a kubernetes-workload, there is a documentation in the */deployment* folder.

If you consider deploying it in another environment, just make sure that you have a proxy server that routes traffic from "/api" to the backend-instances and from "/" to the frontend-instances, the software is split up into microservices and needs to be carefully deployed.

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



## Configurations

---

### Frontend Debug Mode

**What is it:**

You can enable a "Frontend Debug Mode" (its not labeled like this in the code). This option is set in the frontend to debug the application, it allows you to use insecure websocket connections (localhost) and gives you the option to run the Frontend on another server then the Backend (this can be usefull, to test e.g. the API by connecting to a public API from your localhost Frontend).

**When should it be used:**

Only when you are debugging the software.

**When not to use it:**

In production.

**How to activate it:**

To activate Frontend Debug Mode, set an environment variable on the APP (frontend) instance:

`VITE_API_URL = http://<API_URL>`

Remember that this variable must be present before building the svelte-app and cannot be injected when already running. If you do not set this option, websockets will run on WSS (SSL) and the frontend-app will just send the API-Requests to the URL its self living on (usually you use a proxy that routes traffic to /api to the API-instances and traffic to / to the frontend-instances).

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

  
## API Documentation

---



The API is mainly built for POST requests with REST endpoints, while the Websocket primarily sends data (half duplex).

This is because the POST requests may contain complex data (authentication headers, query, etc.) that is easier to process using the fully standardized REST API.

### REST:

The Response from the API will always contain a `message` object and if it fails a `error` object

**/auth/register**

---

Type: POST

Params: -

Headers:

| Content-Type | application/json |
| --- | --- |

Body Example (JSON):

```javascript
{
    "username": "Kater Karlo",
    "email": "katerkarlo@gmail.com",
    "password": "Oberknacker123"
}

```

Response Example (JSON):

```javascript
{
    "message": "Registered successfully"
}

```



**/auth/login**

---

Type: POST

Params: -

Headers:

| Content-Type | application/json |
| --- | --- |

Body Example (JSON):

```javascript
{
    "username": "Kater Karlo",
    "password": "Oberknacker123"
}

```

Response Example (JSON):

```javascript
{
    "message": "Logged in successfully",
    "token": "Bearer <token>"
}

```



**/auth/profile**

---

Type: GET

Params: -

Headers:

| Authorization | Bearer &lt;token&gt; |
| --- | --- |

Body Example (JSON): -

Response Example (JSON):

```javascript
{
    "username": "Kater Karlo",
    "description": "Ein Kater",
    "title": "Contender",
    "ranking": 69
}

```



**/auth/editprofile**

---

Type: POST

Params: -

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |

Body Example (JSON):

```javascript
{
    "newusername": "Trudi",
    "newdescription": "Freundin von Kater Karlo"
}

```

Response Example (JSON):

```javascript
{
    "message": "User updated successfully"
}

```



**/auth/editpassword**

---

Type: POST

Params: -

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |

Body Example (JSON):

```javascript
{
    "oldpassword": "Oberknacker123",
    "newpassword": "Kochmeisterin123"
}

```

Response Example (JSON):

```javascript
{
    "message": "Password changed successfully"
}

```



**/play/queue**

---

Type: POST

Params: -

Headers:

| Authorization | Bearer &lt;token&gt; |
| --- | --- |

Body Example (JSON): -

Response Example (JSON):

```javascript
{
    "message": "Successfully added player to queue"
}

```



**/play/queue**

---

Type: GET

Params: -

Headers: -

Body Example (JSON): -

Response Example (JSON):

```javascript
{
    "message": "Successfully loaded queue",
    "queue": [
        {
            "_id": "<queueitemid>",
            "user_id": "<userid>",
            "username": "Trudi",
            "__v": 0
        }
    ]
}

```



**/play/move**

---

Type: POST

Params:

| gameid | &lt;gameid&gt; |
| --- | --- |

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |

Body Example (JSON):

```javascript
{
    "discover_id": "<cardid>"
}

```

Response Example (JSON):

```javascript
{
    "message": "Moved successfully"
}

```



### Websocket:

The Socket is organized in multiple sub-routes that can be subscribed to.

To unsubscribe to the events, just send the exact same command but with the prefix `un-`

**subscribeGame (un-)**

---

Parameter: &lt;Gameid&gt;

Response Streams:

| gameUpdate | Gameboard (JSON) |
| --- | --- |
| gameUpdateError | Error message (Text) |



**subscribeQueue (un-)**

---

Parameter: -

Response Streams:

| queueUpdate | Queue (Array&lt;GameQueueObject&gt;) |
| --- | --- |
| queueUpdateError | Error message (String) |



**subscribeLeaderboard (un-)**

---

Parameter: -

Response Streams:

| leaderboardUpdate | Leaderboard (Array&lt;UserObject&gt;) |
| --- | --- |
| leaderboardUpdateError | Error message (String) |



**Example (Svelte)**

---

Connect Socket:

```javascript
import { io, type Socket } from "socket.io-client";

export let socket: Socket;

export const onConnected = (callback: any) => {
  if (!socket) {
    socket = io("http://localhost:3000", { path: "/gamesock" });
  }
  if (socket.connected) {
    callback();
  } else {
    socket.on("connect", callback);
  }
}

```

Subscribe to topics:

```javascript
<script lang="ts">
    import { page } from "$app/stores";
    import { socket, onConnected } from "$lib/socket/socket";

    // Read Gameid from URL Parameter
    const gameid = $page.url.searchParams.get('gameid');

    onConnected(() => {
        socket.emit("subscribeGame", gameid);

        socket.on("gameUpdate", (game) => {
            board = game;
        });
        socket.on("gameUpdateError", (error, exacterror) => {
            errormsg = error;
        })
    });


    let errormsg: any = null;
    let board: any;
</script>

<div class="main-board">
    {#if board && board.cards}
        {#each board.cards as card}
            <h1>{card.discovered}</h1>
        {/each}
    {:else if errormsg!=null}
        <h1 class="err-title">Error 404</h1>
        <p class="err-msg">{errormsg}</p>
    {:else}
        <p class="loading-msg">Loading...</p>
    {/if}
</div>

```
