import express from 'express';
import Session, { sessionLife } from '../wrappers/sessions';
import User from '../wrappers/users';
import { validate } from '../validation';

const apiRoute = express
  .Router()
  .post('/login', async (req, res) => {
    const login = validate.required.notEmpty.string('login', req.body.login);
    const hash = validate.required.notEmpty.string('hash', req.body.hash);

    const user = await User.auth(login, hash);
    if (!user) return res.answer(401, 'wrong login or password');

    const s = await Session.create(user);
    res.cookie('token', s.token, { maxAge: sessionLife * 1000 });
    res.answerOk();
  })

  .put('/user', async (req, res) => {
    const login = validate.required.notEmpty.string('login', req.body.login);
    const hash = validate.required.notEmpty.string('hash', req.body.hash);

    const user = await User.register(login, hash);

    if (user === 'unknown') return res.answer(500, 'unknown error');
    if (user === 'login') return res.answer(400, 'login already exists');

    const s = await Session.create(user);
    res.cookie('token', s.token, { maxAge: sessionLife * 1000 });
    res.answerOk();
  })

  .get('/user', async (req, res) => {
    const qid = req.query.id as string | undefined;
    const login = req.query.login as string | undefined;
    const token = req.query.token as string | undefined;

    if (qid) {
      const id = +qid;
      if (isNaN(id)) return res.answer(400, 'id must be a number');

      const user = await User.get(id);
      if (!user) return res.answer(404, 'user not found');
      return res.answerOk({ user: { id: user.id, name: user.login } });
    }
    if (login) {
      const user = await User.find(login);
      if (!user) return res.answer(404, 'user not found');
      return res.answerOk({ user: { id: user.id, name: user.login } });
    }
    if (token) {
      const session = await Session.get(token);
      if (!session) return res.answer(404, 'session not found');
      return res.answerOk({ user: { id: session.user.id, name: session.user.login } });
    }
    res.answer(400, 'id, login or token required');
  })

  .delete('/session', async (req, res) => {
    const token = req.cookies.token as string | undefined;
    if (!token) return res.answerOk();

    const session = await Session.get(token);
    if (!session) return res.answerOk();
    await session.delete();
    res.cookie('token', '', { expires: new Date(0) });
    res.answerOk();
  });

export default apiRoute;
