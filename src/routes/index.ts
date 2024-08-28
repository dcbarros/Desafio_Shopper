import { Router } from 'express';
import { MeasureController } from '../controllers/measureController';
import { validateRequest } from '../middleware/validateRequest';
import { Schema, Location } from 'express-validator';

const router = Router();
const measureController = new MeasureController();

const uploadSchema: Schema = {
  image: {
    in: ['body'] as Location[], // Correção da tipagem
    isBase64: {
      errorMessage: 'Image must be a valid base64 string',
    },
  },
  customer_code: {
    in: ['body'] as Location[],
    isString: {
      errorMessage: 'Customer code must be a string',
    },
  },
  measure_datetime: {
    in: ['body'] as Location[],
    isISO8601: {
      errorMessage: 'Measure datetime must be a valid ISO 8601 date',
    },
  },
  measure_type: {
    in: ['body'] as Location[],
    isIn: {
      options: [['WATER', 'GAS']],
      errorMessage: 'Measure type must be either WATER or GAS',
    },
  },
};

const confirmSchema: Schema = {
  measure_uuid: {
    in: ['body'] as Location[],
    isUUID: {
      errorMessage: 'Measure UUID must be a valid UUID',
    },
  },
  confirmed_value: {
    in: ['body'] as Location[],
    isInt: {
      errorMessage: 'Confirmed value must be an integer',
    },
  },
};

router.post('/upload', validateRequest(uploadSchema), measureController.upload.bind(measureController));
router.patch('/confirm', validateRequest(confirmSchema), measureController.confirm.bind(measureController));
router.get('/:customerCode/list', measureController.list.bind(measureController));

export default router;
