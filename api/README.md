# API Documentation

---



The API is mainly built for POST requests with REST endpoints, while the Websocket primarily sends data (half duplex).

This is because the POST requests may contain complex data (authentication headers, query, etc.) that is easier to process using the fully standardized REST API.

## REST:

The Response from the API will usually contain a `message` object and if it fails a `error` object

#### Authentication Token:

Authenticated REST API calls, read the JWT authentication token from a *httpOnly* cookie named "auth" when called from the frontend webapp.
For external API consumers, however, you can also specify the token in the authorization header (like shown below).

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

Response Example:

- Cookie containing "<jwt>" is added to the cookie storage and flaged with "httpOnly"

Function: Retrieve jwt token



**/auth/oidc/login**

---

Type: GET

Params: -

Response Example:

- Cookie containing "Bearer <jwt>" is added
- Redirect to "/profile" route

Error message (if any) is added to the redirect route with a query param "error" e.g. "/profile?error=Failed to login"

Important: When using this route with the Browsers fetch API, it may fail due to CORS policies. In prod I recommend to just fully redirect the user to this route.

This endpoint is different to the others, because oidc works with redirects to the OAuth provider, which is blocked by CORS when using the Browser fetch API.

Function: Retrieve jwt token from OIDC provider



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



**/auth/getsockettoken**

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
    "token": "<socketjwt>"
}

```

Function: Get Auth Socket token from regular token



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


**/auth/logout**

---

Type: GET

Params: -

Response Example (JSON):

```javascript
{
    "message": "Logged out successfully"
}

```

Function: Logout user by removing the httpOnly cookie used to store the JWT


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
    "rankedcardpairs": "20",
    "rankedmovetime": "20",
    "titlemap": {
        "500": "Contender",
        "1000": "Chief",
    }
}

```

Function: Returns the platform configuration object
Requires a user with "admin" or "maintainer" role.


**/admin/editconfig**

---

Type: POST

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |

Body Example (JSON):

```javascript
{
    "newrankedcardpairs": "20",
    "newrankedmovetime": "15",
    "newtitlemap": {
        "500": "Contender",
        "1000": "Chief",
    }
}

```

Response Example (JSON):

```javascript
{
    "message": "Successfully updated config"
}

```

Function: Returns the platform configuration object
Requires a user with "admin" or "maintainer" role.


**/admin/user**

---

Type: GET

Param: username (?username=Kater Karlo)

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |

Response Example (JSON):

```javascript
{
    "user": {
        "userid": "<userid>",
        "username": "Kater Karlo",
        "email": "karlo@xmemo",
        "ranking": "400",
        "role": "maintainer",
    }
}

```

Function: Returns some of the users information
Requires a user with "admin" role.


**/admin/edituser**

---

Type: POST

Headers:

| Content-Type | application/json |
| --- | --- |
| Authorization | Bearer &lt;token&gt; |

Body Example (JSON):

```javascript
{
    "userid": "<userid>",
    "newrole": "maintainer",
}

```

Response Example (JSON):

```javascript
{
    "message": "Successfully updated user"
}

```

Function: Returns some of the users information
Requires a user with "admin" role.


## Websocket:

The Socket is organized in multiple sub-routes that can be subscribed to.

#### Authentication Token:

A JWT token is required for authentication of the Auth Socket. The token can be acquired via the REST API under "/auth/getsockettoken".
This token is less sensitive than the REST JWT token, as the Auth Socket is readonly and no sensitive data can be read during access.

The token can normally be stored in a cookie which is accessible by the frontend javascript.

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
