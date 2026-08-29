import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { env } from './env';
import { logger } from '../utils/logger';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const username = process.env.KAFKA_USERNAME || '';
const password = process.env.KAFKA_PASSWORD || '';
const mechanism = (process.env.KAFKA_SASL_MECHANISM || 'scram-sha-512') as any;

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'jobmarket-backend',
  brokers,
  ssl: process.env.KAFKA_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  ...(username && password ? {
    sasl: {
      mechanism,
      username,
      password,
    } as any,
  } : {}),
  connectionTimeout: 15000,
  requestTimeout: 60000,
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
  },
  logLevel: logLevel.ERROR,
});

export const TOPICS = {
  NOTIFICATIONS: 'notifications-topic',
  SUPPORT_CHAT: 'support-chat-topic',
  JOB_EVENTS: 'job-events',
  AUTH_EVENTS: 'auth-events',
} as const;

let producer: Producer | null = null;
let isConnected = false;

/**
 * Initialize and connect Kafka Producer
 */
export async function getKafkaProducer(): Promise<Producer | null> {
  if (producer && isConnected) {
    return producer;
  }

  try {
    producer = kafka.producer({
      allowAutoTopicCreation: true,
    });

    await producer.connect();
    isConnected = true;
    logger.info('✅ Apache Kafka Producer connected successfully (Aiven Cloud)');
    return producer;
  } catch (error: any) {
    logger.warn(`⚠️ Kafka Producer connection failed: ${error?.message || error}. Continuing with in-memory processing.`);
    isConnected = false;
    return null;
  }
}

/**
 * Publish an event to a Kafka topic safely with fallback
 */
export async function publishKafkaEvent(topic: string, eventData: any, key?: string): Promise<boolean> {
  try {
    const prod = await getKafkaProducer();
    if (!prod) return false;

    const payload = typeof eventData === 'string' ? eventData : JSON.stringify(eventData);
    await prod.send({
      topic,
      messages: [
        {
          key: key || `key_${Date.now()}`,
          value: payload,
          timestamp: Date.now().toString(),
        },
      ],
    });

    return true;
  } catch (error: any) {
    logger.warn(`⚠️ Failed to publish event to Kafka topic [${topic}]:`, error?.message || error);
    return false;
  }
}

/**
 * Create a specialized Kafka Consumer
 */
export function createKafkaConsumer(groupId: string): Consumer {
  return kafka.consumer({
    groupId: `${groupId}-group`,
    sessionTimeout: 45000,
    rebalanceTimeout: 60000,
    heartbeatInterval: 3000,
    maxWaitTimeInMs: 5000,
    retry: {
      retries: 10,
      initialRetryTime: 500,
      maxRetryTime: 30000,
    },
  });
}
