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
 * Fast direct-to-Cloudinary upload with signature and progress tracking via XMLHttpRequest.
 */
export async function uploadResumeFast(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; name: string; size: string; type: string }> {
  // Step 1: Compress image if it's an image file
  const processedBlob = await compressImageIfNecessary(file);
  const sizeInMB = (processedBlob.size / (1024 * 1024)).toFixed(2) + ' MB';

  // Step 2: Request upload signature from backend (super fast ~50ms)
  let sigResponse;
  try {
    sigResponse = await apiFetch('/api/v1/auth/resume/signature');
  } catch (err) {
    console.warn('Could not fetch resume signature:', err);
  }

  if (sigResponse && sigResponse.ok) {
    const sigJson = await sigResponse.json();
    if (sigJson.success && sigJson.data) {
      const { signature, timestamp, apiKey, cloudName, folder, publicId } = sigJson.data;

      // Upload directly to Cloudinary via FormData + XMLHttpRequest
      const formData = new FormData();
      formData.append('file', processedBlob, file.name);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      if (folder) formData.append('folder', folder);
      if (publicId) formData.append('public_id', publicId);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      try {
        const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl);

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const res = JSON.parse(xhr.responseText);
              resolve(res.secure_url || res.url);
            } else {
              reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error uploading to Cloudinary'));
          xhr.ontimeout = () => reject(new Error('Upload to Cloudinary timed out'));
          xhr.timeout = 45000; // 45 sec timeout

          xhr.send(formData);
        });

        // Save resume metadata to backend
        const saveRes = await apiFetch('/api/v1/auth/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            size: sizeInMB,
            type: file.type || 'image/jpeg',
            url: cloudinaryUrl
          })
        });

        if (saveRes.ok) {
          return {
            url: cloudinaryUrl,
            name: file.name,
            size: sizeInMB,
            type: file.type || 'image/jpeg'
          };
        }
      } catch (directErr) {
        console.warn('Direct Cloudinary upload error, using fallback:', directErr);
      }
    }
  }

  // Fallback: Read file as base64 and send to POST /api/v1/auth/resume
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(processedBlob as Blob);
  });

  if (onProgress) onProgress(60);

  const fallbackRes = await apiFetch('/api/v1/auth/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: file.name,
      size: sizeInMB,
      type: file.type || 'image/jpeg',
      base64: base64Data
    })
  });

  if (onProgress) onProgress(100);

  if (!fallbackRes.ok) {
    const errData = await fallbackRes.json();
    throw new Error(errData.error || errData.message || 'Failed to upload resume');
  }

  const json = await fallbackRes.json();
  const user = json.data;
  return {
    url: user?.resume?.url || '',
    name: file.name,
    size: sizeInMB,
    type: file.type || 'image/jpeg'
  };
}
