import express from 'express';

express.response.answer = function (code, message, data) {
  this.status(code);
  this.json({ code, message, ...data });
};

express.response.answerOk = function (data) {
  this.answer(200, 'OK', data);
};
