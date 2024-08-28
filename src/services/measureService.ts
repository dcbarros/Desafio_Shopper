import { MeasureRepository } from '../repositories/measureRepository';
import { Measure } from '../models/measure';
import { Between } from 'typeorm';

interface CreateMeasureDTO {
  customerCode: string;
  measureDatetime: Date;
  measureType: 'WATER' | 'GAS';
  imageUrl: string;
  measureValue: number;
}

export class MeasureService {
  async createMeasure(data: CreateMeasureDTO): Promise<Measure> {
    
    const startOfMonth = new Date(data.measureDatetime.getFullYear(), data.measureDatetime.getMonth(), 1);
    const endOfMonth = new Date(data.measureDatetime.getFullYear(), data.measureDatetime.getMonth() + 1, 0);
    
    const existingMeasure = await MeasureRepository.findOne({
      where: {
        customerCode: data.customerCode,
        measureType: data.measureType,
        measureDatetime: Between(startOfMonth, endOfMonth),
      },
    });

    if (existingMeasure) {
      throw new Error('DOUBLE_REPORT');
    }

    const measure = MeasureRepository.create(data);
    await MeasureRepository.save(measure);
    return measure;
  }

  async confirmMeasure(id: string, confirmedValue: number): Promise<void> {
    const measure = await MeasureRepository.findOne({ where: { id } });

    if (!measure) {
      throw new Error('MEASURE_NOT_FOUND');
    }

    if (measure.hasConfirmed) {
      throw new Error('CONFIRMATION_DUPLICATE');
    }

    measure.measureValue = confirmedValue;
    measure.hasConfirmed = true;
    await MeasureRepository.save(measure);
  }

  async listMeasures(customerCode: string, measureType?: 'WATER' | 'GAS'): Promise<Measure[]> {
    const query = MeasureRepository.createQueryBuilder('measure')
      .where('measure.customerCode = :customerCode', { customerCode });

    if (measureType) {
      query.andWhere('measure.measureType = :measureType', { measureType });
    }

    return query.getMany();
  }
}