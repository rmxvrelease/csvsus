import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import fs from 'node:fs';

export class Data {
  month: number;
  year: number;

  constructor(m: number, y: number) {
    if (m < 1 || m > 12) throw new Error('Invalid month');
    if (y < 50) {
      this.year = y + 2000;
    } else if (y > 99) {
      this.year = y + 1900;
    } else {
      this.year = y;
    }

    this.month = m;
    this.year = m;
  }

  static fromString(dateString: string): Data {
    const [month, year] = dateString.split('-').map(Number);
    return new Data(month, year);
  }

  less_than(other: Data): boolean {
    if (this.year < other.year) return true;
    if (this.year > other.year) return false;
    return this.month < other.month;
  }

  less_than_or_equal(other: Data): boolean {
    if (this.year < other.year) return true;
    if (this.year > other.year) return false;
    return this.month <= other.month;
  }
}

export function download_script_path(): string {
  const curr_dir = __dirname;
  return path.join(curr_dir, '..', 'susd', 'main.py');
}

export function download_script_dir_path(): string {
  const curr_dir = __dirname;
  return path.join(curr_dir, '..', 'susd');
}

export function get_csvs_dir_path(): string {
  const curr_dir = __dirname;
  const csvs_dir = path.join(curr_dir, '..', 'csv');
  const exists = existsSync(csvs_dir);
  if (exists) {
    return csvs_dir;
  }
  mkdirSync(csvs_dir);
  return csvs_dir;
}

export function is_valid_state(state: string): boolean {
  const validStates = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];
  return validStates.includes(state);
}

export function show_proj_structure() {
  console.log('\nCURRENT WORKING DIRECTORY');
  const curr_dir = __dirname;
  for (const file of fs.readdirSync(curr_dir)) {
    console.log(file);
  }

  console.log('\nPARENT DIRECTORY');
  const parent_dir = path.join(curr_dir, '..');
  for (const file of fs.readdirSync(parent_dir)) {
    console.log(file);
  }

  console.log('\nPYTHON SCRIPT DIRECTORY');
  const sus_d_dir = path.join(curr_dir, '..', 'susd');
  for (const file of fs.readdirSync(sus_d_dir)) {
    console.log(file);
  }
}
