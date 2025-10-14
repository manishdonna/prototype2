// server/routes/analyze.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { analyzeJobDescription, generateJobDescription } = require('../utils/aiService');

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /txt|doc|docx|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb('Error: Only TXT, DOC, DOCX, and PDF files are allowed!');
    }
  }
});

// Parse file content
async function parseFile(filePath, mimetype) {
  try {
    if (mimetype.includes('text/plain')) {
      // TXT file
      return fs.readFileSync(filePath, 'utf8');
    } else if (mimetype.includes('wordprocessing') || filePath.endsWith('.docx')) {
      // DOCX file
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype.includes('pdf') || filePath.endsWith('.pdf')) {
      // PDF file
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error('Failed to parse file content');
  }
}

// Smart Builder - Generate JD from minimal input
router.post('/smart-builder', async (req, res) => {
  try {
    const formData = req.body;
    
    if (!formData.jobTitle) {
      return res.status(400).json({
        success: false,
        error: 'Job title is required'
      });
    }
    
    const analysis = await generateJobDescription(formData);
    
    res.json({
      success: true,
      analysis,
      message: 'Job description generated successfully'
    });
  } catch (error) {
    console.error('Smart builder error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate job description'
    });
  }
});

// Manual Entry - Analyze pasted text
router.post('/manual-entry', async (req, res) => {
  try {
    const { jdText } = req.body;
    
    if (!jdText || jdText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job description text is required'
      });
    }
    
    const analysis = await analyzeJobDescription(jdText);
    
    res.json({
      success: true,
      analysis,
      originalText: jdText,
      message: 'Analysis completed successfully'
    });
  } catch (error) {
    console.error('Manual entry analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze job description'
    });
  }
});

// File Upload - Analyze uploaded file
router.post('/file-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const filePath = req.file.path;
    const jdText = await parseFile(filePath, req.file.mimetype);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    if (!jdText || jdText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'File appears to be empty or unreadable'
      });
    }
    
    const analysis = await analyzeJobDescription(jdText);
    
    res.json({
      success: true,
      analysis,
      originalText: jdText,
      fileName: req.file.originalname,
      message: 'File analyzed successfully'
    });
  } catch (error) {
    console.error('File upload analysis error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze uploaded file'
    });
  }
});

module.exports = router;