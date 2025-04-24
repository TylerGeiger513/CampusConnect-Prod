import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { IUser } from '../users/users.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FriendsService {
    private readonly logger = new Logger(FriendsService.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Retrieves a user by any identifier.
     * @param identifier - A string that can be an id, email, or username.
     * @returns The user if found.
     * @throws NotFoundException if no user is found.
     */
    private async getUser(identifier: string): Promise<IUser> {
        const user = await this.usersRepository.findByIdentifier({
            id: identifier,
            email: identifier,
            username: identifier,
        });
        if (!user) {
            throw new NotFoundException(`User not found for identifier: ${identifier}`);
        }
        return user;
    }

    /**
     * Sends a friend request from the current user to a target user.
     */
    async sendFriendRequest(currentUserId: string, targetIdentifier: string): Promise<void> {
        if (currentUserId === targetIdentifier) {
            throw new BadRequestException('Cannot send a friend request to yourself.');
        }

        const targetUser = await this.getUser(targetIdentifier);
        const currentUser = await this.getUser(currentUserId);

        // Check if they are already friends.
        if (currentUser.friends?.includes(targetUser._id as string)) {
            throw new BadRequestException('Already friends.');
        }
        // Check if request was already sent.
        if (targetUser.friendRequests?.includes(currentUserId)) {
            throw new BadRequestException('Friend request already sent.');
        }

        // Update target user's friendRequests.
        await this.usersRepository.updateUser(targetUser._id as string, {
            friendRequests: [...(targetUser.friendRequests || []), currentUserId],
        });
        // Update current user's sentFriendRequests.
        await this.usersRepository.updateUser(currentUserId, {
            sentFriendRequests: [...(currentUser.sentFriendRequests || []), targetUser._id as string],
        });

        // Notify the target user in real time.
        this.notificationsService.notifyFriendRequest(targetUser._id as string, currentUserId);
    }

    /**
     * Accepts a friend request.
     */
    async acceptFriendRequest(currentUserId: string, requesterIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const requesterUser = await this.getUser(requesterIdentifier);

        if (!currentUser.friendRequests?.includes(requesterUser._id as string)) {
            throw new BadRequestException('No friend request from this user.');
        }

        const updatedCurrentRequests = currentUser.friendRequests.filter(id => id !== requesterUser._id);
        const updatedRequesterSent = (requesterUser.sentFriendRequests || []).filter(id => id !== currentUserId);
        const updatedCurrentFriends = [...(currentUser.friends || []), requesterUser._id as string];
        const updatedRequesterFriends = [...(requesterUser.friends || []), currentUserId];

        await this.usersRepository.updateUser(currentUserId, {
            friendRequests: updatedCurrentRequests,
            friends: updatedCurrentFriends,
        });
        await this.usersRepository.updateUser(requesterUser._id as string, {
            sentFriendRequests: updatedRequesterSent,
            friends: updatedRequesterFriends,
        });

        // Notify the requester that their friend request has been accepted.
        this.notificationsService.notifyFriendRequestAccepted(requesterUser._id as string, currentUserId);
    }

    /**
     * Denies a friend request.
     */
    async denyFriendRequest(currentUserId: string, requesterIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const requesterUser = await this.getUser(requesterIdentifier);

        if (!currentUser.friendRequests?.includes(requesterUser._id as string)) {
            throw new BadRequestException('No friend request from this user.');
        }
        const updatedRequests = currentUser.friendRequests.filter(id => id !== requesterUser._id);
        await this.usersRepository.updateUser(currentUserId, { friendRequests: updatedRequests });
    }

    /**
     * Removes a friend.
     */
    async removeFriend(currentUserId: string, friendIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const friendUser = await this.getUser(friendIdentifier);
        if (!currentUser.friends || !currentUser.friends.includes(friendUser._id as string)) {
            throw new BadRequestException('Not friends with this user.');
        }
        const updatedCurrentFriends = currentUser.friends.filter(id => id !== friendUser._id);
        const updatedFriendFriends = friendUser.friends ? friendUser.friends.filter(id => id !== currentUserId) : [];
        await this.usersRepository.updateUser(currentUserId, { friends: updatedCurrentFriends });
        await this.usersRepository.updateUser(friendUser._id as string, { friends: updatedFriendFriends });
    }

    /**
     * Cancels a sent friend request.
     */
    async cancelFriendRequest(currentUserId: string, targetIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const targetUser = await this.getUser(targetIdentifier);
        const updatedSent = (currentUser.sentFriendRequests || []).filter(id => id !== targetUser._id);
        const updatedTargetRequests = (targetUser.friendRequests || []).filter(id => id !== currentUserId);
        await this.usersRepository.updateUser(currentUserId, { sentFriendRequests: updatedSent });
        await this.usersRepository.updateUser(targetUser._id as string, { friendRequests: updatedTargetRequests });
    }

    /**
     * Blocks a user.
     */
    async blockUser(currentUserId: string, targetIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const targetUser = await this.getUser(targetIdentifier);
        if (currentUser.blockedUsers?.includes(targetUser._id as string)) {
            throw new BadRequestException('User is already blocked.');
        }
        // Remove from friends and any pending requests.
        const updatedFriends = (currentUser.friends || []).filter(id => id !== targetUser._id);
        const updatedFriendRequests = (currentUser.friendRequests || []).filter(id => id !== targetUser._id);
        const updatedSentRequests = (currentUser.sentFriendRequests || []).filter(id => id !== targetUser._id);
        await this.usersRepository.updateUser(currentUserId, {
            friends: updatedFriends,
            friendRequests: updatedFriendRequests,
            sentFriendRequests: updatedSentRequests,
            blockedUsers: [...(currentUser.blockedUsers || []), targetUser._id as string],
        });
    }

    /**
     * Unblocks a user.
     */
    async unblockUser(currentUserId: string, targetIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        // Ensure we compare against the actual _id stored in blockedUsers.
        const targetUser = await this.getUser(targetIdentifier);
        if (!currentUser.blockedUsers || !currentUser.blockedUsers.includes(targetUser._id as string)) {
            throw new BadRequestException('User is not blocked.');
        }
        const updatedBlocked = currentUser.blockedUsers.filter(id => id !== targetUser._id);
        await this.usersRepository.updateUser(currentUserId, { blockedUsers: updatedBlocked });
    }

    /**
     * Retrieves a user's friends.
     */
    async getFriends(userId: string): Promise<{ id: string, username: string }[]> {
        const user = await this.getUser(userId);
        const friendIds = user.friends || [];
        const friends = await Promise.all(friendIds.map(async (friendId) => {
            const friend = await this.getUser(friendId);
            const campus = typeof friend.campus === 'object' ? (friend.campus as any).name : friend.campus;
            return { id: friend._id as string, username: friend.username, campus: campus };
        }));
        return friends;
    }

    /**
     * Retrieves a user's incoming friend requests.
     */
    async getIncomingFriendRequests(userId: string): Promise<{ id: string, username: string }[]> {
        const user = await this.getUser(userId);
        const requestIds = user.friendRequests || [];
        const requests = await Promise.all(requestIds.map(async (id) => {
            const requester = await this.getUser(id);
            const campus = typeof requester.campus === 'object' ? (requester.campus as any).name : requester.campus;
            return { id: requester._id as string, username: requester.username, campus: campus };
        }));
        return requests;
    }

    /**
     * Retrieves a user's sent friend requests.
     */
    async getSentFriendRequests(userId: string): Promise<{ id: string, username: string }[]> {
        const user = await this.getUser(userId);
        const sentIds = user.sentFriendRequests || [];
        const sentRequests = await Promise.all(sentIds.map(async (id) => {
            const target = await this.getUser(id);
            const campus = typeof target.campus === 'object' ? (target.campus as any).name : target.campus;
            return { id: target._id as string, username: target.username, campus: campus };
        }));
        return sentRequests;
    }

    /**
     * Retrieves a user's blocked users.
     */
    async getBlockedUsers(userId: string): Promise<{ id: string, username: string }[]> {
        const user = await this.getUser(userId);
        const blockedIds = user.blockedUsers || [];
        const blockedUsers = await Promise.all(blockedIds.map(async (id) => {
            const blocked = await this.getUser(id);
            const campus = typeof blocked.campus === 'object' ? (blocked.campus as any).name : blocked.campus;
            return { id: blocked._id as string, username: blocked.username, campus: campus };
        }));
        return blockedUsers;
    }

    /**
     * Suggests friends based on mutual friends, campus, and major.
     * This method computes a score for each user based on the number of mutual friends,
     * whether they are on the same campus, and if they share the same major.
     * The highest weighted scores are returned as suggestions. 
     * @param currentUserId 
     * @returns 
     */
    async suggestFriends(
        currentUserId: string,
        search?: string,
    ): Promise<{ id: string; username: string; message: string }[]> {
        const me = await this.getUser(currentUserId);
        let candidates = await this.usersRepository.findAllExcept(currentUserId);
        // exclude existing relations
        const excluded = new Set([
            ...(me.friends || []),
            ...(me.sentFriendRequests || []),
            ...(me.friendRequests || []),
            ...(me.blockedUsers || []),
        ]);
        candidates = candidates.filter(u => !excluded.has(u._id as string));

        // if search provided, filter by username or fullName (case-insensitive)
        if (search?.trim()) {
            const term = search.trim().toLowerCase();
            candidates = candidates.filter(u =>
                u.username.toLowerCase().includes(term) ||
                (u.fullName?.toLowerCase().includes(term))
            );
        }

        // compute score and message
        const scored = candidates.map(u => {
            const mutual = (me.friends || []).filter(f => u.friends?.includes(f)).length;
            const sameCampus = (
                typeof u.campus === 'object' ? (u.campus as any).id : u.campus
            ) === (
                typeof me.campus === 'object' ? (me.campus as any).id : me.campus
            );
            const sameMajor = !!(u.major && u.major === me.major);
            // assign mutual friends a higher weight 
            let score = mutual * 3 + (sameCampus ? 2 : 0) + (sameMajor ? 1 : 0);

            let message: string;
            if (mutual > 0) {
                message = `${mutual} mutual friends`;
            } else if (sameCampus && u.major) {
                message = `${u.major ? u.major + ' major' : 'Student'} at ${(u.campus as any).name}`;
            } else if (sameMajor) {
                message = `${u.major ? u.major + ' major' : 'Student'} at ${(u.campus as any).name}`;
            } else {
                message = `${u.major ? u.major + ' major' : 'Student'} at ${(u.campus as any).name}`;
            }

            return { user: u, score, message };
        });

        // pick top 6
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(s => ({
                id: s.user._id as string,
                username: s.user.username,
                message: s.message,
            }));
    }
}
