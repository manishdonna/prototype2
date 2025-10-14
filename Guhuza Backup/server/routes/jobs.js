// server/routes/jobs.js
const express = require('express');
const router = express.Router();
const fs = require('fs');

const jobsFile = './data/jobs.json';

// Read jobs from file
const getJobs = () => {
  try {
    const data = fs.readFileSync(jobsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Save jobs to file
const saveJobs = (jobs) => {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
};

// Create new job posting
router.post('/', (req, res) => {
  try {
    const jobData = req.body;
    
    if (!jobData.email || !jobData.jobTitle) {
      return res.status(400).json({
        success: false,
        error: 'Email and job title are required'
      });
    }
    
    const jobs = getJobs();
    
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    jobs.push(newJob);
    saveJobs(jobs);
    
    res.json({
      success: true,
      job: newJob,
      message: 'Job posted successfully'
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job posting'
    });
  }
});

// Get all jobs or filter by email
router.get('/', (req, res) => {
  try {
    const { email } = req.query;
    let jobs = getJobs();
    
    if (email) {
      jobs = jobs.filter(job => job.email === email);
    }
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve jobs'
    });
  }
});

// Get single job by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const jobs = getJobs();
    const job = jobs.find(j => j.id === id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve job'
    });
  }
});

// Update job
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === id);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveJobs(jobs);
    
    res.json({
      success: true,
      job: jobs[jobIndex],
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job'
    });
  }
});

// Delete job
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === id);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    const deletedJob = jobs.splice(jobIndex, 1)[0];
    saveJobs(jobs);
    
    res.json({
      success: true,
      job: deletedJob,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job'
    });
  }
});

module.exports = router;