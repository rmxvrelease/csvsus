import { Body, Get, Controller, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('csvs')
  async getAllCsvs() {
    return this.appService.getAllCsvs();
  }

  @Get('csv:id')
  async getCsv(@Param('id') id: string) {
    return this.appService.getCsv(+id);
  }

  @Get('SIA:id')
  downloadSIA(@Param('id') id: string) {
    return this.appService.downloadCsv(+id, 'SIA');
  }

  @Get('SIH:id')
  downloadSIH(@Param('id') id: string) {
    return this.appService.downloadCsv(+id, 'SIH');
  }

  @Post('make_csv')
  makeCsv(@Body() dto: MakeCsvDTO) {
    const data = this.appService.makeCsv(dto);
    return data;
  }
}

export interface MakeCsvDTO {
  cnes: string;
  estado: string;
  start: string;
  end: string;
}
