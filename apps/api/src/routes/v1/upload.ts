import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../../controllers/upload.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Protect route with authentication
router.use(authenticate);

router.post('/', upload.single('file'), uploadFile);

export default router;
