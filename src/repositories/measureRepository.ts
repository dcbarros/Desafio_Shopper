import { Repository } from 'typeorm';
import { Measure } from '../models/measure';
import AppDataSource from '../config/database';

export const MeasureRepository = AppDataSource.getRepository(Measure);