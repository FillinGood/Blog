import express from 'express';
import methods from 'methods';

express.response.answer = function (code, message, data) {
  this.status(code);
  this.json({ code, message, ...data });
};

express.response.answerOk = function (data) {
  this.answer(200, 'OK', data);
};

// ----- Patch express to handle async handlers properly -----
type AsyncHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;

/** Patch handler to handle promises properly */
function patchHandler(fn: express.RequestHandler): AsyncHandler {
  return async (req, res, next) => {
    try {
      // If fn is async, wait for it
      // Otherwise... it will immediately be 'awaited'
      // TS laughs at 'await' for synchronous function, but it's clueless
      return await (fn(req, res, next) as any);
    } catch (err: any) {
      // both sync and async errors now will be properly passed to error handler!
      next(err);
    }
  };
}

// This crudely replaces express' functions with our Brand New Async Handlers(tm)!
// Code is honestly copied from Express 4 source with a cherry on top
(methods as string[]).concat('all').forEach(function (method) {
  // TS freaks out about random member access, but it's clueless
  (express.Router as any)[method] = function (path: string, ...handlers: AsyncHandler[]) {
    var route = this.route(path);
    // -----------------------------------------\/ a cherry
    route[method].apply(route, handlers.map(patchHandler));
    return this;
  };
});
// -----------------------------------------------------------
