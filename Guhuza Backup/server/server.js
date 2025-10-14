// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary directories
const dirs = ['./data', './uploads'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize data files
const initDataFiles = () => {
  const jobsFile = './data/jobs.json';
  const usersFile = './data/users.json';
  
  if (!fs.existsSync(jobsFile)) {
    fs.writeFileSync(jobsFile, JSON.stringify([]));
  }
  
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([
      { email: 'employer@guhuza.com', name: 'Demo Employer' }
    ]));
  }
};

initDataFiles();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /txt|doc|docx|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only TXT, DOC, DOCX, and PDF files are allowed!');
    }
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const analyzeRoutes = require('./routes/analyze');
const jobsRoutes = require('./routes/jobs');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/jobs', jobsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Guhuza JD Optimizer API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});