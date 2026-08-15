import { fork } from 'child_process';
import path from 'path';

const services = [
  { name: 'Auth Service', path: path.join(__dirname, 'services/auth-service/src/server.ts'), port: 5001 },
  { name: 'User Service', path: path.join(__dirname, 'services/user-service/src/server.ts'), port: 5002 },
  { name: 'Job Service', path: path.join(__dirname, 'services/job-service/src/server.ts'), port: 5003 },
  { name: 'Application Service', path: path.join(__dirname, 'services/application-service/src/server.ts'), port: 5004 },
  { name: 'Notification Service', path: path.join(__dirname, 'services/notification-service/src/server.ts'), port: 5005 },
  { name: 'Support Service', path: path.join(__dirname, 'services/support-service/src/server.ts'), port: 5006 },
  { name: 'Ad Service', path: path.join(__dirname, 'services/ad-service/src/server.ts'), port: 5007 },
  { name: 'Admin Service', path: path.join(__dirname, 'services/admin-service/src/server.ts'), port: 5008 },
  { name: 'API Gateway', path: path.join(__dirname, 'services/api-gateway/src/server.ts'), port: 5000 },
];

console.log('🚀 Launching JobMarket Microservices Architecture Cluster...');

services.forEach((service) => {
  const isGateway = service.name === 'API Gateway';
  const targetPort = isGateway ? (process.env.PORT || service.port) : service.port;
  const child = fork(service.path, [], {
    execArgv: ['--import', 'tsx'],
    env: { ...process.env, PORT: String(targetPort) },
  });

  child.on('error', (err) => {
    console.error(`❌ [${service.name}] Process Error:`, err);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.warn(`⚠️ [${service.name}] exited with code ${code}`);
    }
  });
});
