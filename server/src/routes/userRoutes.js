const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload dir exists and is writable
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer with error handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// Avatar upload route with EPIPE handling
router.put('/avatar', authenticateToken, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
      }
      if (err.code === 'EPIPE' || err.message.includes('ENOSPC') || err.message.includes('pipe')) {
        logger.error('Upload pipe error:', err);
        return res.status(500).json({ success: false, message: 'Upload interrupted. Please try again.' });
      }
      logger.error('Upload error:', err);
      return res.status(500).json({ success: false, message: 'Upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
      const user = req.user;
      user.avatar = req.file.path;
      await user.save();

      res.json({
        success: true,
        data: { avatarUrl: `/uploads/avatars/${req.file.filename}` }
      });
    } catch (saveError) {
      // Cleanup file on save error
      fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, message: 'Failed to save avatar.' });
    }
  });
});
