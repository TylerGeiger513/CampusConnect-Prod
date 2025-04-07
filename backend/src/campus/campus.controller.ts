import { Controller, Get } from '@nestjs/common';
import { CampusService } from './campus.service';

@Controller('campuses')
export class CampusController {
  constructor(private readonly campusService: CampusService) { }

  @Get()
  async getCampuses() {
    return this.campusService.findAll();
  }
}
