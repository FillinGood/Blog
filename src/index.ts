import express from 'express';
import fs from 'fs';
import { open } from './db';
import User from './users';

function ok(res: express.Response, data?: object) {
  send(res, 200, 'OK', data);
}

function send(res: express.Response, code: number, message: string, data?: object) {
  res.status(code);
  res.json({ code, message, ...data });
}

(async () => {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    const file = fs.createReadStream('html/index.html');
    res.header('Content-Type', 'text/html');
    file.pipe(res);
  });

  app.post('/api/login', async (req, res) => {
    const login = req.body.login;
    const hash = req.body.hash;

    if (typeof login !== 'string' || !login) return send(res, 400, 'login required');
    if (typeof hash !== 'string' || !hash) return send(res, 400, 'hash required');

    const success = await User.auth(login, hash);

    if (success) ok(res);
    else send(res, 401, 'wrong login or password');
  });

  app.put('/api/user', async (req, res) => {
    const login = req.body.login;
    const hash = req.body.hash;

    if (typeof login !== 'string' || !login) return send(res, 400, 'login required');
    if (typeof hash !== 'string' || !hash) return send(res, 400, 'hash required');

    const result = await User.register(login, hash);

    if (result === 'unknown') return send(res, 500, 'unknown error');
    if (result === 'login') return send(res, 400, 'login already exists');

    ok(res, { id: result.id });
  });

  app.get('/api/user', async (req, res) => {
    const qid = req.query.id as string | undefined;
    const login = req.query.login as string | undefined;

    if (qid) {
      const id = +qid;
      if (isNaN(id)) return send(res, 400, 'id must be a number');

      const user = await User.get(id);
      if (!user) return send(res, 404, 'user not found');
      return ok(res, { user: { id: user.id, name: user.login } });
    }
    if (login) {
      const user = await User.find(login);
      if (!user) return send(res, 404, 'user not found');
      return ok(res, { user: { id: user.id, name: user.login } });
    }
    send(res, 400, 'id or login required');
  });

  await open('db.db');

  app.listen(8080, () => console.log('started'));
})();
