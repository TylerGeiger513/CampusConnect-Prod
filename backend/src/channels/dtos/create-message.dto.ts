/**
 * @file create-message.dto.ts
 * @description DTO for creating a new message in a channel.
 */
export class CreateMessageDto {
    readonly channelId!: string;
    readonly content!: string;
  }
  