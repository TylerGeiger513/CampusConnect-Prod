/**
 * @file login.dto.ts
 * @description DTO for user login.
 */
export class LoginDto {
  readonly identifier!: string; // Can be email, username, or user id.
  readonly password!: string;
}
