import express from 'express';
import cookieParser from 'cookie-parser';
import './extentions';
import { open } from './db';
import { logMiddleware, sessionMiddleware } from './middleware';
import apiRoute from './routes/api';
import staticRoute from './routes/static';
import pageRoute from './routes/page';
import route404 from './routes/404';

(async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.set('view engine', 'ejs');

  app.use(logMiddleware);
  app.use('/api', apiRoute);
  app.use('/static', staticRoute);
  app.use(sessionMiddleware);
  app.use('*', pageRoute);
  app.use(route404);

  await open('db.db');

  app.listen(8080, () => console.log('started'));
})();
