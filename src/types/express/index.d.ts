import { PageContext } from '../../types';
import User from '../../wrappers/users';

export {};

declare global {
  namespace Express {
    export interface Request {
      context: PageContext;
      user?: User;
    }
    export interface Response {
      answer(code: number, answer: string, data?: object): void;
      answerOk(data?: object): void;
    }
  }
}
