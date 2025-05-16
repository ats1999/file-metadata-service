import TokenPayload from '../../src/interfaces/TokenPayload';

declare global {
  namespace Express {
    interface Request {
      tokenPayload?: TokenPayload;
      fileId?: string;
    }
  }
}
