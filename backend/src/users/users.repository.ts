import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser, User, UserDocument } from './users.schema';
import { CampusService } from '../campus/campus.service';
import { ICampus } from './users.schema';

/**
 * @interface IUsersRepository
 * @description Defines the contract for user data access.
 */
export interface IUsersRepository {
    createUser(email: string, username: string, hashedPassword: string, campus: string): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findByIdentifier(identifier: { id?: string; email?: string; username?: string }): Promise<IUser | null>;
    updateUser(userId: string, update: Partial<IUser>): Promise<IUser>;
    findAllExcept(userId: string): Promise<IUser[]>;
}

/**
 * @class UsersRepository
 * @description Implements IUsersRepository using Mongoose with lean queries.
 */
@Injectable()
export class UsersRepository implements IUsersRepository {
    private readonly logger = new Logger(UsersRepository.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly campusService: CampusService,
    ) { }

    /**
     * Creates a new user.
     * @param email - User's email.
     * @param username - User's username.
     * @param hashedPassword - User's hashed password.
     * @param campus - User's campus.
     * @returns The created user as a plain object.
     */
    async createUser(
        email: string,
        username: string,
        hashedPassword: string,
        campusId: string
    ): Promise<IUser> {
        // Verify that the campus exists.
        const campusResult = await this.campusService.findCampusById(campusId.trim());
        if (!campusResult) {
            throw new Error('Campus not found');
        }

        // Create the user with the campus reference.
        const createdUser = new this.userModel({
            email,
            username,
            password: hashedPassword,
            campus: campusId, // stored as an ObjectId
        });

        // Save the document.
        const savedUser = await createdUser.save();

        // Populate the campus field (selecting only the name).
        await savedUser.populate('campus', 'name');

        // Convert the saved document to a plain object.
        const plainUser: any = savedUser.toObject();

        // Convert _id to string.
        plainUser._id = plainUser._id.toString();

        // Convert the campus field:
        if (plainUser.campus && plainUser.campus._id) {
            // If campus was populated, set it as an object with id and name.
            plainUser.campus = {
                id: plainUser.campus._id.toString(),
                name: plainUser.campus.name,
            };
        } else if (plainUser.campus) {
            // Otherwise, convert the ObjectId to a string.
            plainUser.campus = plainUser.campus.toString();
        }

        return plainUser as IUser;
    }




    /**
     * Finds a user by email.
     * @param email - Email to search for.
     * @returns The user as a plain object if found; otherwise, null.
     */
    async findByEmail(email: string): Promise<IUser | null> {
        const userDoc = await this.userModel.findOne({ email })
            .populate('campus', 'name')
            .exec();
        if (userDoc) {
            const plainUser: any = userDoc.toObject();
            plainUser._id = plainUser._id.toString();
            if (plainUser.campus && plainUser.campus._id) {
                plainUser.campus = {
                    id: plainUser.campus._id.toString(),
                    name: plainUser.campus.name,
                };
            } else if (plainUser.campus) {
                plainUser.campus = plainUser.campus.toString();
            }
            return plainUser as IUser;
        }
        return null;
    }


    /**
   * Finds a user by one or more identifiers.
   * If multiple identifiers are provided, the query matches if any are valid.
   * @param identifier - An object containing id, email, or username.
   * @returns The found user or null.
   */
    async findByIdentifier(identifier: { id?: string; email?: string; username?: string }): Promise<IUser | null> {
        const orConditions: { _id?: string; email?: string; username?: string }[] = [];

        if (identifier.id && Types.ObjectId.isValid(identifier.id)) {
            orConditions.push({ _id: identifier.id });
        }
        if (identifier.email) {
            orConditions.push({ email: identifier.email });
        }
        if (identifier.username) {
            orConditions.push({ username: identifier.username });
        }

        if (orConditions.length === 0) {
            this.logger.warn(`No valid identifier provided.`);
            return null;
        }

        const query = { $or: orConditions };
        this.logger.log(`Finding user with query: ${JSON.stringify(query)}`);

        // Use populate to fetch campus details.
        const userDoc = await this.userModel.findOne(query)
            .populate('campus', 'name')  // populates campus with only the name field
            .exec();

        if (userDoc) {
            const plainUser: any = userDoc.toObject();
            plainUser._id = plainUser._id.toString();

            // Convert campus field to { id, name } if it was populated.
            if (plainUser.campus && plainUser.campus._id) {
                plainUser.campus = {
                    id: plainUser.campus._id.toString(),
                    name: plainUser.campus.name,
                };
            } else if (plainUser.campus) {
                // If for some reason it's not populated, fallback to string.
                plainUser.campus = plainUser.campus.toString();
            }
            return plainUser as IUser;
        }

        this.logger.warn(`User not found for identifier: ${JSON.stringify(identifier)}`);
        return null;
    }


    /**
     * Updates a user with the given update object.
     * @param userId - ID of the user to update.
     * @param update - Partial user object with updated fields.
     * @returns The updated user as a plain object.
     */
    async updateUser(userId: string, update: Partial<IUser>): Promise<IUser> {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, update, { new: true }).lean().exec();
        if (updatedUser && updatedUser._id) {
            updatedUser._id = updatedUser._id.toString();
            if (updatedUser.campus && typeof updatedUser.campus !== 'string') {
                (updatedUser as any).campus = updatedUser.campus.toString();
            }
        }
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return { ...updatedUser, _id: updatedUser._id.toString() } as IUser;
    }

    async findAllExcept(userId: string): Promise<IUser[]> {
        const docs = await this.userModel.find({ _id: { $ne: userId } })
            .populate('campus', 'name')
            .lean()
            .exec();

        return docs.map(doc => {
            // ...convert _id and campus like other methods...
            const u: any = { ...doc };
            u._id = u._id.toString();
            if (u.campus && (u.campus as any)._id) {
                u.campus = {
                    id: (u.campus as any)._id.toString(),
                    name: (u.campus as any).name,
                };
            } else if (u.campus) {
                u.campus = u.campus.toString();
            }
            return u as IUser;
        });
    }
}
