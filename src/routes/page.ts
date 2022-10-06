import express from 'express';
import fs from 'fs';
import rootpath from '../rootpath';

const pageRoute = express
  .Router()

  .get('/:page', async (req, res, next) => {
    const filepath = rootpath('views', 'pages', req.params.page + '.ejs');
    if (!fs.existsSync(filepath)) {
      next();
      return;
    }
    req.context.page = req.params.page;
    res.render('index', req.context);
  })

  .get('/', (req, res) => {
    req.context.page = 'title';
    res.render('index', req.context);
  });

export default pageRoute;
