import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * @file update.dto.ts
 * @description DTO for updating user profile information.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  readonly username?: string;
  readonly email?: string;
  readonly campusId?: string; // Changed from campus to campusId
  readonly major?: string;
  readonly oldPassword?: string; // Added for password updates
  readonly password?: string; // Represents the new password
}




