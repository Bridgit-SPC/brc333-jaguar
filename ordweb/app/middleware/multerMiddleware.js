// middleware/multerMiddleware.js
import multer from 'multer';

// Configure multer to specify where to store uploaded files and other options
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

export default upload;

