# Channels & Messaging

Campus Connect enables real-time direct messaging between users, organized into channels. This system supports:

- Direct Messaging (DMs) with unique channel instances
- Message creation, retrieval, editing, and deletion
- Channel-based access control via guards
- Real-time WebSocket updates per channel

---

??? example "ER Diagram"

    ```mermaid
    erDiagram
        USER ||--o{ CHANNEL : participates_in
        USER ||--o{ MESSAGE : sends
        CHANNEL ||--o{ MESSAGE : contains

        USER {
            string _id
            string username
        }

        CHANNEL {
            string _id
            string type
            string name
            string[] participants
        }

        MESSAGE {
            string _id
            string channelId
            string senderId
            string content
            boolean edited
            date createdAt
        }
    ```

---

## Channel Types

- **DM**: Private channel between two users
- **GROUP**: Multi-user channels (not yet implemented)

---

## Endpoints

### GET `/channels`

Returns all channels the current user is a participant in.

### POST `/channels/channel/getDMChannel`

Creates or retrieves a DM channel between the current user and another user.

```json
{ "userId": "targetUserId" }
```

---

## Messaging

### POST `/channels/message`

Sends a message to a channel.

```json
{
  "channelId": "abc123",
  "content": "Hello world"
}
```

### GET `/channels/:channelId/messages`

Returns all messages in the specified channel, sorted by creation time.

### POST `/channels/message/:messageId/edit`

Edits a message if the sender matches the current user.

```json
{
  "content": "Edited message content"
}
```

### POST `/channels/message/:messageId/delete`

Deletes a message if the sender is the current user.

---

## Channel Access Control

All routes are protected by the `ChannelsGuard`.

- Verifies the user is a participant in the given channel
- Allows bypass for DM creation (`/channel/getDMChannel`)
- Returns `403 Forbidden` if unauthorized

---

## Real-Time Messaging

Messages are emitted to clients using Socket.IO under the `/channels` namespace.

### WebSocket Events

#### `joinChannel`
Client joins a Socket.IO room by channel ID.

#### `leaveChannel`
Client leaves the specified room.

#### `message.sent` (Server Internal)
When a message is sent, the `ChannelsGateway` listens to this event and broadcasts it via `messageReceived`.

#### `messageReceived`
Clients listening on a channel receive new messages in real-time.

---

## Message Lifecycle

1. **Client sends message via HTTP** → `POST /channels/message`
2. **Backend saves message and emits** → `message.sent`
3. **Gateway receives event and emits to clients in room** → `messageReceived`

---

## WebSocket Authentication

On socket connection, the server:

- Parses the `connect.sid` cookie
- Verifies session with Redis
- Disconnects unauthenticated clients

---