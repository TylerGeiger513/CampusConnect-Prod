# Redis & Session Management

Campus Connect uses **Redis** to manage encrypted session storage across users and services. This system allows persistent logins, WebSocket authentication, and scalable session state in a stateless backend.

---

## Why Redis?

Redis is used as a fast, in-memory key-value store for session persistence.

- Stateless backend: Session data lives in Redis, not in memory
- Encrypted session payloads
- Signed cookies for tamper prevention
- TTL-based expiration for automatic cleanup

---

## Session Flow

??? example "Login Flow Diagram"

    ```mermaid
    sequenceDiagram
        participant Browser
        participant Backend
        participant Redis

        Browser->>+Backend: POST /auth/login
        Backend->>+Redis: Save encrypted session with userId
        Redis-->>-Backend: OK
        Backend-->>-Browser: Set-Cookie: connect.sid

        Browser->>+Backend: "GET (Protected Route)"
        Backend->>+Redis: Retrieve + decrypt session
        Redis-->>-Backend: { userId }
        Backend-->>-Browser: Serve user data
    ```

---

## Session Lifecycle

### 1. Save Session

```ts title="session.service.ts"
await this.sessionService.saveSession(req, userId);
```

Writes the session to Redis under the key `session:<sid>` after encrypting and stringifying the payload.

---

### 2. Retrieve Session

- From HTTP request:
```ts
await getUserIdFromCookie(req);
```
- From WebSocket cookie:
```ts
await getSessionFromRawCookie(rawCookie); 
```
    - *Used in `ChannelsGateway` to authenticate socket connections.*

---

### 3. Destroy Session

```ts
await destroySession(sessionId);
```

Removes the session from Redis and invalidates it.

---

## Redis Key Format

- All sessions are stored under the Redis key: `session:<sessionId>`
- Length: 1 day (86400 seconds)
- Auto-purged by Redis after expiry

## Session Payload (Decrypted)

```json
{
  "cookie": {
    "originalMaxAge": 86400000,
    "expires": "2025-03-31T00:00:00.000Z",
    "httpOnly": true,
    "secure": false,
    "sameSite": "strict"
  },
  "userId": "64f123456789abcdef123456"
}
```