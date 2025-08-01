import {
  Body,
  Get,
  Controller,
  Post,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import express from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('csvs_by_cnes:cnes')
  getCsvsByCnes(@Param('cnes') cnes: string) {
    return this.appService.getCnesCsvs(cnes);
  }

  @Get('csvs')
  async getAllCsvs() {
    return this.appService.getAllCsvs();
  }

  @Get('csv:id')
  async getCsv(@Param('id') id: string) {
    return this.appService.getCsv(+id);
  }

  @Get('SIA:id')
  downloadSIA(@Param('id') id: string, @Res() response: express.Response) {
    const stream = this.appService.downloadCsv(+id, 'SIA');

    response.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment;filename=SIA.csv',
    });

    stream.pipe(response);
  }

  @Get('SIH:id')
  downloadSIH(@Param('id') id: string, @Res() response: express.Response) {
    const stream = this.appService.downloadCsv(+id, 'SIH');

    response.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment;filename=SIH.csv',
    });

    stream.pipe(response);
  }

  @Post('make_csv')
  makeCsv(@Body() dto: MakeCsvDTO) {
    const data = this.appService.makeCsv(dto);
    return data;
  }

  @Delete('csv:id')
  deleteCsv(@Param('id') id: string) {
    return this.appService.deleteCsv(+id);
  }
}

export interface MakeCsvDTO {
  cnes: string;
  estado: string;
  start: string;
  end: string;
}
