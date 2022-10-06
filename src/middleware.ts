import express from 'express';
import Session, { sessionLife } from './sessions';

export async function sessionMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.cookies.token as string | undefined;
  req.context = {
    title: 'On-G.R.D.',
    page: 'title',
    user: null
  };
  if (token) {
    const session = await Session.get(token);
    if (session) {
      if (session.expired) {
        await session.delete();
        res.cookie('token', '', { maxAge: -1 });
      } else {
        await session.refresh();
        res.cookie('token', session.token, { maxAge: sessionLife * 1000 });
        const user = session.user;
        req.context.user = { id: user.id, name: user.login };
      }
    } else {
      res.cookie('token', '', { maxAge: -1 });
    }
  }
  next();
}

export function logMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const now = new Date();
  const time = [
    String(now.getDate()).padStart(2, '0'),
    '.',
    String(now.getMonth() + 1).padStart(2, '0'),
    '.',
    String(now.getFullYear()).padStart(4, '0'),
    ' ',
    String(now.getHours()).padStart(2, '0'),
    ':',
    String(now.getMinutes()).padStart(2, '0'),
    ':',
    String(now.getSeconds()).padStart(2, '0'),
    '.',
    String(now.getMilliseconds()).padStart(3, '0')
  ].join('');
  const ip = req.ip;
  const method = req.method;
  const path = req.path;
  console.log(`[${time}] ${ip} ${method} ${path}`);
  next();
}
