import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const username = process.env.KAFKA_USERNAME || '';
const password = process.env.KAFKA_PASSWORD || '';
const mechanism = (process.env.KAFKA_SASL_MECHANISM || 'scram-sha-512') as 'scram-sha-512' | 'scram-sha-256' | 'plain';

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'jobmarket-backend',
  brokers,
  ssl: {
    rejectUnauthorized: false,
  },
  sasl: {
    mechanism,
    username,
    password,
  },
  connectionTimeout: 10000,
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
    console.log('✅ Apache Kafka Producer connected successfully (Aiven Cloud)');
    return producer;
  } catch (error: any) {
    console.warn(`⚠️ Kafka Producer connection failed: ${error?.message || error}. Continuing with fallback.`);
    isConnected = false;
    return null;
  }
}

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
    console.warn(`⚠️ Failed to publish event to Kafka topic [${topic}]:`, error?.message || error);
    return false;
  }
}

export function createKafkaConsumer(groupId: string): Consumer {
  return kafka.consumer({
    groupId: `${groupId}-group`,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });
}
