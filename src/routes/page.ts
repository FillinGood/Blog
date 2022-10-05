import express from 'express';
import fs from 'fs';

const pageRoute = express
  .Router()

  .get('/', (req, res) => {
    req.context.page = 'title';
    res.render('index', req.context);
  })
  .get('/page/:page', async (req, res, next) => {
    if (!fs.existsSync('./views/pages/' + req.params.page)) {
      next();
      return;
    }
    req.context.page = req.params.page;
    res.render('index', req.context);
  });

export default pageRoute;
