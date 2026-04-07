const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, or array (for checkboxes)
    required: true
  }
});

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Optional if we allow anonymous responses, but let's say they're logged in.
  },
  ipAddress: {
    type: String
  },
  answers: [answerSchema]
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
