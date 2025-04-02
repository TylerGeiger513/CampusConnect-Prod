import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CAMPUS_MODEL, Campus, CampusDocument } from './schemas/campus.schema';
import { PREDEFINED_CAMPUSES } from './campus.constants';

@Injectable()
export class CampusService {
    private readonly logger = new Logger(CampusService.name);

    constructor(
        @InjectModel(CAMPUS_MODEL) private readonly campusModel: Model<CampusDocument>,
    ) { }

    async findAll() {
        return this.campusModel.find().lean().exec();
    }

    async seedCampuses() {
        const count = await this.campusModel.countDocuments();
        if (count === 0) {
            await this.campusModel.insertMany(PREDEFINED_CAMPUSES);
            this.logger.log('Seeded campuses successfully');
        } else {
            this.logger.log('Campuses already seeded, skipping...');
        }
    }

    async exists(campusId: string): Promise<boolean> {
        if (!campusId) return false;
        campusId = campusId.trim();
        const campus = await this.campusModel.findById(campusId);
        if (campus) {
            this.logger.log(`Campus ${campusId} exists.`);
            return true;
        } else {
            this.logger.log(`Campus ${campusId} does not exist.`);
            return false;
        }
    }

    async findCampusById(campusId: string): Promise<any | null> {
        if (!campusId) return null;
        campusId = campusId.trim();
        const campus = await this.campusModel.findById(campusId).lean().exec();
        if (campus) {
            this.logger.log(`Found campus: ${campus.name}`);
            return campus;
        } else {
            this.logger.log(`Campus ${campusId} not found.`);
            return null;
        }
    }
}
