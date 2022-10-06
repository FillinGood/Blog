import express, { ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import './extentions';
import { open } from './db';
import { logMiddleware, sessionMiddleware } from './middleware';
import apiRoute from './routes/api';
import staticRoute from './routes/static';
import pageRoute from './routes/page';
import route404 from './routes/404';
import { ValidationError } from './validation';

(async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.set('view engine', 'ejs');

  app.use(logMiddleware);
  app.use('/api', apiRoute);
  app.use('/static', staticRoute);
  app.use(sessionMiddleware);
  app.use('/', pageRoute);
  app.use(route404);

  app.use(((err, req, res, next) => {
    if (err instanceof ValidationError) {
      res.answer(400, err.message);
    } else {
      next(err);
    }
  }) as ErrorRequestHandler);

  await open('db.db');

  app.listen(8080, () => console.log('started'));
})();
