import express from 'express';

const route404 = express
  .Router()

  .get('*', (req, res) => {
    req.context.page = '404';
    res.render('index', req.context);
  })

  .all('*', (req, res) => {
    res.answer(404, 'not found');
  });

export default route404;
