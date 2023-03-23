import express, { json } from 'express';
import {items, notify} from './Controllers/check-controller';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(json()); // use built-in JSON middleware

// Enable CORS
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});
// First Operation
app.get('/:tid', items);
// Second Operation
app.post('/notify', notify);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));