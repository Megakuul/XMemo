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

Function: Registers a user



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

Function: Retrieve jwt token



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
    "userid": "<userid>",
    "email": "katerkarlo@gmail.com",
    "description": "Kater sein Vater",
    "title": "Beginner",
    "ranking": "69",
    "displayedgames": "5",
    "role": "user"
}

```

Function: Get user information



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
    "newdescription": "Freundin von Kater Karlo",
    "newdisplayedgames": "10"
}

```

Response Example (JSON):

```javascript
{
    "message": "User updated successfully"
}

```

Function: Edit user information



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

Function: Update user password



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

Function: Add/Remove player to queue and create game if someone is already waiting



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
            "user_id": "<userid>",
            "username": "Trudi",
            "ranking": "430",
            "title": "Beginner",
        }
    ]
}

```

Function: Get queue information, data is directly returned from mongo-document



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

Function: Discover a card on the gameboard

**/play/takemove**

---

Type: POST

Params:

| gameid | &lt;gameid&gt; |
| --- | --- |

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |


Response Example (JSON):

```javascript
{
    "message": "Move was taken successfully"
}

```

Function: Steal move from enemy, this only works if the move-time is up


**/admin/config**

---

Type: POST

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |


Response Example (JSON):

```javascript
{
    "config": {
        "rankedcardpairs": "20",
        "rankedmovetime": "20",
        "titlemap": {
            "500": "Contender",
            "1000": "Chief",
        };
    }
}

```

Function: Returns the platform configuration object
Requires a user with "admin" role.


**/admin/config**

---

Type: POST

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |


Response Example (JSON):

```javascript
{
    "config": {
        "rankedcardpairs": "20",
        "rankedmovetime": "20",
        "titlemap": {
            "500": "Contender",
            "1000": "Chief",
        };
    }
}

```

Function: Returns the platform configuration object
Requires a user with "admin" role.


### Websocket:

The Socket is organized in multiple sub-routes that can be subscribed to.

##### Public Socket (/api/publicsock)

Query: Nothing

**subscribeGame**

---

Parameter: &lt;Gameid&gt;

Response Streams:

| gameUpdate | Gameboard (JSON) |
| --- | --- |
| gameUpdateError | Error message (Text) |



**subscribeQueue**

---

Parameter: -

Response Streams:

| queueUpdate | Queue (Array&lt;GameQueueObject&gt;) |
| --- | --- |
| queueUpdateError | Error message (String) |



**subscribeLeaderboard**

---

Parameter: -

Response Streams:

| leaderboardUpdate | Leaderboard (Array&lt;UserObject&gt;) |
| --- | --- |
| leaderboardUpdateError | Error message (String) |


##### Auth Socket (/api/authsock)

Query: Bearer &lt;token&gt;


**subscribeCurrentGames (-un)**

---

Parameter: -

Response Streams:

| currentGamesUpdate | Current Games (Array&lt;UserObject&gt;) |
| --- | --- |
| currentGamesUpdateError | Error message (String) |
