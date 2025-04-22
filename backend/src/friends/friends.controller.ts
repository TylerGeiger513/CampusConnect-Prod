import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendRequestDto } from './dtos/friend-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * @class FriendsController
 * @description Exposes endpoints for managing friend relationships.
 */
@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Post('friendsList')
    async getFriendsList(@CurrentUser() currentUserId: string): Promise<any> {
        const friends = await this.friendsService.getFriends(currentUserId);
        return { friends };
    }

    @Post('getIncomingRequests')
    async getFriendRequests(@CurrentUser() currentUserId: string): Promise<any> {
        const requests = await this.friendsService.getIncomingFriendRequests(currentUserId);
        return { requests };
    }

    @Post('getSentRequests')
    async getSentRequests(@CurrentUser() currentUserId: string): Promise<any> {
        const requests = await this.friendsService.getSentFriendRequests(currentUserId);
        return { requests };
    }

    @Post('getBlockedUsers')
    async getBlockedUsers(@CurrentUser() currentUserId: string): Promise<any> {
        const blockedUsers = await this.friendsService.getBlockedUsers(currentUserId);
        return { blockedUsers };
    }

    @Post('request')
    async sendFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.sendFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request sent.' };
    }

    @Post('accept')
    async acceptFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.acceptFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request accepted.' };
    }

    @Post('deny')
    async denyFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.denyFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request denied.' };
    }

    @Post('remove')
    async removeFriend(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.removeFriend(currentUserId, dto.target);
        return { message: 'Friend removed.' };
    }

    @Post('cancel')
    async cancelFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.cancelFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request cancelled.' };
    }

    @Post('block')
    async blockUser(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.blockUser(currentUserId, dto.target);
        return { message: 'User blocked.' };
    }

    @Post('unblock')
    async unblockUser(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.unblockUser(currentUserId, dto.target);
        return { message: 'User unblocked.' };
    }

    @Post('suggestions')
    async getSuggestions(
        @CurrentUser() currentUserId: string,
        @Body('search') search?: string,
    ): Promise<any> {
        const suggestions = await this.friendsService.suggestFriends(currentUserId, search);
        return { suggestions };
    }
}
