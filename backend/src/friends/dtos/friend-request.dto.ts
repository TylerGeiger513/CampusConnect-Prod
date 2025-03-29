/**
 * @file friend-request.dto.ts
 * @description DTO for friend operations. The "target" property can be a user id, email, or username.
 */
export class FriendRequestDto {
  readonly target!: string;
}
