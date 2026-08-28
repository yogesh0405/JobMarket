import { apiFetch } from './api';

export interface UploadProgressCallback {
  (percent: number): void;
}

/**
 * Compresses image files (JPG, PNG, WebP) on the client side using HTML5 Canvas.
 * Reduces multi-MB phone photos down to ~200KB-400KB in milliseconds, saving massive bandwidth.
 */
export async function compressImageIfNecessary(file: File, maxDimension = 1600, quality = 0.82): Promise<Blob | File> {
  if (!file.type.startsWith('image/')) {
    return file; // Skip compression for PDF / DOCX
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file); // If compressed blob is somehow larger, keep original
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * High-Throughput S3 Resume Upload with client pre-compression, direct S3 streaming & fallback.
 */
export async function uploadResumeFast(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; name: string; size: string; type: string }> {
  // Step 1: Compress image if it's an image file
  if (onProgress) onProgress(15);
  const processedBlob = await compressImageIfNecessary(file);
  const sizeInMB = (processedBlob.size / (1024 * 1024)).toFixed(2) + ' MB';
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
  const contentType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');

  // Step 2: Attempt Direct-to-S3 Presigned Upload (Bypasses server RAM & proxy bottleneck)
  try {
    if (onProgress) onProgress(30);
    const sigRes = await apiFetch(`/api/v1/auth/resume/signature?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(contentType)}`);
    if (sigRes.ok) {
      const sigJson = await sigRes.json();
      const presigned = sigJson.data;

      if (presigned && presigned.uploadUrl && presigned.fileUrl) {
        if (onProgress) onProgress(55);

        const s3UploadRes = await fetch(presigned.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: processedBlob,
        });

        if (s3UploadRes.ok) {
          if (onProgress) onProgress(85);

          // Save direct S3 URL to user profile
          const saveRes = await apiFetch('/api/v1/auth/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: presigned.fileUrl,
              name: file.name,
              fileName: file.name,
              size: sizeInMB,
              type: contentType,
            }),
          });

          if (saveRes.ok) {
            if (onProgress) onProgress(100);
            return {
              url: presigned.fileUrl,
              name: file.name,
              size: sizeInMB,
              type: contentType,
            };
          }
        }
      }
    }
  } catch (directErr) {
    // Direct presigned upload failed or unsupported in dev, fallback seamlessly to backend payload
  }

  // Step 3: Resilient Fallback via Backend Base64 Upload
  if (onProgress) onProgress(60);
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(processedBlob as Blob);
  });

  if (onProgress) onProgress(80);

  const res = await apiFetch('/api/v1/auth/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: file.name,
      fileName: file.name,
      size: sizeInMB,
      type: contentType,
      base64: base64Data,
      file: base64Data,
    }),
  });

  if (onProgress) onProgress(100);

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || errData.message || 'Failed to upload resume to S3');
  }

  const json = await res.json();
  const user = json.data;
  return {
    url: json.url || user?.resume?.url || '',
    name: file.name,
    size: sizeInMB,
    type: contentType,
  };
}
