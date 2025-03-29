import { Request } from 'express';
import * as session from 'express-session';

declare global {
  namespace Express {
    interface Request {
      session: session.Session & { userId?: string };
    }
  }
}

export {}; 
