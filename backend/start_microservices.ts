import dotenv from 'dotenv';
dotenv.config();

import authApp from './services/auth-service/src/app';
import userApp from './services/user-service/src/app';
import jobApp from './services/job-service/src/app';
import applicationApp from './services/application-service/src/app';
import notificationApp from './services/notification-service/src/app';
import supportApp from './services/support-service/src/app';
import adApp from './services/ad-service/src/app';
import adminApp from './services/admin-service/src/app';
import gatewayApp from './services/api-gateway/src/app';
import { checkDatabaseConnection } from './shared/database/pool';
import { connectRedis } from './shared/config/redis';

const gatewayPort = parseInt(process.env.PORT || '5000', 10);

const services = [
  { name: 'Auth Service', app: authApp, port: 5001 },
  { name: 'User Service', app: userApp, port: 5002 },
  { name: 'Job Service', app: jobApp, port: 5003 },
  { name: 'Application Service', app: applicationApp, port: 5004 },
  { name: 'Notification Service', app: notificationApp, port: 5005 },
  { name: 'Support Service', app: supportApp, port: 5006 },
  { name: 'Ad Service', app: adApp, port: 5007 },
  { name: 'Admin Service', app: adminApp, port: 5008 },
  { name: 'API Gateway', app: gatewayApp, port: gatewayPort },
];

console.log('🚀 Launching JobMarket Microservices Architecture Cluster (Memory-Optimized Mode)...');

checkDatabaseConnection().catch(err => console.error('DB Conn Warning:', err));
connectRedis().catch(err => console.warn('Redis Conn Warning:', err));

// Connect Apache Kafka Producer & Background Consumer Worker gracefully
import('./src/config/kafka').then(({ getKafkaProducer }) => {
  getKafkaProducer().catch(() => {});
}).catch(() => {});

import('./src/workers/kafkaConsumerWorker').then(({ startKafkaConsumerWorker }) => {
  startKafkaConsumerWorker().catch(() => {});
}).catch(() => {});

services.forEach((service) => {
  service.app.listen(service.port, () => {
    console.log(`✅ [${service.name}] running on port ${service.port}`);
  });
});
