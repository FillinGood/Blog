import express from 'express';
import fs from 'fs';
import mime from 'mime';
import path from 'path';
import rootpath from '../rootpath';

const staticRoute = express
  .Router()

  .get('/*', (req, res) => {
    const filepath = rootpath('static' + req.path);
    if (!fs.existsSync(filepath)) {
      res.status(404).end('404');
      return;
    }
    const file = fs.createReadStream(filepath);
    res.header('Content-Type', mime.getType(filepath) ?? 'application/octet-stream');
    file.pipe(res);
  });

export default staticRoute;
