import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Create a __dirname variable in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000; // You can change this port number if needed

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Setup multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the directory where files will be saved to "frontend/public/filtered-images"
    cb(null, path.join(__dirname, '../frontend/public/filtered-images'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original file name
  }
});

const upload = multer({ storage: storage });

// Endpoint to save the image to a folder
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  console.log(`Image saved successfully: ${req.file.filename}`);
  res.status(200).json({ message: 'Image saved successfully', filename: req.file.filename });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
