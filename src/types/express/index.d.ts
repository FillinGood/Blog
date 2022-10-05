import { PageContext } from '../../types';

export {};

declare global {
  namespace Express {
    export interface Request {
      context: PageContext;
    }
    export interface Response {
      answer(code: number, answer: string, data?: object): void;
      answerOk(data?: object): void;
    }
  }
}
