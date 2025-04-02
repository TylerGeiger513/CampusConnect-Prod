import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampusController } from './campus.controller';
import { CampusService } from './campus.service';
import { CampusSchema, CAMPUS_MODEL } from './schemas/campus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CAMPUS_MODEL, schema: CampusSchema }]),
  ],
  controllers: [CampusController],
  providers: [CampusService, Logger],
  exports: [CampusService],
})
export class CampusModule {}
