import { Injectable, ConflictException, UnauthorizedException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { IUser, ICampus } from './users.schema'; // Import ICampus if needed for type checking
import * as bcrypt from 'bcryptjs';
import { SignupDto } from '../auth/dtos/signup.dto';
import { LoginDto } from '../auth/dtos/login.dto';
import { CampusService } from '../campus/campus.service';
import { UpdateUserDto } from '../auth/dtos/update.dto'; // Corrected path
import { Types } from 'mongoose'; // Import Types

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly campusService: CampusService
    ) { }

    async registerUser(dto: SignupDto): Promise<IUser> {
        const { email, username, password, campus } = dto;
        if (await this.usersRepository.findByEmail(email)) {
            throw new ConflictException('User with this email already exists.');
        }
        if (await this.usersRepository.findByIdentifier({ username })) {
            throw new ConflictException('Username already taken.');
        }
        // Validate campus existence (assume campus is passed as an ObjectId string).
        const campusExists = await this.campusService.findCampusById(campus);
        if (!campusExists) {
            throw new BadRequestException('Invalid campus.');
        }
        const hashedPassword = await this.hashPassword(password);
        return this.usersRepository.createUser(email, username, hashedPassword, campus);
    }

    async findUserByIdentifier(identifier: { id?: string; email?: string; username?: string }): Promise<IUser | null> {
        return this.usersRepository.findByIdentifier(identifier);
    }

    async validateUserCredentials(dto: LoginDto): Promise<IUser> {
        this.logger.log(`Validating user credentials for ${dto.identifier}.`);
        const { identifier, password } = dto;
        const user = await this.usersRepository.findByIdentifier({
            id: identifier, email: identifier, username: identifier
        });

        this.logger.log(`User found: ${user ? user
            .username : 'none'}.`);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials.');
        }
        if (!(await this.comparePasswords(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials.');
        }
        return user;
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async updateUser(userId: string, updateData: UpdateUserDto): Promise<IUser> {
        const user = await this.usersRepository.findByIdentifier({ id: userId });
        if (!user) {
            // Changed to NotFoundException for consistency as the user performing the update is authenticated,
            // but the target user might not exist (though unlikely if userId comes from CurrentUser).
            throw new NotFoundException('User not found.');
        }

        const payloadToUpdate: Partial<IUser> = {};

        // --- Refined Password Update Logic ---
        const newPasswordProvided = updateData.password && updateData.password.trim().length > 0;
        const oldPasswordProvided = updateData.oldPassword && updateData.oldPassword.trim().length > 0;

        if (newPasswordProvided) {
            if (!oldPasswordProvided) {
                throw new BadRequestException('Current password is required to set a new password.');
            }
            const isOldPasswordCorrect = await this.comparePasswords(updateData.oldPassword, user.password);
            if (!isOldPasswordCorrect) {
                throw new UnauthorizedException('Incorrect current password.');
            }
            payloadToUpdate.password = await this.hashPassword(updateData.password);
            this.logger.log(`User ${userId} password update prepared.`);

        } else if (oldPasswordProvided) {
            this.logger.warn(`User ${userId} provided oldPassword without a valid new password during update.`);
            throw new BadRequestException('New password cannot be empty when changing password.');
        }
        // --- End Refined Password Update Logic ---

        // Update fullName if provided and different
        if (updateData.fullName !== undefined && updateData.fullName !== user.fullName) {
            payloadToUpdate.fullName = updateData.fullName;
        }

        // Update username if provided and different
        if (updateData.username !== undefined && updateData.username !== user.username) {
            const existingUser = await this.usersRepository.findByIdentifier({ username: updateData.username });
            if (existingUser && existingUser._id?.toString() !== userId) {
                throw new ConflictException('Username already taken.');
            }
            payloadToUpdate.username = updateData.username;
        }

        // Update email if provided and different
        if (updateData.email !== undefined && updateData.email !== user.email) {
            const existingUser = await this.usersRepository.findByEmail(updateData.email);
             if (existingUser && existingUser._id?.toString() !== userId) {
                throw new ConflictException('User with this email already exists.');
            }
            payloadToUpdate.email = updateData.email;
        }

        // Update campus if provided and different
        if (updateData.campusId !== undefined) {
            const campusExists = await this.campusService.findCampusById(updateData.campusId);
            if (!campusExists) {
                throw new BadRequestException('Invalid campus specified.');
            }

            // Determine current campus ID string representation
            let currentCampusId: string | undefined;
            if (user.campus) {
                 if (typeof user.campus === 'string') {
                    currentCampusId = user.campus;
                 } else if (user.campus instanceof Types.ObjectId) {
                     currentCampusId = user.campus.toString();
                 } else if (typeof user.campus === 'object' && user.campus.id) { 
                     currentCampusId = user.campus.id;
                 } else if (typeof user.campus === 'object' && (user.campus as any)._id) { 
                     currentCampusId = (user.campus as any)._id.toString();
                 }
            }


            if (currentCampusId !== updateData.campusId) {
                // Store the ID for the update operation
                payloadToUpdate.campus = updateData.campusId;
            }
        }

        // Update major if provided
        if (updateData.major !== undefined) {
             // Optionally check if different: && updateData.major !== user.major
            payloadToUpdate.major = updateData.major;
        }

        // Check if there's anything to update
        if (Object.keys(payloadToUpdate).length === 0) {
            this.logger.log(`No changes detected for user ${userId}. Returning current user data.`);
            // Re-fetch even if no changes to ensure consistent return structure (populated)
            const finalUser = await this.usersRepository.findByIdentifier({ id: userId });
             if (!finalUser) {
                 // Should not happen if user existed initially
                 throw new NotFoundException('User not found after no-change check.');
             }
             return finalUser;
        }

        this.logger.log(`Updating user ${userId} with fields: ${JSON.stringify(Object.keys(payloadToUpdate))}`);
        // Perform the update
        const updateResult = await this.usersRepository.updateUser(userId, payloadToUpdate);

        if (!updateResult) {
             // Handle case where update might fail unexpectedly
             throw new Error('Failed to update user data.');
        }

        // --- Re-fetch the user with population AFTER the update ---
        this.logger.log(`Re-fetching user ${userId} with populated fields after update.`);
        const updatedPopulatedUser = await this.usersRepository.findByIdentifier({ id: userId });

        if (!updatedPopulatedUser) {
            // This should ideally not happen if the update succeeded
            throw new NotFoundException('User not found after update.');
        }

        // Return the fully populated user object
        return updatedPopulatedUser;
    }
}
