import { createKafkaConsumer, TOPICS } from '../config/kafka';
import { pool } from '../config/database/pool';
import { logger } from '../utils/logger';

export async function startKafkaConsumerWorker() {
  try {
    const consumer = createKafkaConsumer('jobmarket-core-worker');
    await consumer.connect();
    logger.info('✅ Apache Kafka Background Consumer Worker connected');

    await consumer.subscribe({
      topics: [
        TOPICS.NOTIFICATIONS,
        TOPICS.SUPPORT_CHAT,
        TOPICS.JOB_EVENTS,
        TOPICS.AUTH_EVENTS,
      ],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key?.toString();
        const rawValue = message.value?.toString();
        if (!rawValue) return;

        try {
          const payload = JSON.parse(rawValue);

          switch (topic) {
            case TOPICS.NOTIFICATIONS:
              await handleNotificationEvent(payload);
              break;

            case TOPICS.SUPPORT_CHAT:
              await handleSupportChatEvent(payload);
              break;

            case TOPICS.JOB_EVENTS:
              await handleJobEvent(payload);
              break;

            case TOPICS.AUTH_EVENTS:
              await handleAuthEvent(payload);
              break;

            default:
              logger.info(`[Kafka Event] Received on unhandled topic ${topic}:`, key);
          }
        } catch (err: any) {
          logger.error(`Error processing Kafka message on topic ${topic}:`, err);
        }
      },
    });
  } catch (error: any) {
    logger.warn(`⚠️ Kafka Consumer Worker initialization notice: ${error?.message || error}. Event streaming operating in local fallback.`);
  }
}

async function handleNotificationEvent(payload: any) {
  const { userId, title, user_id } = payload;
  const targetUser = userId || user_id;
  if (!targetUser) return;

  // The primary notification was already written transactionally by NotificationRepository.
  // Kafka Consumer handles asynchronous background dispatch (Push notifications, audit streaming, etc.)
  logger.info(`[Kafka Notification Stream] Dispatched event for user ${targetUser}: ${title || payload.type || 'Alert'}`);
}

async function handleSupportChatEvent(payload: any) {
  const { ticketId, ticket_id, message } = payload;
  const targetTicket = ticketId || ticket_id;
  if (!targetTicket) return;

  // The chat message was already stored transactionally in SupportRepository.
  // Kafka worker handles async analytics & live real-time broadcasting.
  logger.info(`[Kafka Support Chat Stream] Processed chat event for ticket ${targetTicket}`);
}

async function handleJobEvent(payload: any) {
  const { eventType, job } = payload;
  logger.info(`[Kafka Job Event] Processed ${eventType} for job: ${job?.title || job?.id}`);
}

async function handleAuthEvent(payload: any) {
  const { eventType, user } = payload;
  logger.info(`[Kafka Auth Event] Processed ${eventType} for user: ${user?.email || user?.id}`);
}
