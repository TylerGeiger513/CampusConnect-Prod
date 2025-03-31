# Friends System

Campus Connect features a fully functional friend system allowing users to:

- Send, accept, or deny friend requests
- Cancel sent requests
- Remove confirmed friends
- Block or unblock users
- View all friend-related lists

All logic is handled through the `FriendsService`, with routes protected by `AuthGuard`.

!!! warning
    Not all features are implemented on the frontend yet
---


## Schema

- **friends**: confirmed mutual connections
- **friendRequests**: incoming requests
- **sentFriendRequests**: outgoing pending requests
- **blockedUsers**: users this user has blocked

---

## Friend API Endpoints

All endpoints require a valid session and are guarded by `AuthGuard`.

### Send Friend Request

**POST** `/friends/request`

```json
{ "target": "bob@example.com" }
```

- `target` can be user ID, email, or username
- Cannot send to self
- Cannot send to already-friended user
- Cannot send if already pending

---

### Accept Friend Request

**POST** `/friends/accept`

```json
{ "target": "bob@example.com" }
```

- Moves user to `friends`
- Removes from `friendRequests` and their `sentFriendRequests`

---

### Deny Friend Request

**POST** `/friends/deny`

```json
{ "target": "bob@example.com" }
```

- Simply removes the incoming request
- No notification sent

---

### Cancel Friend Request

**POST** `/friends/cancel`

```json
{ "target": "bob@example.com" }
```

- Removes from your `sentFriendRequests`
- Removes you from their `friendRequests`

---

### Remove Friend

**POST** `/friends/remove`

```json
{ "target": "bob@example.com" }
```

- Removes both users from each other's `friends` lists

---

### Block User

**POST** `/friends/block`

```json
{ "target": "bob@example.com" }
```

- Adds to `blockedUsers`
- Automatically removes from:
  - `friends`
  - `friendRequests`
  - `sentFriendRequests`

---

### Unblock User

**POST** `/friends/unblock`

```json
{ "target": "bob@example.com" }
```

- Removes target from `blockedUsers`

---

## Fetch Lists

### Friends List

**POST** `/friends/friendsList`

Response:

```json
{
  "friends": [
    { "id": "abc123", "username": "bob" },
    { "id": "xyz456", "username": "carol" }
  ]
}
```

---

### Incoming Requests

**POST** `/friends/getIncomingRequests`

Response:

```json
{
  "requests": [
    { "id": "xyz456", "username": "carol" }
  ]
}
```

---

### Sent Requests

**POST** `/friends/getSentRequests`

Response:

```json
{
  "requests": [
    { "id": "bob123", "username": "bob" }
  ]
}
```

---

### Blocked Users

**POST** `/friends/getBlockedUsers`

Response:

```json
{
  "blockedUsers": [
    { "id": "block1", "username": "enemy" }
  ]
}
```

---

## Validation & Errors

| Scenario | Error |
|----------|-------|
| Send to self | 400 Bad Request |
| Already friends | 400 Bad Request |
| Already sent request | 400 Bad Request |
| No incoming request to accept | 400 Bad Request |
| Remove non-friend | 400 Bad Request |
| Blocked already | 400 Bad Request |
| Unblock non-blocked | 400 Bad Request |
| Nonexistent user | 404 Not Found |

---

## Notes

- The system uses MongoDB array fields for relationships
- All lookups are done using flexible `findByIdentifier()`:
    - Accepts ID, email, or username
- Notifications are sent (real-time) when:
    - A request is received
    - A request is accepted