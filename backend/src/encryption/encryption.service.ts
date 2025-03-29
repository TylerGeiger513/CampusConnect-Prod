/**
 * @file encryption.service.ts
 * @description Provides encryption and decryption functions using AES-256-CBC.
 * The service is designed to be pure and side-effect free except for logging.
 */

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Derives a 32-byte key from the encryption key provided in the environment variables.
   * @returns A Buffer containing the derived key.
   */
  private getKey(): Buffer {
    return crypto
      .createHash('sha256')
      .update(this.configService.encryptionKey)
      .digest();
  }

  /**
   * Encrypts plain text using AES-256-CBC.
   * @param text - The plain text to encrypt.
   * @returns The encrypted text in the format "iv:encrypted".
   */
  encrypt(text: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const result = iv.toString('hex') + ':' + encrypted;
    this.logger.debug('Encryption successful.');
    return result;
  }

  /**
   * Decrypts text encrypted with AES-256-CBC.
   * @param text - The encrypted text in the format "iv:encrypted".
   * @returns The decrypted plain text.
   * @throws Will throw an error if the input format is invalid.
   */
  decrypt(text: string): string {
    const key = this.getKey();
    const parts = text.split(':');
    if (parts.length !== 2) {
      this.logger.error('Invalid encrypted text format.');
      throw new Error('Invalid encrypted text format.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.logger.debug('Decryption successful.');
    return decrypted;
  }
}
