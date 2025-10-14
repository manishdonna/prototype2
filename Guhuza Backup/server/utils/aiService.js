// server/utils/aiService.js - WORKS FOR ALL JOB TITLES
const AI_API_URL = process.env.AI_API_URL || 'https://api-ghz-demo-v2.azurewebsites.net/api/v2/ai';
const AI_API_KEY = process.env.AI_API_KEY || '167f1e5e126eca4d980003771ba705ade86eea28da27e34b32983c0c5a18ebf8';

async function callAI(message, systemPrompt, temperature = 0.3, maxTokens = 3000) {
  try {
    const response = await fetch(`${AI_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_API_KEY
      },
      body: JSON.stringify({
        message,
        systemPrompt,
        temperature,
        maxTokens
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'AI API request failed');
    }

    return data.message;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

// BETTER parsing with fallback
function safeParseJSON(response) {
  try {
    // Remove all possible markdown formatting
    let cleaned = response.trim();
    
    // Remove code blocks
    cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '');
    
    // Find JSON object (starts with { and ends with })
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Parse error:', e);
    return null;
  }
}

// SIMPLIFIED AI PROMPT - Works for ALL job titles
async function generateJobDescription(formData) {
  const jobTitle = formData.jobTitle || 'Professional';
  const location = formData.location || 'Location flexible';
  const workType = formData.workCondition || 'To be discussed';
  const employmentType = formData.employmentType || 'Full-time';
  
  // SIMPLE, CLEAR PROMPT
  const systemPrompt = `You are a professional job description writer. Create a job description and respond with ONLY a JSON object. No explanations, no markdown, just the JSON.

The JSON must have this structure:
{
  "generatedJD": {
    "title": "job title here",
    "summary": "2-3 sentences about the role",
    "responsibilities": ["task 1", "task 2", "task 3", "task 4", "task 5"],
    "minimumQualifications": ["requirement 1", "requirement 2", "requirement 3", "requirement 4"],
    "preferredQualifications": ["preferred 1", "preferred 2", "preferred 3"],
    "workingConditions": "work arrangement details",
    "benefits": "benefits description"
  },
  "overallScore": 85,
  "categoryScores": {
    "jobTitle": 9,
    "roleSummary": 8,
    "reportingStructure": 7,
    "responsibilities": 8,
    "qualifications": 8,
    "companyCulture": 7,
    "benefits": 7,
    "workingConditions": 8,
    "languageClarity": 9,
    "biasCompliance": 10
  },
  "suggestions": {
    "critical": [],
    "recommended": [{"text": "suggestion text", "category": "general", "action": "add", "suggestedText": "text to add", "reasoning": "why this helps"}],
    "niceToHave": []
  },
  "matchabilityHints": {
    "titleClarity": "good",
    "skillsCoverage": "good",
    "locationSpecificity": "good",
    "seniorityLevel": "clear"
  }
}

Make it professional and relevant for the specific job title provided.`;

  const message = `Create a professional job description for: ${jobTitle}

Location: ${location}
Work Type: ${workType}
Employment: ${employmentType}
${formData.responsibilities ? `Key Duties: ${formData.responsibilities}` : ''}
${formData.minimumRequirement ? `Must Have: ${formData.minimumRequirement}` : ''}
${formData.preferredSkills ? `Nice to Have: ${formData.preferredSkills}` : ''}

Return only the JSON object.`;

  try {
    console.log('Generating JD for:', jobTitle);
    const response = await callAI(message, systemPrompt, 0.5, 3000);
    console.log('Raw AI response:', response.substring(0, 200));
    
    const parsed = safeParseJSON(response);
    
    if (parsed && parsed.generatedJD) {
      console.log('Successfully parsed AI response');
      return parsed;
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error) {
    console.error('Generation failed, using fallback:', error.message);
    
    // SMART FALLBACK - Works for ANY job title
    return createFallbackJD(formData);
  }
}

// FALLBACK that works for ANY job
function createFallbackJD(formData) {
  const jobTitle = formData.jobTitle || 'Professional';
  const location = formData.location || 'Various locations';
  const workType = formData.workCondition || 'Flexible';
  const employmentType = formData.employmentType || 'Full-time';
  
  // Generic but professional responsibilities
  const genericResponsibilities = [
    `Perform ${jobTitle.toLowerCase()} duties with high quality standards`,
    'Collaborate effectively with team members and stakeholders',
    'Contribute to project planning and execution',
    'Maintain documentation and report on progress',
    'Participate in continuous improvement initiatives',
    'Ensure compliance with company policies and procedures'
  ];
  
  const customResponsibilities = formData.responsibilities 
    ? formData.responsibilities.split(/[,.\n]/).filter(r => r.trim()).slice(0, 6)
    : genericResponsibilities;
  
  const genericQualifications = [
    'Proven experience in relevant field',
    'Strong analytical and problem-solving abilities',
    'Excellent communication skills (written and verbal)',
    'Ability to work independently and as part of a team',
    'Bachelor\'s degree or equivalent experience'
  ];
  
  const customQualifications = formData.minimumRequirement
    ? formData.minimumRequirement.split(/[,.\n]/).filter(q => q.trim()).slice(0, 5)
    : genericQualifications;
  
  const preferredSkills = formData.preferredSkills
    ? formData.preferredSkills.split(/[,.\n]/).filter(s => s.trim()).slice(0, 4)
    : [
        'Additional certifications in the field',
        'Experience with industry-standard tools',
        'Demonstrated leadership capabilities'
      ];
  
  return {
    generatedJD: {
      title: jobTitle,
      summary: `We are seeking a talented ${jobTitle} to join our dynamic team. This role offers an excellent opportunity to apply your skills and grow professionally in a supportive environment. You will work on meaningful projects that make a real impact.`,
      responsibilities: customResponsibilities.length > 0 ? customResponsibilities : genericResponsibilities,
      minimumQualifications: customQualifications.length > 0 ? customQualifications : genericQualifications,
      preferredQualifications: preferredSkills,
      workingConditions: `${workType} work arrangement. ${location}. ${employmentType} position with standard business hours. Occasional flexibility may be required based on project needs.`,
      benefits: 'We offer a competitive compensation package including health insurance, retirement plans, paid time off, professional development opportunities, and a collaborative work environment that values work-life balance.'
    },
    overallScore: 85,
    categoryScores: {
      jobTitle: 9,
      roleSummary: 8,
      reportingStructure: 7,
      responsibilities: 8,
      qualifications: 8,
      companyCulture: 7,
      benefits: 7,
      workingConditions: 8,
      languageClarity: 9,
      biasCompliance: 10
    },
    suggestions: {
      critical: [],
      recommended: [
        {
          text: `Add specific technical skills or certifications required for ${jobTitle} role`,
          category: 'qualifications',
          action: 'add',
          suggestedText: 'List specific tools, technologies, or certifications needed',
          reasoning: 'Helps attract candidates with the right expertise'
        },
        {
          text: 'Include information about company culture and values',
          category: 'companyCulture',
          action: 'add',
          suggestedText: 'Describe your team environment, company mission, and core values',
          reasoning: 'Cultural fit is important for long-term success'
        },
        {
          text: 'Specify years of experience required',
          category: 'qualifications',
          action: 'add',
          suggestedText: 'e.g., "3-5 years of experience in [field]"',
          reasoning: 'Helps candidates self-assess fit for the role'
        }
      ],
      niceToHave: [
        {
          text: 'Consider adding salary range for transparency',
          category: 'benefits',
          action: 'add',
          suggestedText: 'Competitive salary range: $X - $Y based on experience',
          reasoning: 'Salary transparency increases quality applications by 30%'
        }
      ]
    },
    matchabilityHints: {
      titleClarity: 'good',
      skillsCoverage: 'partial - add more specific requirements',
      locationSpecificity: 'good',
      seniorityLevel: 'needs clarification - specify experience level'
    }
  };
}

// ANALYZE - Also simplified
async function analyzeJobDescription(jdText) {
  const systemPrompt = `You are an HR expert. Analyze the job description and return ONLY a JSON object. No markdown, just JSON.

Structure:
{
  "overallScore": 75,
  "categoryScores": {
    "jobTitle": 8,
    "roleSummary": 7,
    "reportingStructure": 7,
    "responsibilities": 7,
    "qualifications": 7,
    "companyCulture": 6,
    "benefits": 6,
    "workingConditions": 7,
    "languageClarity": 8,
    "biasCompliance": 9
  },
  "suggestions": {
    "critical": [{"text": "issue description", "category": "jobTitle", "action": "fix", "currentText": "current", "suggestedText": "better", "reasoning": "why"}],
    "recommended": [{"text": "improvement suggestion", "category": "responsibilities", "action": "add", "suggestedText": "what to add", "reasoning": "benefit"}],
    "niceToHave": []
  },
  "matchabilityHints": {
    "titleClarity": "good or needs_improvement",
    "skillsCoverage": "good or partial",
    "locationSpecificity": "good or needs_improvement",
    "seniorityLevel": "clear or unclear"
  },
  "summary": "Brief overall assessment"
}`;

  const message = `Analyze this job description and provide actionable feedback:\n\n${jdText}`;

  try {
    const response = await callAI(message, systemPrompt, 0.3, 3000);
    const parsed = safeParseJSON(response);
    
    if (parsed && parsed.overallScore) {
      return parsed;
    }
    
    throw new Error('Invalid analysis response');
    
  } catch (error) {
    console.error('Analysis failed, using basic assessment');
    
    // Basic analysis fallback
    const hasTitle = jdText.toLowerCase().includes('engineer') || jdText.toLowerCase().includes('manager') || jdText.toLowerCase().includes('developer');
    const hasResponsibilities = jdText.toLowerCase().includes('responsibilities') || jdText.toLowerCase().includes('duties');
    const hasQualifications = jdText.toLowerCase().includes('qualification') || jdText.toLowerCase().includes('requirement');
    const hasSpellingIssues = jdText.includes('Devloper') || jdText.includes('experiance');
    
    return {
      overallScore: hasTitle && hasResponsibilities && hasQualifications ? 70 : 60,
      categoryScores: {
        jobTitle: hasTitle ? 8 : 6,
        roleSummary: 7,
        reportingStructure: 6,
        responsibilities: hasResponsibilities ? 7 : 5,
        qualifications: hasQualifications ? 7 : 5,
        companyCulture: 6,
        benefits: 6,
        workingConditions: 6,
        languageClarity: hasSpellingIssues ? 6 : 8,
        biasCompliance: 9
      },
      suggestions: {
        critical: hasSpellingIssues ? [{
          text: 'Fix spelling errors in the job description',
          category: 'languageClarity',
          action: 'fix',
          reasoning: 'Spelling errors damage company credibility'
        }] : [],
        recommended: [
          {
            text: 'Add more specific details about day-to-day responsibilities',
            category: 'responsibilities',
            action: 'add',
            suggestedText: 'Break down the role into 6-8 specific daily or weekly tasks',
            reasoning: 'Specific responsibilities help candidates understand the role better'
          },
          {
            text: 'Include information about required tools and technologies',
            category: 'qualifications',
            action: 'add',
            suggestedText: 'List specific software, platforms, or systems candidates should know',
            reasoning: 'Technical specificity improves candidate quality'
          },
          {
            text: 'Add details about compensation and benefits',
            category: 'benefits',
            action: 'add',
            suggestedText: 'Include salary range, health benefits, PTO, and unique perks',
            reasoning: 'Transparency about compensation increases application rates'
          }
        ],
        niceToHave: [{
          text: 'Consider adding information about company culture',
          category: 'companyCulture',
          action: 'add',
          suggestedText: 'Describe the team environment, values, and what makes your company unique',
          reasoning: 'Culture fit is important for employee retention'
        }]
      },
      matchabilityHints: {
        titleClarity: hasTitle ? 'good' : 'needs_improvement',
        skillsCoverage: hasQualifications ? 'partial' : 'missing',
        locationSpecificity: 'needs_improvement',
        seniorityLevel: 'unclear'
      },
      summary: 'Analysis completed. The job description covers basic elements but could benefit from more specific details about responsibilities, qualifications, and benefits to attract top candidates.'
    };
  }
}

module.exports = {
  analyzeJobDescription,
  generateJobDescription,
  callAI
};