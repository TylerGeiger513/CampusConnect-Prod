import { Injectable, ConflictException, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { IUser } from './users.schema';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from '../auth/dtos/signup.dto';
import { LoginDto } from '../auth/dtos/login.dto';
import { CampusService } from '../campus/campus.service';

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
}
