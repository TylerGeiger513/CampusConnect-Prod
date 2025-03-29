import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

/**
 * @class NotificationsService
 * @description Provides business logic for sending notifications.
 * Currently used for friend request notifications, but can be extended for other events.
 */
@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly notificationsGateway: NotificationsGateway) { }

    /**
     * Sends a friend request notification.
     * @param targetUserId - The ID of the user receiving the notification.
     * @param fromUserId - The ID of the user who sent the friend request.
     */
    notifyFriendRequest(targetUserId: string, fromUserId: string): void {
        const payload = {
            type: 'FRIEND_REQUEST',
            from: fromUserId,
            message: 'You have a new friend request.',
        };
        this.notificationsGateway.sendNotification(targetUserId, payload);
        this.logger.log(`Friend request notification sent from ${fromUserId} to ${targetUserId}`);
    }

    /**
     * Sends a friend request accepted notification.
     * @param targetUserId - The ID of the user receiving the notification.
     * @param fromUserId - The ID of the user who accepted the friend request.
     */
    notifyFriendRequestAccepted(targetUserId: string, fromUserId: string): void {
        const payload = {
            type: 'FRIEND_REQUEST_ACCEPTED',
            from: fromUserId,
            message: 'Your friend request was accepted.',
        };
        this.notificationsGateway.sendNotification(targetUserId, payload);
        this.logger.log(`Friend request accepted notification sent from ${fromUserId} to ${targetUserId}`);
    }
}
