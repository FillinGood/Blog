import express from 'express';
import fs from 'fs';
import rootpath from '../rootpath';
import User from '../wrappers/users';

async function checkAccess(page: string, user?: User) {
  if (user) {
    return (await user.checkAccess(page)) || (await user.group.checkAccess(page));
  } else {
    return User.checkGuestAccess(page);
  }
}

const pageRoute = express
  .Router()

  .get('/:page', async (req, res, next) => {
    const filepath = rootpath('views', 'pages', req.params.page + '.ejs');
    if (!fs.existsSync(filepath)) {
      next();
      return;
    }
    req.context.page = req.params.page;
    const access = await checkAccess(req.context.page, req.user);
    if (!access) {
      req.context.page = '403';
    }
    res.render('index', req.context);
  })

  .get('/', (req, res) => {
    req.context.page = 'title';
    res.render('index', req.context);
  });

export default pageRoute;
