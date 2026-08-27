import { S3Util } from '../../utils/s3';
import { logger } from '../../utils/logger';

async function testS3() {
  try {
    console.log('Testing S3 Connection...');
    
    // 1. Test uploading a small test text file
    const sampleBase64 = `data:text/plain;base64,${Buffer.from('Hello S3 from JobMarket! ' + new Date().toISOString()).toString('base64')}`;
    const uploadedUrl = await S3Util.uploadBase64(sampleBase64, 'static', 'test_connection.txt');
    console.log('✅ S3 Upload successful! File URL:', uploadedUrl);

    // 2. Test generating presigned download URL
    const signedUrl = await S3Util.getSignedDownloadUrl(uploadedUrl);
    console.log('✅ S3 Presigned URL generation successful! Signed URL:', signedUrl);

    console.log('🎉 S3 Connection and Permissions are 100% WORKING!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ S3 Connection test failed:', error);
    process.exit(1);
  }
}

testS3();
