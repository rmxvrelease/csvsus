import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { PrismaClient } from 'generated/prisma/client';
import {
  download_script_path,
  download_script_dir_path,
  get_csvs_dir_path as get_csv_storage_path,
  is_valid_state,
  Data,
  get_csvs_dir_path,
} from './utils';
import { join } from 'node:path';
import fs from 'fs';
import { MakeCsvDTO } from './app.controller';

@Injectable()
export class AppService {
  async deleteCsv(id: number) {
    const path_to_delete = join(get_csvs_dir_path(), `${id}`);

    if (!fs.existsSync(path_to_delete)) {
      return await this.prisma.csv.delete({ where: { id: id } });
    }

    try {
      fs.rmSync(path_to_delete, { recursive: true });
    } catch (error) {
      console.error(`Error deleting CSV with ID ${id}:`, error);
      throw new HttpException(
        `Error deleting CSV with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return await this.prisma.csv.delete({ where: { id: id } });
  }

  downloadCsv(id: number, sistema: 'SIA' | 'SIH'): fs.ReadStream {
    const csv_path = join(get_csv_storage_path(), `${id}`, `${sistema}.csv`);

    if (!fs.existsSync(csv_path)) {
      console.error(`CSV with ID ${id} not found`);
      const res = this.prisma.csv.delete({ where: { id: id } });
      res
        .then(() => {
          console.log(`CSV with ID ${id} deleted`);
        })
        .catch(() => {
          console.error(`Error deleting CSV with ID ${id}`);
        });

      throw new HttpException(
        `CSV with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const stream = fs.createReadStream(csv_path);

    return stream;
  }
  constructor(private prisma: PrismaClient) {}

  async makeCsv(dto: MakeCsvDTO) {
    console.log(dto);

    const script_path = download_script_path();
    this.validateMakeCsvParams(dto);

    if (await this.isAnyCsvBeingDownloaded()) {
      console.log('Another CSV is being downloaded');
      throw new HttpException(
        'Another CSV is being downloaded',
        HttpStatus.CONFLICT,
      );
    }

    const csv = await this.prisma.csv.create({
      data: {
        cnes: dto.cnes,
        estado: dto.estado,
        start: dto.start,
        end: dto.end,
      },
    });

    exec(
      `python3 ${script_path} ${dto.cnes} ${dto.estado} SIA ${dto.start} ${dto.end}`,
      (error) => {
        if (error) {
          void this.csvMakeErrCallback(error, csv.id);
          return;
        }
        console.log('SIA download finished');
        exec(
          `python3 ${script_path} ${dto.cnes} ${dto.estado} SIH ${dto.start} ${dto.end}`,
          (error) => {
            if (error) {
              void this.csvMakeErrCallback(error, csv.id);
              return;
            }
            console.log('SIH download finished');
            void this.csvMakeOkCallback(csv.id);
          },
        );
      },
    );

    return csv;
  }

  async getAllCsvs() {
    return this.prisma.csv.findMany();
  }

  async getCsv(id: number) {
    return this.prisma.csv.findUnique({ where: { id } });
  }

  async getCnesCsvs(cnes: string) {
    return this.prisma.csv.findMany({ where: { cnes: cnes } });
  }

  private async csvMakeErrCallback(error: Error, csv_id: number) {
    console.log('CSV creation failed');
    console.log(error);
    try {
      await this.prisma.csv.delete({ where: { id: csv_id } });
    } catch {
      console.log(`ERRO CRÍTICO: Não foi possível deletar o CSV ${csv_id}`);
    }
  }

  private async csvMakeOkCallback(csv_id: number) {
    const generated_csv_dir = join(download_script_dir_path(), 'united_csv');
    const csv_storage_dir = join(get_csv_storage_path(), `${csv_id}`);
    try {
      fs.cpSync(generated_csv_dir, csv_storage_dir, { recursive: true });
    } catch {
      void this.csvMakeErrCallback(Error('Erro ao copiar CSV'), csv_id);
      return;
    }

    try {
      await this.prisma.csv.update({
        where: { id: csv_id },
        data: { is_running: false },
      });
    } catch {
      console.log(`ERRO CRÍTICO: Não foi possível atualizar o CSV ${csv_id}`);
    }

    console.log('CSV created successfully');
  }

  private async isAnyCsvBeingDownloaded() {
    const csv = await this.prisma.csv.findFirst({
      where: { is_running: true },
    });
    if (csv != null) {
      return true;
    }
    return false;
  }

  private validateMakeCsvParams(dto: MakeCsvDTO) {
    if (dto.cnes.toString().length != 7) {
      console.log('CNES deve conter 7 caracteres');
      throw new HttpException(
        'CNES deve conter 7 caracteres',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!is_valid_state(dto.estado)) {
      console.log('Estado inválido');
      throw new HttpException('Estado inválido', HttpStatus.BAD_REQUEST);
    }

    let start: Data;
    let end: Data;

    try {
      start = Data.fromString(dto.start);
      end = Data.fromString(dto.end);
    } catch {
      console.log('Data inválida:');
      console.log(dto.start);
      console.log(dto.end);
      throw new HttpException('Data inválida', HttpStatus.BAD_REQUEST);
    }

    if (!start.less_than_or_equal(end)) {
      console.log('Data inválida:');
      console.log(dto.start);
      console.log(dto.end);
      console.log('Data de inicio deve ser menor ou igual que a data de fim.');
      throw new HttpException('Data inválida', HttpStatus.BAD_REQUEST);
    }
  }
}
