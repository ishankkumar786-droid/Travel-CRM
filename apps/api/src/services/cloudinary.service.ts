import { v2 as cloudinary } from 'cloudinary';

import { logger } from '../lib/logger';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL
 */
export const uploadImage = (fileBuffer: Buffer, folder = 'travel_crm'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Unknown Cloudinary error'));
        }
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};
