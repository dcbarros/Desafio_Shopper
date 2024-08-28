import { Request, Response } from 'express';
import { MeasureService } from '../services/measureService';
import { GeminiService } from '../services/geminiService';

const measureService = new MeasureService();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');

export class MeasureController {
  async upload(req: Request, res: Response) {
    try {
      const { image, customer_code, measure_datetime, measure_type } = req.body;

      const imageUri = await geminiService.uploadImage(image, 'image/jpeg', 'Customer Image');

      const measureValueString = await geminiService.generateContentWithImage(imageUri, 'image/jpeg', 
        `extract the quantity, in numerical values, read from the image, the return should be just a number indicating the quantity of elements requested ${measure_type}`);

      const measureValue = parseFloat(measureValueString);

      if (isNaN(measureValue)) {
        throw new Error('The extracted measure value is not a valid number.');
      }

      const measure = await measureService.createMeasure({
        customerCode: customer_code,
        measureDatetime: new Date(measure_datetime),
        measureType: measure_type,
        imageUrl: imageUri,
        measureValue,
      });

      return res.status(200).json({
        image_url: measure.imageUrl,
        measure_value: measure.measureValue,
        measure_uuid: measure.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'DOUBLE_REPORT') {
          return res.status(409).json({
            error_code: 'DOUBLE_REPORT',
            error_description: 'Leitura do mês já realizada',
          });
        }
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: error.message,
        });
      }
      return res.status(500).json({
        error_code: 'SERVER_ERROR',
        error_description: 'An unexpected error occurred.',
      });
    }
  }

  async confirm(req: Request, res: Response) {
    try {
      const { measure_uuid, confirmed_value } = req.body;

      await measureService.confirmMeasure(measure_uuid, confirmed_value);

      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'MEASURE_NOT_FOUND') {
          return res.status(404).json({
            error_code: 'MEASURE_NOT_FOUND',
            error_description: 'Leitura não encontrada',
          });
        }
        if (error.message === 'CONFIRMATION_DUPLICATE') {
          return res.status(409).json({
            error_code: 'CONFIRMATION_DUPLICATE',
            error_description: 'Leitura já confirmada',
          });
        }
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: error.message,
        });
      }
      return res.status(500).json({
        error_code: 'SERVER_ERROR',
        error_description: 'An unexpected error occurred.',
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { customerCode } = req.params;
      const { measure_type } = req.query;

      const measures = await measureService.listMeasures(customerCode, measure_type as 'WATER' | 'GAS');

      if (!measures.length) {
        return res.status(404).json({
          error_code: 'MEASURES_NOT_FOUND',
          error_description: 'Nenhuma leitura encontrada',
        });
      }

      return res.status(200).json({
        customer_code: customerCode,
        measures,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: error.message,
        });
      }
      return res.status(500).json({
        error_code: 'SERVER_ERROR',
        error_description: 'An unexpected error occurred.',
      });
    }
  }
}
