import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import mime from 'mime';
import { open } from './db';
import Session, { sessionLife } from './sessions';
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
  app.use(cookieParser());
  app.set('view engine', 'ejs');

  app.post('/api/login', async (req, res) => {
    const login = req.body.login;
    const hash = req.body.hash;

    if (typeof login !== 'string' || !login) return send(res, 400, 'login required');
    if (typeof hash !== 'string' || !hash) return send(res, 400, 'hash required');

    const user = await User.auth(login, hash);
    if (!user) return send(res, 401, 'wrong login or password');

    const s = await Session.create(user);
    res.cookie('token', s.token, { maxAge: sessionLife * 1000 });
    ok(res);
  });

  app.put('/api/user', async (req, res) => {
    const login = req.body.login;
    const hash = req.body.hash;

    if (typeof login !== 'string' || !login) return send(res, 400, 'login required');
    if (typeof hash !== 'string' || !hash) return send(res, 400, 'hash required');

    const user = await User.register(login, hash);

    if (user === 'unknown') return send(res, 500, 'unknown error');
    if (user === 'login') return send(res, 400, 'login already exists');

    const s = await Session.create(user);
    res.cookie('token', s.token, { maxAge: sessionLife * 1000 });
    ok(res);
  });

  app.get('/api/user', async (req, res) => {
    const qid = req.query.id as string | undefined;
    const login = req.query.login as string | undefined;
    const token = req.query.token as string | undefined;

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
    if (token) {
      const session = await Session.get(token);
      if (!session) return send(res, 404, 'session not found');
      return ok(res, { user: { id: session.user.id, name: session.user.login } });
    }
    send(res, 400, 'id, login or token required');
  });

  app.delete('/api/session', async (req, res) => {
    const token = req.cookies.token as string | undefined;
    if (!token) return ok(res);

    const session = await Session.get(token);
    if (!session) return ok(res);
    await session.delete();
    res.cookie('token', '', { expires: new Date(0) });
    ok(res);
  });

  app.get('/static/*', (req, res) => {
    const filepath = '.' + req.path;
    if (!fs.existsSync(filepath)) {
      res.status(404).end('404');
      return;
    }
    const file = fs.createReadStream(filepath);
    res.header('Content-Type', mime.getType(filepath) ?? 'application/octet-stream');
    file.pipe(res);
  });

  app.get('/', async (req, res, next) => {
    const token = req.cookies.token as string | undefined;
    const context: any = { script: 'const user = undefined;' };
    if (token) {
      const session = await Session.get(token);
      if (session && !session.expired) {
        const user = session.user;
        context.script = `const user = {id:${user.id}, name:'${user.login}'};`;
      }
    }
    context.title = 'On-G.R.D.';
    res.render('index', context);
  });

  await open('db.db');

  app.listen(8080, () => console.log('started'));
})();
