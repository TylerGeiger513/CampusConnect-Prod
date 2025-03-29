import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '../config/config.service';
import { EncryptionService } from '../encryption/encryption.service';
import { Request } from 'express';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);
    private redisClient: RedisClientType;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly encryptionService: EncryptionService,
    ) {
        this.redisClient = createClient({
            url: this.configService.redisUri,
            socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 1000) },
        });

        this.redisClient.on('error', (err) =>
            this.logger.error('Redis error:', err)
        );
        this.redisClient.connect().catch((err) =>
            this.logger.error('Failed to connect to Redis:', err)
        );
    }

    /**
     * Saves a session using the userID and express-session data.
     * @param req - The HTTP request containing the session.
     * @param userId - The user identifier.
     */
    saveSession = (req: Request, userId: string): Promise<void> => {
        req.session.userId = userId;
        return new Promise<void>((resolve, reject) => {
            req.session.save((err) => (err ? reject(err) : resolve()));
        });
    };

    /**
     * Retrieves the USERID from the session stored in the cookie.
     * This method is designed for HTTP requests.
     * @param req - The HTTP request containing the raw cookies.
     * @returns The USERID if found; otherwise, null.
     */
    async getUserIdFromCookie(req: Request): Promise<string | null> {
        if (!req.headers.cookie) {
            this.logger.error('No cookies found on request');
            return null;
        }
        const cookies = cookie.parse(req.headers.cookie);
        const rawCookie = cookies['connect.sid'];
        if (!rawCookie) {
            this.logger.error('Session cookie "connect.sid" not found');
            return null;
        }
        if (rawCookie.substr(0, 2) !== 's:') {
            this.logger.error('Cookie is not signed as expected');
            return null;
        }
        const unsignedCookie = signature.unsign(
            rawCookie.slice(2),
            this.configService.sessionSecret
        );
        if (!unsignedCookie) {
            this.logger.error('Failed to unsign cookie');
            return null;
        }
        const session = await this.getSessionFromSessionId(unsignedCookie);
        return session?.userId || null;
    }

    /**
     * Retrieves the entire session object from Redis given a session ID.
     * @param sessionId - The unsigned session identifier.
     * @returns The session object if found; otherwise, null.
     */
    async getSessionFromSessionId(sessionId: string): Promise<any> {
        const redisKey = `session:${sessionId}`; // Matches your middleware prefix
        let encryptedSessionData: string | null;
        try {
            encryptedSessionData = await this.redisClient.get(redisKey);
        } catch (err) {
            this.logger.error('Error retrieving session from Redis:', err);
            return null;
        }
        if (!encryptedSessionData) {
            this.logger.error('No session data found for sessionId:', sessionId);
            return null;
        }
        try {
            const decrypted = this.encryptionService.decrypt(encryptedSessionData);
            return JSON.parse(decrypted);
        } catch (err) {
            this.logger.error('Failed to decrypt/parse session data:', err);
            return null;
        }
    }

    /**
     * Retrieves the session data from a raw cookie string.
     * This method handles unsigning the cookie internally.
     * @param rawCookie - The raw session cookie from the client.
     * @returns The session object if valid; otherwise, null.
     */
    async getSessionFromRawCookie(rawCookie: string): Promise<any> {
        if (rawCookie.substr(0, 2) !== 's:') {
            this.logger.error('Cookie is not signed as expected');
            return null;
        }
        const unsigned = signature.unsign(
            rawCookie.slice(2),
            this.configService.sessionSecret
        );
        if (!unsigned) {
            this.logger.error('Invalid session signature');
            return null;
        }
        return this.getSessionFromSessionId(unsigned);
    }

    /**
     * Retrieves the USERID from a raw cookie.
     * @param rawCookie - The raw session cookie from the client.
     * @returns The userId if found; otherwise, null.
     */
    async getUserIdFromRawCookie(rawCookie: string): Promise<string | null> {
        const session = await this.getSessionFromRawCookie(rawCookie);
        return session?.userId || null;
    }

    /**
     * Destroys a session by removing it from Redis.
     * @param sessionId - The session identifier.
     */
    destroySession = async (sessionId: string): Promise<void> => {
        const redisKey = `session:${sessionId}`;
        try {
            await this.databaseService.redisClient.del(redisKey);
            this.logger.log(`Session ${sessionId} destroyed successfully.`);
        } catch (error) {
            this.logger.error(`Failed to destroy session ${sessionId}:`, error);
            throw error;
        }
    };
}
