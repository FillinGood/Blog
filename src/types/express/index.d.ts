import { PageContext } from '../../types';

export {};

declare global {
  namespace Express {
    export interface Request {
      context: PageContext;
    }
  }
}
