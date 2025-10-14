// client/src/pages/SmartBuilder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnalysisResults from '../components/AnalysisResults';

const SmartBuilder = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    workCondition: '',
    employmentType: '',
    responsibilities: '',
    minimumRequirement: '',
    preferredSkills: '',
    requirements: '',
    email: userEmail || ''
  });
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    }
  }, [userEmail, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!formData.jobTitle) {
      toast.error('Job title is required');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/analyze/smart-builder', formData);
      
      if (response.data.success) {
        setAnalysisResult(response.data.analysis);
        toast.success('Job description generated successfully!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitJob = async () => {
    if (!analysisResult) {
      toast.error('Please generate a job description first');
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        ...formData,
        ...analysisResult.generatedJD,
        analysis: analysisResult,
        type: 'smart-builder'
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Builder</h1>
          <p className="text-gray-600">Fill in the details below and let AI generate a professional job description</p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New York, NY or Remote"
              />
            </div>

            {/* Work Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Condition
              </label>
              <select
                name="workCondition"
                value={formData.workCondition}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select work condition</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select employment type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Key Responsibilities */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Responsibilities (Optional)
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the main duties and responsibilities..."
              />
            </div>

            {/* Minimum Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Requirements (Optional)
              </label>
              <textarea
                name="minimumRequirement"
                value={formData.minimumRequirement}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Required skills, education, experience..."
              />
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Skills (Optional)
              </label>
              <textarea
                name="preferredSkills"
                value={formData.preferredSkills}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nice-to-have skills and qualifications..."
              />
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any other details you'd like to include..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Job Description'
              )}
            </button>
          </div>
        </form>

        {analysisResult && (
          <AnalysisResults 
            analysis={analysisResult}
            onSubmitJob={handleSubmitJob}
            isSubmitting={isSubmitting}
            mode="smart-builder"
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SmartBuilder;