// client/src/components/AnalysisResults.jsx - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AnalysisResults = ({ analysis, onSubmitJob, isSubmitting, mode = 'manual-entry', originalText, onUpdateContent }) => {
  const [appliedSuggestions, setAppliedSuggestions] = useState([]);
  const [editedContent, setEditedContent] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [locationRadius, setLocationRadius] = useState('25');
  const [saveAs, setSaveAs] = useState('immediate'); // 'immediate' or 'draft'

  useEffect(() => {
    if (mode === 'smart-builder' && analysis?.generatedJD) {
      setEditedContent(analysis.generatedJD);
    }
  }, [analysis, mode]);

  if (!analysis) return null;

  const handleApplySuggestion = (suggestion, index, priority) => {
    const key = `${priority}-${index}`;
    
    if (!appliedSuggestions.includes(key)) {
      setAppliedSuggestions([...appliedSuggestions, key]);
      
      // Apply the suggestion to content
      if (suggestion.suggestedText && mode === 'smart-builder' && editedContent) {
        // Update the relevant section
        const updatedContent = { ...editedContent };
        
        switch(suggestion.category) {
          case 'jobTitle':
            updatedContent.title = suggestion.suggestedText;
            break;
          case 'roleSummary':
            updatedContent.summary = suggestion.suggestedText;
            break;
          case 'responsibilities':
            if (!updatedContent.responsibilities) updatedContent.responsibilities = [];
            updatedContent.responsibilities.push(suggestion.suggestedText);
            break;
          case 'qualifications':
            if (!updatedContent.minimumQualifications) updatedContent.minimumQualifications = [];
            updatedContent.minimumQualifications.push(suggestion.suggestedText);
            break;
          case 'benefits':
            if (updatedContent.benefits && typeof updatedContent.benefits === 'object') {
              updatedContent.benefits.unique = (updatedContent.benefits.unique || '') + ' ' + suggestion.suggestedText;
            } else {
              updatedContent.benefits = suggestion.suggestedText;
            }
            break;
          case 'companyCulture':
            updatedContent.companyCulture = (updatedContent.companyCulture || '') + ' ' + suggestion.suggestedText;
            break;
          default:
            break;
        }
        
        setEditedContent(updatedContent);
        if (onUpdateContent) onUpdateContent(updatedContent);
      }
      
      toast.success('Suggestion applied!');
      setShowSidebar(false);
      setSelectedSuggestion(null);
    }
  };

  const handleSkipSuggestion = (index, priority) => {
    const key = `${priority}-${index}`;
    setAppliedSuggestions(appliedSuggestions.filter(s => s !== key));
    setShowSidebar(false);
    setSelectedSuggestion(null);
  };

  const handleAcceptAll = (priority) => {
    const suggestions = analysis.suggestions[priority] || [];
    const newApplied = suggestions.map((_, idx) => `${priority}-${idx}`);
    setAppliedSuggestions([...new Set([...appliedSuggestions, ...newApplied])]);
    toast.success(`All ${priority} suggestions accepted!`);
  };

  const handleSkipAll = (priority) => {
    const suggestions = analysis.suggestions[priority] || [];
    const toRemove = suggestions.map((_, idx) => `${priority}-${idx}`);
    setAppliedSuggestions(appliedSuggestions.filter(s => !toRemove.includes(s)));
    toast.info(`All ${priority} suggestions skipped`);
  };

  const openSuggestionPopup = (suggestion, idx, priority) => {
    setSelectedSuggestion({ suggestion, idx, priority });
    setShowSidebar(true);
  };

  const handleEditContent = (field, value) => {
    const updated = { ...editedContent, [field]: value };
    setEditedContent(updated);
    if (onUpdateContent) onUpdateContent(updated);
  };

  const handleEditArray = (field, index, value) => {
    const updated = { ...editedContent };
    if (!updated[field]) updated[field] = [];
    updated[field][index] = value;
    setEditedContent(updated);
    if (onUpdateContent) onUpdateContent(updated);
  };

  const handleAddArrayItem = (field) => {
    const updated = { ...editedContent };
    if (!updated[field]) updated[field] = [];
    updated[field].push('');
    setEditedContent(updated);
  };

  const handleRemoveArrayItem = (field, index) => {
    const updated = { ...editedContent };
    updated[field].splice(index, 1);
    setEditedContent(updated);
    if (onUpdateContent) onUpdateContent(updated);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
  };

  const getOverallScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const SuggestionCard = ({ suggestion, idx, priority, colorClass }) => {
    const key = `${priority}-${idx}`;
    const isApplied = appliedSuggestions.includes(key);

    return (
      <div
        onClick={() => !isApplied && openSuggestionPopup(suggestion, idx, priority)}
        className={`p-4 rounded-lg border-2 transition cursor-pointer transform hover:scale-[1.02] ${
          isApplied
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <p className="text-gray-800 dark:text-gray-200 font-medium">{suggestion.text}</p>
            {suggestion.reasoning && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">💡 {suggestion.reasoning}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {suggestion.category}
              </span>
              {isApplied && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Applied
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SuggestionSection = ({ title, suggestions, priority, colorClass, icon }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold flex items-center ${colorClass}`}>
            <span className="mr-2">{icon}</span>
            {title} ({suggestions.length})
          </h3>
          <div className="space-x-2">
            <button
              onClick={() => handleAcceptAll(priority)}
              className="text-sm px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition font-medium"
            >
              ✓ Accept All
            </button>
            <button
              onClick={() => handleSkipAll(priority)}
              className="text-sm px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium"
            >
              ✕ Skip All
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {suggestions.map((suggestion, idx) => (
            <SuggestionCard
              key={idx}
              suggestion={suggestion}
              idx={idx}
              priority={priority}
              colorClass={colorClass}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Analysis Results</h2>
        
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className={`text-7xl font-bold ${getOverallScoreColor(analysis.overallScore)} mb-2`}>
              {analysis.overallScore}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Overall Quality Score</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {analysis.overallScore >= 80 ? '🎉 Excellent!' : analysis.overallScore >= 60 ? '👍 Good' : '⚠️ Needs Improvement'}
            </p>
          </div>
        </div>

        {/* Category Scores */}
        {analysis.categoryScores && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analysis.categoryScores).map(([key, score]) => (
                <div key={key} className={`p-4 rounded-lg text-center ${getScoreColor(score)}`}>
                  <div className="font-bold text-3xl mb-1">{score}</div>
                  <div className="text-xs font-medium capitalize leading-tight">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matchability Hints */}
        {analysis.matchabilityHints && (
          <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Matchability Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(analysis.matchabilityHints).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                  <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="font-semibold text-blue-900 dark:text-blue-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {analysis.summary && (
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Expert Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">AI Suggestions</h2>

        <SuggestionSection
          title="Critical (Must Fix)"
          suggestions={analysis.suggestions?.critical}
          priority="critical"
          colorClass="text-red-600 dark:text-red-400"
          icon="🔴"
        />

        <SuggestionSection
          title="Recommended"
          suggestions={analysis.suggestions?.recommended}
          priority="recommended"
          colorClass="text-yellow-600 dark:text-yellow-400"
          icon="🟡"
        />

        <SuggestionSection
          title="Nice to Have"
          suggestions={analysis.suggestions?.niceToHave}
          priority="niceToHave"
          colorClass="text-green-600 dark:text-green-400"
          icon="🟢"
        />

        {(!analysis.suggestions?.critical || analysis.suggestions.critical.length === 0) &&
         (!analysis.suggestions?.recommended || analysis.suggestions.recommended.length === 0) &&
         (!analysis.suggestions?.niceToHave || analysis.suggestions.niceToHave.length === 0) && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-semibold">Perfect Job Description!</p>
            <p className="text-sm mt-1">No suggestions - Your job description looks great!</p>
          </div>
        )}
      </div>

      {/* Editable Generated JD (Smart Builder) */}
      {mode === 'smart-builder' && editedContent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Generated Job Description
          </h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={editedContent.title || ''}
                onChange={(e) => handleEditContent('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role Summary</label>
              <textarea
                value={editedContent.summary || ''}
                onChange={(e) => handleEditContent('summary', e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Responsibilities */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Responsibilities</label>
                <button
                  onClick={() => handleAddArrayItem('responsibilities')}
                  className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {(editedContent.responsibilities || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleEditArray('responsibilities', idx, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter responsibility..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('responsibilities', idx)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Qualifications */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Minimum Qualifications</label>
                <button
                  onClick={() => handleAddArrayItem('minimumQualifications')}
                  className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {(editedContent.minimumQualifications || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleEditArray('minimumQualifications', idx, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter qualification..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('minimumQualifications', idx)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Qualifications */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Preferred Qualifications</label>
                <button
                  onClick={() => handleAddArrayItem('preferredQualifications')}
                  className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {(editedContent.preferredQualifications || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleEditArray('preferredQualifications', idx, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter preferred qualification..."
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('preferredQualifications', idx)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Conditions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Working Conditions</label>
              <textarea
                value={editedContent.workingConditions || ''}
                onChange={(e) => handleEditContent('workingConditions', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Benefits</label>
              <textarea
                value={typeof editedContent.benefits === 'string' ? editedContent.benefits : JSON.stringify(editedContent.benefits, null, 2)}
                onChange={(e) => handleEditContent('benefits', e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Radius & Submit Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ready to Post?</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Location Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Location Radius for Candidate Matching
            </label>
            <select
              value={locationRadius}
              onChange={(e) => setLocationRadius(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="national">National</option>
              <option value="remote">Remote (anywhere)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Candidate matching will begin after posting
            </p>
          </div>

          {/* Save Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Posting Option
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition">
                <input
                  type="radio"
                  value="immediate"
                  checked={saveAs === 'immediate'}
                  onChange={(e) => setSaveAs(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">Post Immediately</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Start matching candidates now</div>
                </div>
              </label>
              <label className="flex items-center p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition">
                <input
                  type="radio"
                  value="draft"
                  checked={saveAs === 'draft'}
                  onChange={(e) => setSaveAs(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">Save as Draft</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Review and post later</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onSubmitJob({ locationRadius, saveAs, editedContent })}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-16 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg transform hover:scale-105"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {saveAs === 'draft' ? 'Saving Draft...' : 'Posting Job...'}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {saveAs === 'draft' ? 'Save as Draft' : 'Post Job to Guhuza'}
              </span>
            )}
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            ✓ {appliedSuggestions.length} suggestions applied • {saveAs === 'draft' ? '💾 Will be saved as draft' : '🚀 Will go live immediately'}
          </p>
        </div>
      </div>

      {/* Popup Sidebar */}
      {showSidebar && selectedSuggestion && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Suggestion Details
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Priority Badge */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedSuggestion.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                  selectedSuggestion.priority === 'recommended' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {selectedSuggestion.priority === 'critical' ? '🔴 Critical' :
                   selectedSuggestion.priority === 'recommended' ? '🟡 Recommended' :
                   '🟢 Nice to Have'}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {selectedSuggestion.suggestion.category}
                </span>
              </div>

              {/* Suggestion Text */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                  {selectedSuggestion.suggestion.text}
                </p>
              </div>

              {/* Reasoning */}
              {selectedSuggestion.suggestion.reasoning && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Why this matters
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded">
                    {selectedSuggestion.suggestion.reasoning}
                  </p>
                </div>
              )}

              {/* Current vs Suggested */}
              {selectedSuggestion.suggestion.currentText && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current:</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800 line-through">
                    {selectedSuggestion.suggestion.currentText}
                  </p>
                </div>
              )}

              {selectedSuggestion.suggestion.suggestedText && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Suggested:</h4>
                  <p className="text-gray-800 dark:text-gray-200 bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800 font-medium">
                    {selectedSuggestion.suggestion.suggestedText}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleApplySuggestion(selectedSuggestion.suggestion, selectedSuggestion.idx, selectedSuggestion.priority)}
                  className="flex-1 bg-green-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Apply This
                </button>
                <button
                  onClick={() => handleSkipSuggestion(selectedSuggestion.idx, selectedSuggestion.priority)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-4 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Skip
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisResults;