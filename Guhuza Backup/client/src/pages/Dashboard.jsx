// client/src/pages/Dashboard.jsx - STUNNING REDESIGN
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [userEmail, navigate]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs?email=${userEmail}`);
      
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
      
      if (response.data.success) {
        toast.success('Job deleted successfully');
        fetchJobs();
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Delete job error:', error);
      toast.error('Failed to delete job');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'draft' && job.status === 'draft') ||
                         (filterStatus === 'active' && job.status === 'active');
    
    return matchesSearch && matchesFilter;
  });

  const JobCardGrid = ({ job }) => (
    <div
      onClick={() => setSelectedJob(job)}
      className={`group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 transform hover:-translate-y-1 ${
        selectedJob?.id === job.id 
          ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-200 dark:ring-blue-900/50' 
          : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'
      }`}
    >
      {/* Score Badge */}
      {job.analysis?.overallScore && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(job.analysis.overallScore)} p-1 shadow-lg`}>
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{job.analysis.overallScore}</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      {job.status === 'draft' && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
            💾 Draft
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 pr-20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
          {job.jobTitle || job.title || 'Untitled Job'}
        </h3>

        {/* Info */}
        <div className="space-y-2 mb-4">
          {job.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{job.location}</span>
            </div>
          )}
          
          {job.workCondition && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{job.workCondition}</span>
            </div>
          )}

          {job.employmentType && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{job.employmentType}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(job.createdAt)}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            job.type === 'smart-builder' 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
              : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
          }`}>
            {job.type === 'smart-builder' ? '🤖 AI Generated' : '📝 Analyzed'}
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  );

  const JobDetails = ({ job }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-8 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {job.jobTitle || job.title || 'Job Details'}
            </h2>
            <div className="flex flex-wrap gap-3 mt-4">
              {job.location && (
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.workCondition && (
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {job.workCondition}
                </span>
              )}
              {job.employmentType && (
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {job.employmentType}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => handleDeleteJob(job.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Analysis Score */}
        {job.analysis && (
          <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Quality Analysis</h3>
              {job.analysis.overallScore && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">Overall Score:</span>
                  <div className={`text-5xl font-bold bg-gradient-to-br ${getScoreColor(job.analysis.overallScore)} bg-clip-text text-transparent`}>
                    {job.analysis.overallScore}
                  </div>
                </div>
              )}
            </div>

            {job.analysis.categoryScores && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(job.analysis.categoryScores).map(([key, score]) => (
                  <div key={key} className={`p-4 rounded-lg text-center ${getScoreBadgeColor(score)} transform hover:scale-105 transition`}>
                    <div className="font-bold text-2xl mb-1">{score}</div>
                    <div className="text-xs capitalize leading-tight font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Description */}
        {job.jobDescription && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{job.jobDescription}</p>
            </div>
          </div>
        )}

        {/* Generated Content (Smart Builder) */}
        {job.analysis?.generatedJD && (
          <div className="space-y-6">
            {job.analysis.generatedJD.summary && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Summary
                </h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                  <p className="text-gray-700 dark:text-gray-300">{job.analysis.generatedJD.summary}</p>
                </div>
              </div>
            )}

            {job.analysis.generatedJD.responsibilities && job.analysis.generatedJD.responsibilities.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Responsibilities
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                  <ul className="space-y-2">
                    {job.analysis.generatedJD.responsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {job.analysis.generatedJD.minimumQualifications && job.analysis.generatedJD.minimumQualifications.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Minimum Qualifications
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                  <ul className="space-y-2">
                    {job.analysis.generatedJD.minimumQualifications.map((item, idx) => (
                      <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 mb-1">Created</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(job.createdAt)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 mb-1">Type</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                {job.type?.replace('-', ' ')}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{job.status || 'Active'}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 mb-1">Location Radius</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{job.locationRadius || '25'} km</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-200">
      <Header />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">My Job Postings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and track all your job listings</p>
            </div>
            <button
              onClick={() => navigate('/method-choice')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Job
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{jobs.length}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {jobs.filter(j => j.status === 'active').length}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {jobs.filter(j => j.status === 'draft').length}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Score</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {jobs.length > 0 ? Math.round(jobs.reduce((sum, j) => sum + (j.analysis?.overallScore || 0), 0) / jobs.length) : 0}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jobs by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  filterStatus === 'draft'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Drafts
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
              {searchQuery ? 'No matching jobs found' : 'No job postings yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search or filters' 
                : 'Create your first job posting to get started with AI-powered optimization'}
            </p>
            <button
              onClick={() => navigate('/method-choice')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Your First Job
            </button>
          </div>
        ) : selectedJob ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedJob(null)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all jobs
            </button>
            <JobDetails job={selectedJob} />
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredJobs.map(job => (
              <JobCardGrid key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;