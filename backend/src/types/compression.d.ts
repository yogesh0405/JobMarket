declare module 'compression' {
  import { RequestHandler } from 'express';
  function compression(options?: any): RequestHandler;
  namespace compression {
    function filter(req: any, res: any): boolean;
  }
  export = compression;
}
