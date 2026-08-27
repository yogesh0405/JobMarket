import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { logger } from './logger';
import crypto from 'crypto';

export class S3Util {
  private static client: S3Client | null = null;

  private static getClient(): S3Client {
    if (!this.client) {
      const region = env.AWS_REGION || 'ap-south-1';
      const accessKeyId = env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

      if (!accessKeyId || !secretAccessKey) {
        logger.warn('AWS credentials (AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY) not set in environment.');
      }

      this.client = new S3Client({
        region,
        credentials: {
          accessKeyId: accessKeyId || '',
          secretAccessKey: secretAccessKey || '',
        },
      });
    }
    return this.client;
  }

  private static getBucket(): string {
    const bucket = env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured in environment variables');
    }
    return bucket;
  }

  /**
   * Helper to parse Base64 data URI (e.g. data:image/png;base64,xxxx) into Buffer and ContentType
   */
  private static parseBase64(base64String: string): { buffer: Buffer; contentType: string; extension: string } {
    const matches = base64String.match(/^data:([A-Za-z0-9-+.\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const contentType = matches[1].toLowerCase();
      const buffer = Buffer.from(matches[2], 'base64');
      
      let ext = 'bin';
      if (contentType.includes('pdf')) ext = 'pdf';
      else if (contentType.includes('word') || contentType.includes('docx')) ext = 'docx';
      else if (contentType.includes('msword') || contentType.includes('doc')) ext = 'doc';
      else if (contentType.includes('webp')) ext = 'webp';
      else if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
      else if (contentType.includes('svg')) ext = 'svg';
      else if (contentType.includes('json')) ext = 'json';
      else if (contentType.includes('text')) ext = 'txt';
      else if (contentType.includes('mp4')) ext = 'mp4';
      else {
        const sub = contentType.split('/')[1]?.split(';')[0];
        if (sub) ext = sub;
      }

      return { buffer, contentType, extension: ext };
    }

    // Default fallback if pure base64 without mime header
    return {
      buffer: Buffer.from(base64String, 'base64'),
      contentType: 'application/octet-stream',
      extension: 'bin',
    };
  }

  /**
   * Upload a base64 encoded image/file to S3.
   * @param base64Data Base64 string or Data URI or direct URL
   * @param folder Folder prefix in bucket (e.g. 'profiles', 'resumes', 'company_logos', 'support')
   * @param customKey Optional custom file key or identifier
   */
  static async uploadBase64(base64Data: string, folder: string, customKey?: string): Promise<string> {
    try {
      if (!base64Data) return '';
      
      // If already a remote HTTP URL, return as is
      if (typeof base64Data === 'string' && (base64Data.startsWith('http://') || base64Data.startsWith('https://'))) {
        return base64Data;
      }

      const client = this.getClient();
      const bucket = this.getBucket();
      const { buffer, contentType, extension } = this.parseBase64(base64Data);

      const filename = customKey 
        ? (customKey.includes('.') ? customKey : `${customKey}.${extension}`)
        : `${crypto.randomUUID()}.${extension}`;

      const key = `${folder.replace(/\/$/, '')}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await client.send(command);

      const region = env.AWS_REGION || 'ap-south-1';
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      logger.info(`Successfully uploaded file to S3: ${fileUrl}`);
      return fileUrl;
    } catch (error: any) {
      logger.error('S3 uploadBase64 error:', error);
      throw new Error(`Failed to upload to S3: ${error.message}`);
    }
  }

  /**
   * Upload an image (alias for uploadBase64 for backward compatibility with CloudinaryUtil)
   */
  static async uploadImage(base64Image: string, folder: string, customKey?: string): Promise<string> {
    return this.uploadBase64(base64Image, folder, customKey);
  }

  /**
   * Upload a generic file (alias for uploadBase64 for backward compatibility with CloudinaryUtil)
   */
  static async uploadFile(base64File: string, folder: string, customKey?: string): Promise<string> {
    return this.uploadBase64(base64File, folder, customKey);
  }

  /**
   * Delete an object from S3 by its Key or Full URL
   */
  static async deleteFile(keyOrUrl: string): Promise<void> {
    try {
      if (!keyOrUrl) return;
      const client = this.getClient();
      const bucket = this.getBucket();
      const key = this.extractKey(keyOrUrl);

      if (!key) return;

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await client.send(command);
      logger.info(`Successfully deleted file from S3: ${key}`);
    } catch (error: any) {
      logger.error(`S3 deleteFile failure for ${keyOrUrl}:`, error);
      // Non-blocking error for delete
    }
  }

  /**
   * Delete image alias
   */
  static async deleteImage(keyOrUrl: string): Promise<void> {
    return this.deleteFile(keyOrUrl);
  }

  /**
   * Generate a Presigned Download URL for private files (e.g. Resumes, Support attachments)
   * @param keyOrUrl The S3 key or full URL
   * @param expiresInSeconds Expiration time in seconds (default 15 minutes)
   */
  static async getSignedDownloadUrl(keyOrUrl: string, expiresInSeconds: number = 900): Promise<string> {
    try {
      if (!keyOrUrl) return '';
      // If it's already a signed URL or not an S3 file, return as is
      if (keyOrUrl.includes('X-Amz-Signature') || keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://res.cloudinary.com')) {
        return keyOrUrl;
      }

      const client = this.getClient();
      const bucket = this.getBucket();
      const key = this.extractKey(keyOrUrl);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
      return presignedUrl;
    } catch (error: any) {
      logger.error('Failed to generate presigned download URL:', error);
      return keyOrUrl;
    }
  }

  /**
   * Generate a Presigned Upload URL for direct frontend client uploads
   */
  static async getPresignedUploadUrl(folder: string, filename: string, contentType: string, expiresInSeconds: number = 300) {
    try {
      const client = this.getClient();
      const bucket = this.getBucket();
      const key = `${folder.replace(/\/$/, '')}/${crypto.randomUUID()}_${filename}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
      const region = env.AWS_REGION || 'ap-south-1';
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      return {
        uploadUrl,
        key,
        fileUrl,
      };
    } catch (error: any) {
      logger.error('Failed to generate presigned upload URL:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Extract the S3 Object Key from a full URL or relative path
   * e.g. https://bucket.s3.region.amazonaws.com/profiles/avatar.png -> profiles/avatar.png
   */
  static extractKey(urlOrKey: string): string {
    if (!urlOrKey) return '';
    try {
      if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
        const url = new URL(urlOrKey);
        // pathname starts with '/' so remove leading slash
        return decodeURIComponent(url.pathname.replace(/^\//, ''));
      }
      return urlOrKey.replace(/^\//, '');
    } catch (e) {
      return urlOrKey;
    }
  }

  /**
   * Backward compatibility helper for extracting identifier
   */
  static extractPublicId(url: string): string | null {
    return this.extractKey(url) || null;
  }
}
