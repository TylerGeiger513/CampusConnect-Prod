/**
 * @file signup.dto.ts
 * @description DTO for user signup.
 */
export class SignupDto {
  readonly email!: string;
  readonly username!: string;
  readonly password!: string;
  readonly campus!: string;
}
