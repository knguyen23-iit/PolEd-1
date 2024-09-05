// VERSION 1
// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Create a __dirname variable in ES module context
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = 5000; // You can change this port number if needed

// // Serve static files from the React app
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// // Setup multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Set the directory where files will be saved to "frontend/public/filtered-images"
//     cb(null, path.join(__dirname, '../frontend/public/filtered-images'));
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname); // Keep original file name
//   }
// });

// const upload = multer({ storage: storage });

// // Endpoint to save the image to a folder
// app.post('/upload', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   console.log(`Image saved successfully: ${req.file.filename}`);
//   res.status(200).json({ message: 'Image saved successfully', filename: req.file.filename });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// backend/server.js

// *************************************************************************************************************
// VERSION 2
// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import cors from 'cors';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Use CORS to allow requests from your frontend
// app.use(cors({ origin: 'http://localhost:5173' }));

// // Function to clear the folder
// const clearFolder = (folderPath) => {
//   fs.readdir(folderPath, (err, files) => {
//     if (err) throw err;

//     for (const file of files) {
//       fs.unlink(path.join(folderPath, file), (err) => {
//         if (err) throw err;
//       });
//     }
//   });
// };

// // Endpoint to clear the destination folder
// app.get('/clear-folder', (req, res) => {
//   const folderPath = path.join(__dirname, '../frontend/public/filtered-images');
//   clearFolder(folderPath);
//   res.json({ message: 'Folder cleared successfully!' });
// });

// // Set up Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const destDir = path.join(__dirname, '../frontend/public/filtered-images');
//     cb(null, destDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   }
// });

// // Initialize Multer middleware with the storage configuration
// const upload = multer({ storage });

// // Endpoint for handling image uploads
// app.post('/upload', upload.single('image'), (req, res) => {
//   res.json({ message: 'Image uploaded successfully!', filename: req.file.filename });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// *************************************************************************************************************
// VERSION 3
import sharp from 'sharp';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));

const clearFolder = (folderPath) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(folderPath, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

app.get('/clear-folder', (req, res) => {
  const folderPath = path.join(__dirname, '../frontend/public/filtered-images');
  clearFolder(folderPath);
  res.json({ message: 'Folder cleared successfully!' });
});

const storage = multer.memoryStorage(); // Using memory storage to allow Sharp processing
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  const { buffer, originalname } = req.file;
  const outputFile = path.join(__dirname, '../frontend/public/filtered-images', originalname);

  // Process the image with Sharp
  sharp(buffer)
    .resize(800, 600) // Example resize, adjust as needed
    .jpeg({ quality: 90 }) // Preserve high quality
    .toFile(outputFile, (err, info) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to process image' });
      }
      res.json({ message: 'Image uploaded and processed successfully!', filename: originalname });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

