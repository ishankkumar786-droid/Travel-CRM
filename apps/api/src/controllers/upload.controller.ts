import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadImage } from '../services/cloudinary.service';
import { AppError } from '../errors/AppError';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'BAD_REQUEST', 'No file uploaded');
  }

  // Ensure it's an image
  if (!req.file.mimetype.startsWith('image/')) {
    throw new AppError(400, 'BAD_REQUEST', 'Only image files are allowed');
  }

  // Upload to Cloudinary
  const imageUrl = await uploadImage(req.file.buffer);

  res.status(200).json({
    status: 'success',
    data: {
      url: imageUrl,
    },
  });
});
