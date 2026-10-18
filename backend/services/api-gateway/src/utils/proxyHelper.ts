import { Request, Response, NextFunction } from 'express';
import http from 'http';
import { logger } from '../../../../shared/utils/logger';

// Persistent High-Throughput HTTP Keep-Alive Agent for Microservice Inter-Service Socket Reuse
const keepAliveAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsec: 10000,
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 30000,
});

export const createServiceProxy = (targetPort: number, fallbackHandler?: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const forwardHeaders: Record<string, any> = {
      ...req.headers,
      host: `127.0.0.1:${targetPort}`,
    };

    const hasBody = Boolean(req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0);
    const bodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    let bodyData: string | null = null;

    if (bodyMethods.includes(req.method) && hasBody) {
      bodyData = JSON.stringify(req.body);
      forwardHeaders['content-type'] = 'application/json';
      forwardHeaders['content-length'] = Buffer.byteLength(bodyData).toString();
    } else if (!hasBody) {
      delete forwardHeaders['content-length'];
    }

    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: targetPort,
      path: req.originalUrl,
      method: req.method,
      agent: keepAliveAgent,
      headers: forwardHeaders,
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

    if (bodyData) {
      proxyReq.write(bodyData);
    }

    proxyReq.end();
  };
};
