import { DataSource } from 'typeorm';
import 'dotenv/config';
import { Measure } from '../models/measure';


const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'db',
  entities:[Measure],
  synchronize: true,
});
console.log(AppDataSource.getMetadata)
export default AppDataSource;