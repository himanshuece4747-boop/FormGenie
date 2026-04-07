const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Form = require('../models/Form');
const Response = require('../models/Response');
const { auth, isAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { GoogleGenAI } = require('@google/genai');
const nodemailer = require('nodemailer');
const { Parser } = require('json2csv');

async function sendNotificationEmail(form) {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"FormGenie Notifier" <no-reply@formgenie.test>',
      to: "admin@formgenie.test",
      subject: `New Response: ${form.title}`,
      text: `A new response was submitted for ${form.title}. Check the admin dashboard to view it!`,
    });

    console.log("Notification email preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch(error) {
    console.error("Email sending error:", error);
  }
}


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// @route   POST /api/forms
// @desc    Create a form
// @access  Private (Admin)
router.post('/', [auth, isAdmin], async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const form = new Form({
      title,
      description,
      questions,
      createdBy: req.user.id
    });
    await form.save();
    res.json(form);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/forms
// @desc    Get all forms
// @access  Public or Private (Let's make it public to list, but admins see their own)
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().select('-questions').sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/forms/stats
// @desc    Get dashboard stats (Total forms, total responses)
// @access  Private (Admin)
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    const formsCount = await Form.countDocuments({ createdBy: req.user.id });
    
    // Total responses for all forms created by this admin
    const adminForms = await Form.find({ createdBy: req.user.id }).select('_id');
    const formIds = adminForms.map(f => f._id);
    const responsesCount = await Response.countDocuments({ formId: { $in: formIds } });

    res.json({ totalForms: formsCount, totalResponses: responsesCount });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: 'Failed to loaded stats' });
  }
});

// @route   POST /api/forms/generate
// @desc    Generate form questions using Gemini API
// @access  Private (Admin)
router.post('/generate', [auth, isAdmin], async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const prompt = `Create a list of form questions for a Google Forms style application about the following topic: "${topic}". 
Return strictly a JSON array of objects. 
Each object must have the following fields: 
- "id": a unique string (e.g. "q1", "q2")
- "type": must be one of ["text", "textarea", "radio", "checkbox", "select"]
- "questionText": the string of the question
- "options": an array of strings (only required if type is radio, checkbox, or select), empty otherwise.
- "required": boolean

No markdown, no json formatting blocks around the response, just the raw JSON array string.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let text = response.text;
    // Robust extraction: isolate JSON arrays even if LLM includes conversational text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error("No valid JSON array found in LLM response");
    }
    
    const cleanJsonString = jsonMatch[0];
    const questions = JSON.parse(cleanJsonString);
    res.json(questions);
  } catch (err) {
    console.error('Error generating AI questions:', err.message);
    res.status(500).json({ message: 'AI Generation failed/invalid format. Try again.' });
  }
});

// @route   GET /api/forms/:id
// @desc    Get form by ID
// @access  Public
router.get('/:id', async (req, res) => {
  console.log(`\n[Diagnostic] Backend received Route ID: ${req.params.id}`);
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log(`[Diagnostic] Validation Failure: ${req.params.id} is NOT a valid ObjectId.`);
    return res.status(400).json({ message: 'Malformed ID format' });
  }

  try {
    const form = await Form.findById(req.params.id);
    console.log(`[Diagnostic] Form.findById result:`, form ? 'Successfully Located Document' : 'null');
    
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Form ID is invalid or not found in database.' });
    }
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/forms/:id/responses
// @desc    Submit a response to a form
// @access  Private (Logged-in users)
router.post('/:id/responses', async (req, res) => {
  try {
    let { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Please provide valid answers before submitting.' });
    }
    
    // XSS Sanitization Rule: Turn angled brackets securely into readable un-executable strings
    answers = answers.map(ans => {
      let safeValue = ans.value;
      if (typeof safeValue === 'string') {
        safeValue = safeValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      } else if (Array.isArray(safeValue)) {
        safeValue = safeValue.map(v => typeof v === 'string' ? v.replace(/</g, "&lt;").replace(/>/g, "&gt;") : v);
      }
      return { ...ans, value: safeValue };
    });

    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Please log in to fill out this form.' });
    }

    let userId;
    try {
      const token = authHeader.split(' ')[1] || authHeader;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ message: 'Your session has expired. Please log in again to fill out this form.' });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const existingResponse = await Response.findOne({ formId: req.params.id, userId });
    if (existingResponse) {
       return res.status(400).json({ message: 'You have already filled out this form with your account.' });
    }

    const response = new Response({
      formId: req.params.id,
      answers,
      userId,
      ipAddress
    });
    await response.save();

    // Trigger Notification
    const form = await Form.findById(req.params.id);
    if(form) {
       sendNotificationEmail(form);
    }

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/forms/:id/export
// @desc    Export responses as CSV
// @access  Private (Admin)
router.get('/:id/export', [auth, isAdmin], async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    
    const responses = await Response.find({ formId: req.params.id });
    
    const data = responses.map(resp => {
      let row = { ResponseDate: new Date(resp.createdAt).toLocaleString() };
      form.questions.forEach(q => {
        const ans = resp.answers.find(a => a.questionId === q.id);
        row[q.questionText] = ans ? (Array.isArray(ans.value) ? ans.value.join('; ') : ans.value) : '';
      });
      return row;
    });

    if(data.length === 0) {
      return res.status(400).json({ message: 'No responses to export.' });
    }

    const fields = ['ResponseDate', ...form.questions.map(q => q.questionText)];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${form.title.replace(/\s+/g, '_')}_Responses.csv`);
    return res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/forms/:id/responses
// @desc    Get all responses for a form
// @access  Private (Admin)
router.get('/:id/responses', [auth, isAdmin], async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.id }).populate('userId', 'username email');
    res.json(responses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/forms/:id/insights
// @desc    Generate AI Analytics from Form Responses
// @access  Private (Admin)
router.get('/:id/insights', [auth, isAdmin], async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    const responses = await Response.find({ formId: req.params.id });
    if (responses.length === 0) {
      return res.status(400).json({ message: 'Not enough responses to generate insights.' });
    }

    // Convert raw mongo structure into a clean readable string map for the AI
    const dataReport = responses.map((r, i) => {
      let stringifiedAnswers = r.answers.map(a => {
        const matchingQuestion = form.questions.find(q => q.id === a.questionId);
        const title = matchingQuestion ? matchingQuestion.questionText : 'Unknown Question';
        const formattedAns = Array.isArray(a.value) ? a.value.join(', ') : a.value;
        return `${title}: ${formattedAns}`;
      }).join(' | ');
      return `Respondent ${i + 1}: [ ${stringifiedAnswers} ]`;
    }).join('\n');

    const prompt = `You are a professional Data Analyst. Given the following raw Form Responses about the form "${form.title}" (${form.description}), write a concise, incredibly insightful 3-paragraph executive summary detailing the majority consensus, identifying interesting outliers, and providing a final analytical takeaway. Format your response securely using rich Markdown headers and bullet points. Do NOT include PII like timestamps. 
    
    Here is the Data:
    ${dataReport}`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ insight: aiRes.text });
  } catch (err) {
    console.error('Insights Error:', err.message);
    res.status(500).json({ message: 'Analytics generation failed' });
  }
});

module.exports = router;
