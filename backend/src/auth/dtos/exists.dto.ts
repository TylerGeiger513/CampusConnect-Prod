/**
 * @file exists.dto.ts
 * @description DTO for checking if a user exists.
 * 
 */
export class ExistsDto {
  readonly identifier!: string; // Can be email, username, or user id.
}