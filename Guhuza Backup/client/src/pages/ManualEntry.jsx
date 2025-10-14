// client/src/pages/ManualEntry.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnalysisResults from '../components/AnalysisResults';

const ManualEntry = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  
  const [jdText, setJdText] = useState('');
  const [uploadMethod, setUploadMethod] = useState('paste'); // 'paste' or 'file'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    }
  }, [userEmail, navigate]);

  const handleTextAnalysis = async (e) => {
    e.preventDefault();
    
    if (!jdText.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/analyze/manual-entry', {
        jdText
      });
      
      if (response.data.success) {
        setAnalysisResult(response.data.analysis);
        setOriginalText(response.data.originalText);
        toast.success('Analysis completed successfully!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|docx)$/i)) {
      toast.error('Only TXT, PDF, and DOCX files are allowed');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/analyze/file-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setAnalysisResult(response.data.analysis);
        setOriginalText(response.data.originalText);
        setJdText(response.data.originalText);
        toast.success(`File "${response.data.fileName}" analyzed successfully!`);
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze uploaded file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitJob = async () => {
    if (!analysisResult) {
      toast.error('Please analyze a job description first');
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        email: userEmail,
        jobTitle: 'Manual Entry Job', // Extract from analysis if needed
        jobDescription: originalText,
        analysis: analysisResult,
        type: 'manual-entry'
      };

      const response = await axios.post('http://localhost:5000/api/jobs', jobData);
      
      if (response.data.success) {
        toast.success('Job posted successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manual Entry</h1>
          <p className="text-gray-600">Upload or paste an existing job description for AI analysis</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Upload Method Selector */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setUploadMethod('paste')}
              className={`pb-3 px-4 font-medium transition ${
                uploadMethod === 'paste'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setUploadMethod('file')}
              className={`pb-3 px-4 font-medium transition ${
                uploadMethod === 'file'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload File
            </button>
          </div>

          {/* Paste Text Method */}
          {uploadMethod === 'paste' && (
            <form onSubmit={handleTextAnalysis}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description Text
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your job description here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {jdText.length} characters
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isAnalyzing || !jdText.trim()}
                  className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze Job Description'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* File Upload Method */}
          {uploadMethod === 'file' && (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isAnalyzing ? 'Analyzing file...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">
                    TXT, PDF, or DOCX (max 5MB)
                  </p>
                </label>
              </div>

              {isAnalyzing && (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center text-blue-600">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing your file...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {analysisResult && (
          <AnalysisResults 
            analysis={analysisResult}
            onSubmitJob={handleSubmitJob}
            isSubmitting={isSubmitting}
            mode="manual-entry"
            originalText={originalText}
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ManualEntry;