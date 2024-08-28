import express from 'express';
import dotenv from 'dotenv';
import AppDataSource from './config/database';
import router from './routes';


dotenv.config();

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); 

app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
    process.exit(1);
  });
