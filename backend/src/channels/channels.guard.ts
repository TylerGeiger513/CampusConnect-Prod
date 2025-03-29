import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Logger } from '@nestjs/common';

const bypassedEndpoints: RegExp[] = [/\/channel\/getDMChannel/];

@Injectable()
export class ChannelsGuard implements CanActivate {
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly logger: Logger,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.session?.userId;
        const channelId = request.params?.channelId || request.body?.channelId;
        const routePath = request.route.path;

        if (!userId) {
            throw new ForbiddenException('Missing authentication.');
        }

        // Allow bypass for certain routes regardless of channelId
        if (bypassedEndpoints.some(regex => regex.test(routePath))) {
            return true;
        }

        // If the route needs a channelId but it's missing
        if (!channelId) {
            return true; 
        }

        const channel = await this.channelsService.getChannelById(channelId);
        if (!channel) {
            throw new ForbiddenException('Channel not found.');
        }

        if (!channel.participants.includes(userId)) {
            throw new ForbiddenException('You are not a participant of this channel.');
        }

        return true;
    }

}
