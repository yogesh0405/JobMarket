import { Request, Response, NextFunction } from 'express';
import http from 'http';
import { logger } from '../../../../shared/utils/logger';

export const createServiceProxy = (targetPort: number, fallbackHandler?: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: targetPort,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${targetPort}`,
      },
      timeout: 15000,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      if (fallbackHandler) {
        return fallbackHandler(req, res, next);
      }
      logger.error(`Proxy connection error to port ${targetPort} on ${req.originalUrl}:`, err);
      res.status(503).json({
        success: false,
        message: 'Service Temporarily Unavailable',
        data: null,
        errors: ['SERVICE_UNAVAILABLE'],
      });
    });

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }

    proxyReq.end();
  };
};
