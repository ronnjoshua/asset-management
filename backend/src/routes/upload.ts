import { Router, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadImage, uploadMultipleImages, deleteImage } from '../services/cloudinary';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload single image
router.post(
  '/single',
  authenticate,
  upload.single('image'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image provided' });
        return;
      }

      const folder = req.body.folder || 'petshop';
      const result = await uploadImage(req.file.buffer, folder);

      res.json(result);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

// Upload multiple images
router.post(
  '/multiple',
  authenticate,
  upload.array('images', 10),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No images provided' });
        return;
      }

      const folder = req.body.folder || 'petshop';
      const buffers = files.map((file) => file.buffer);
      const results = await uploadMultipleImages(buffers, folder);

      res.json(results);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

// Delete image
router.delete('/:publicId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await deleteImage(publicId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
