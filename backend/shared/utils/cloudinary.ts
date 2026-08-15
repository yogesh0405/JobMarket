import { env } from '../config/env';
import crypto from 'crypto';
import { logger } from './logger';

const parseCloudinaryUrl = () => {
  const url = env.CLOUDINARY_URL;
  const regex = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;
  const match = url.match(regex);
  if (!match) {
    throw new Error('Invalid CLOUDINARY_URL configuration format');
  }
  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
};

const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();

export class CloudinaryUtil {
  static getUploadSignature(folder: string, publicId?: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, any> = {
      folder,
      timestamp,
    };

    if (publicId) {
      params.public_id = publicId;
    }

    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      publicId,
    };
  }

  static async uploadImage(base64Image: string, folder: string, publicId?: string): Promise<string> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const params: Record<string, any> = {
        folder,
        timestamp,
      };

      if (publicId) {
        params.public_id = publicId;
      }

      const sortedKeys = Object.keys(params).sort();
      const stringToSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const payload = {
        file: base64Image,
        api_key: apiKey,
        signature,
        ...params,
      };

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        logger.error('Cloudinary API upload error details:', data);
        throw new Error(data.error?.message || 'Cloudinary server responded with an error');
      }

      logger.info(`Successfully uploaded profile image to Cloudinary: ${data.secure_url}`);
      return data.secure_url;
    } catch (error: any) {
      logger.error('Cloudinary upload failure:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const payload = {
        public_id: publicId,
        api_key: apiKey,
        timestamp,
        signature,
      };

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok || (data.result !== 'ok' && data.result !== 'not_found')) {
        logger.error('Cloudinary API delete error details:', data);
        throw new Error(data.error?.message || `Cloudinary delete status: ${data.result}`);
      }

      logger.info(`Successfully deleted profile image from Cloudinary (publicId: ${publicId}). Result: ${data.result}`);
    } catch (error: any) {
      logger.error('Cloudinary delete failure:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  static async uploadFile(base64File: string, folder: string, publicId?: string): Promise<string> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const params: Record<string, any> = {
        folder,
        timestamp,
      };

      if (publicId) {
        params.public_id = publicId;
      }

      const sortedKeys = Object.keys(params).sort();
      const stringToSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const payload = {
        file: base64File,
        api_key: apiKey,
        signature,
        ...params,
      };

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok || data.error) {
        logger.error('Cloudinary API upload file error details:', data);
        throw new Error(data.error?.message || `Cloudinary status: ${response.status}`);
      }

      logger.info(`Successfully uploaded file to Cloudinary (URL: ${data.secure_url})`);
      return data.secure_url;
    } catch (error: any) {
      logger.error('Cloudinary upload file failure:', error);
      throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
  }

  static async deleteFile(publicId: string, resourceType: string = 'raw'): Promise<void> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const params: Record<string, any> = {
        public_id: publicId,
        timestamp,
      };

      const sortedKeys = Object.keys(params).sort();
      const stringToSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const payload = {
        api_key: apiKey,
        signature,
        ...params,
      };

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as any;
      const resResult = (data?.result || '').toLowerCase().trim();
      if (!response.ok || (resResult !== 'ok' && resResult !== 'not_found' && resResult !== 'not found')) {
        logger.error('Cloudinary API delete file error details:', data);
        throw new Error(data?.error?.message || `Cloudinary delete status: ${data?.result}`);
      }

      logger.info(`Successfully deleted file from Cloudinary (publicId: ${publicId}). Result: ${data.result}`);
    } catch (error: any) {
      logger.error('Cloudinary delete file failure:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/(?:image|raw|auto|video)\/upload\/(?:v\d+\/)?([^.]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (err) {
      logger.error('Failed to parse Cloudinary URL publicId:', err);
      return null;
    }
  }
}
