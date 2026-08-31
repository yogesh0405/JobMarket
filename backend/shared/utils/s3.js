"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Util = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_1 = require("../config/env");
const logger_1 = require("./logger");
const crypto_1 = __importDefault(require("crypto"));
class S3Util {
    static client = null;
    static getClient() {
        if (!this.client) {
            const region = env_1.env.AWS_REGION || 'ap-south-1';
            const accessKeyId = env_1.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = env_1.env.AWS_SECRET_ACCESS_KEY;
            if (!accessKeyId || !secretAccessKey) {
                logger_1.logger.warn('AWS credentials (AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY) not set in environment.');
            }
            this.client = new client_s3_1.S3Client({
                region,
                credentials: {
                    accessKeyId: accessKeyId || '',
                    secretAccessKey: secretAccessKey || '',
                },
            });
        }
        return this.client;
    }
    static getBucket() {
        const bucket = env_1.env.AWS_S3_BUCKET_NAME;
        if (!bucket) {
            throw new Error('AWS_S3_BUCKET_NAME is not configured in environment variables');
        }
        return bucket;
    }
    /**
     * Helper to parse Base64 data URI (e.g. data:image/png;base64,xxxx) into Buffer and ContentType
     */
    static parseBase64(base64String) {
        const matches = base64String.match(/^data:([A-Za-z0-9-+.\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const contentType = matches[1].toLowerCase();
            const buffer = Buffer.from(matches[2], 'base64');
            let ext = 'bin';
            if (contentType.includes('pdf'))
                ext = 'pdf';
            else if (contentType.includes('word') || contentType.includes('docx'))
                ext = 'docx';
            else if (contentType.includes('msword') || contentType.includes('doc'))
                ext = 'doc';
            else if (contentType.includes('webp'))
                ext = 'webp';
            else if (contentType.includes('png'))
                ext = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg'))
                ext = 'jpg';
            else if (contentType.includes('svg'))
                ext = 'svg';
            else if (contentType.includes('json'))
                ext = 'json';
            else if (contentType.includes('text'))
                ext = 'txt';
            else if (contentType.includes('mp4'))
                ext = 'mp4';
            else {
                const sub = contentType.split('/')[1]?.split(';')[0];
                if (sub)
                    ext = sub;
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
    static async uploadBase64(base64Data, folder, customKey) {
        try {
            if (!base64Data)
                return '';
            // If already a remote HTTP URL, return as is
            if (typeof base64Data === 'string' && (base64Data.startsWith('http://') || base64Data.startsWith('https://'))) {
                return base64Data;
            }
            const client = this.getClient();
            const bucket = this.getBucket();
            const { buffer, contentType, extension } = this.parseBase64(base64Data);
            const filename = customKey
                ? (customKey.includes('.') ? customKey : `${customKey}.${extension}`)
                : `${crypto_1.default.randomUUID()}.${extension}`;
            const key = `${folder.replace(/\/$/, '')}/${filename}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            });
            await client.send(command);
            const region = env_1.env.AWS_REGION || 'ap-south-1';
            const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            logger_1.logger.info(`Successfully uploaded file to S3: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            logger_1.logger.error('S3 uploadBase64 error:', error);
            throw new Error(`Failed to upload to S3: ${error.message}`);
        }
    }
    /**
     * Download image from a remote URL (e.g. Google profile photo) and upload permanently to S3.
     */
    static async uploadFromUrl(remoteUrl, folder, customKey) {
        try {
            if (!remoteUrl)
                return '';
            const bucket = this.getBucket();
            const region = env_1.env.AWS_REGION || 'ap-south-1';
            // If already stored in our S3 bucket, don't re-upload
            if (remoteUrl.includes(bucket) || (remoteUrl.includes('amazonaws.com') && remoteUrl.includes('profiles/'))) {
                return remoteUrl;
            }
            const response = await fetch(remoteUrl);
            if (!response.ok) {
                logger_1.logger.warn(`Failed to fetch image from URL: ${remoteUrl} (${response.statusText})`);
                return remoteUrl;
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            let ext = 'jpg';
            if (contentType.includes('webp'))
                ext = 'webp';
            else if (contentType.includes('png'))
                ext = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg'))
                ext = 'jpg';
            const filename = customKey
                ? (customKey.includes('.') ? customKey : `${customKey}.${ext}`)
                : `avatar_${crypto_1.default.randomUUID()}_${Date.now()}.${ext}`;
            const key = `${folder.replace(/\/$/, '')}/${filename}`;
            const client = this.getClient();
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            });
            await client.send(command);
            const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            logger_1.logger.info(`Successfully mirrored avatar to S3: ${s3Url}`);
            return s3Url;
        }
        catch (error) {
            logger_1.logger.error('S3 uploadFromUrl error:', error);
            return remoteUrl;
        }
    }
    /**
     * Upload an image (alias for uploadBase64 for backward compatibility with CloudinaryUtil)
     */
    static async uploadImage(base64Image, folder, customKey) {
        return this.uploadBase64(base64Image, folder, customKey);
    }
    /**
     * Upload a generic file (alias for uploadBase64 for backward compatibility with CloudinaryUtil)
     */
    static async uploadFile(base64File, folder, customKey) {
        return this.uploadBase64(base64File, folder, customKey);
    }
    /**
     * Delete an object from S3 by its Key or Full URL
     */
    static async deleteFile(keyOrUrl) {
        try {
            if (!keyOrUrl)
                return;
            const client = this.getClient();
            const bucket = this.getBucket();
            const key = this.extractKey(keyOrUrl);
            if (!key)
                return;
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await client.send(command);
            logger_1.logger.info(`Successfully deleted file from S3: ${key}`);
        }
        catch (error) {
            logger_1.logger.error(`S3 deleteFile failure for ${keyOrUrl}:`, error);
            // Non-blocking error for delete
        }
    }
    /**
     * Delete image alias
     */
    static async deleteImage(keyOrUrl) {
        return this.deleteFile(keyOrUrl);
    }
    /**
     * Generate a Presigned Download URL for private files (e.g. Resumes, Support attachments)
     * @param keyOrUrl The S3 key or full URL
     * @param expiresInSeconds Expiration time in seconds (default 15 minutes)
     */
    static async getSignedDownloadUrl(keyOrUrl, expiresInSeconds = 900) {
        try {
            if (!keyOrUrl)
                return '';
            // If it's already a signed URL or not an S3 file, return as is
            if (keyOrUrl.includes('X-Amz-Signature') || keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://res.cloudinary.com')) {
                return keyOrUrl;
            }
            const client = this.getClient();
            const bucket = this.getBucket();
            const key = this.extractKey(keyOrUrl);
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: expiresInSeconds });
            return presignedUrl;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate presigned download URL:', error);
            return keyOrUrl;
        }
    }
    /**
     * Generate a Presigned Upload URL for direct frontend client uploads
     */
    static async getPresignedUploadUrl(folder, filename, contentType, expiresInSeconds = 300) {
        try {
            const client = this.getClient();
            const bucket = this.getBucket();
            const key = `${folder.replace(/\/$/, '')}/${crypto_1.default.randomUUID()}_${filename}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: contentType,
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: expiresInSeconds });
            const region = env_1.env.AWS_REGION || 'ap-south-1';
            const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            return {
                uploadUrl,
                key,
                fileUrl,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate presigned upload URL:', error);
            throw new Error(`Failed to generate upload URL: ${error.message}`);
        }
    }
    /**
     * Extract the S3 Object Key from a full URL or relative path
     * e.g. https://bucket.s3.region.amazonaws.com/profiles/avatar.png -> profiles/avatar.png
     */
    static extractKey(urlOrKey) {
        if (!urlOrKey)
            return '';
        try {
            if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
                const url = new URL(urlOrKey);
                // pathname starts with '/' so remove leading slash
                return decodeURIComponent(url.pathname.replace(/^\//, ''));
            }
            return urlOrKey.replace(/^\//, '');
        }
        catch (e) {
            return urlOrKey;
        }
    }
    /**
     * Backward compatibility helper for extracting identifier
     */
    static extractPublicId(url) {
        return this.extractKey(url) || null;
    }
}
exports.S3Util = S3Util;
