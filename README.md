# XMEMO - Memory Game Plattform

[]!(/app/static/favicon.svg)

🔥 XMEMO is a full stack Application built with SvelteKit, Express and Mongodb 🔥

🏆 Play memory games against other players and compete in the leaderboard.🏆

⚠️ The Platform is not finished and not working today ⚠️



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

The Socket is organized in multiple sub-routes that can be subscribed to:



**subscribeGame**

---

Parameter: &lt;Gameid&gt;

Responses:

```javascript


```



**subscribeQueue**

---

Parameter: -

Responses:

```javascript
[
      {
          "_id": "<queueitemid>",
          "user_id": "<userid>",
          "username": "Trudi",
          "__v": 0
      }
]

```



**subscribeLeaderboard**

---

Parameter: -

Responses:

```javascript


```





Example:

```javascript


```





## Special Configurations

---

### 

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
