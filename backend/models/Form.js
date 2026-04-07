const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'radio', 'checkbox', 'select'],
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String
  }],
  required: {
    type: Boolean,
    default: false
  },
  condition: {
    dependsOnId: { type: String, default: null },
    requiredValue: { type: String, default: null }
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);
