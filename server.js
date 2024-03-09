import { config } from 'dotenv';
import express from 'express';
import router from './routes';

const PORT = process.env.PORT || 5000;

config();

const app = express();

app.use(express.json());

app.use('/', router);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

export default app;
