# Database Schema

Campus Connect uses **MongoDB with Mongoose** to store user data, channels, and messages. The structure was designed to separate concerns, allow for scalability, and support real-time messaging.

All documents are stored in **three main collections**:

- `users`
- `channels`
- `messages`

This structure ensures that channels remain lightweight and that messages can be created, queried, and updated efficiently.

---

??? note "User Schema – `users` Collection"

    ```ts title="users.schema.ts"
    {
        _id: string,
        email: string,
        username: string,
        password: string, // Hashed
        campus: string,

        // Social Graph
        friends: string[],
        friendRequests: string[],
        sentFriendRequests: string[],
        blockedUsers: string[],

        createdAt: Date,
        updatedAt: Date
    }
    ```

    - Users can send and receive friend requests, block others, and maintain a list of confirmed friends.
        - *(not all features have been implmented on the front end yet)*
    - All relationships are stored as **array of user IDs** (strings), making it easier to join or populate as needed.
    - Passwords are hashed before storage (using bcrypt).

---

??? note "Channel Schema – `channels` Collection"

    ```ts title="channel.schema.ts"
    {
        _id: string,
        type: 'DM' | 'GROUP',
        name?: string,
        participants: string[], // User IDs

        createdAt: Date,
        updatedAt: Date
    }
    ```

    - A channel can be either a **DM** (direct message between two users) or a **GROUP** (future support).
    - The list of participants is stored as an array of user IDs.
    - Channels are deliberately lightweight – no messages are embedded.

---

??? note "Message Schema – `messages` Collection"

    ```ts title="message.schema.ts"
    {
        _id: string,
        channelId: string,
        senderId: string,
        senderName?: string,
        content: string,
        edited: boolean,

        createdAt: Date,
        updatedAt: Date
    }
    ```

    - Messages are stored in a separate collection 
    - Messages reference both the `channelId` and `senderId`.
    - When a message is edited, the `edited` flag is set to true for transparency.
    - The `senderName` is denormalized for performance (avoid extra joins in real-time views).

---

??? example "MongoDB Entity Relationship"

    ```mermaid
    erDiagram
        USER ||--o{ CHANNEL : participates_in
        USER ||--o{ MESSAGE : sends
        CHANNEL ||--o{ MESSAGE : contains

        USER {
            string _id
            string email
            string username
            string password
            string campus
            string[] friends
            string[] friendRequests
            string[] sentFriendRequests
            string[] blockedUsers
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