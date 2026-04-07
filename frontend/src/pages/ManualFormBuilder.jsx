import React, { useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ManualFormBuilder = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type: 'text',
        questionText: '',
        options: [],
        required: false,
        condition: { dependsOnId: '', requiredValue: '' }
      }
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateCondition = (id, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, condition: { ...q.condition, [field]: value } };
      }
      return q;
    }));
  };

  const handleOptionsChange = (id, optionsString) => {
    const opts = optionsString.split(',').map(o => o.trim()).filter(o => o);
    updateQuestion(id, 'options', opts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      return toast.error("Please add at least one question.");
    }
    
    // Validation
    for (let q of questions) {
       if (!q.questionText.trim()) return toast.error("All questions must have a title.");
       if (['radio', 'checkbox', 'select'].includes(q.type) && q.options.length === 0) {
           return toast.error(`Question "${q.questionText}" requires comma-separated options.`);
       }
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/forms', { title, description, questions });
      toast.success('Custom Form successfully created!');
      navigate(`/admin/responses/${res.data._id}`);
    } catch (err) {
      toast.error('Error creating form. Check console.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 mt-6">
      <div className="mb-6">
        <Link to="/admin" className="inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-panel p-8 mb-8 animate-float shadow-glass">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Manual Form Builder</h1>
        <p className="text-gray-600 mb-6">Design your exact form by defining fields step-by-step.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Form Title</label>
              <input 
                type="text" 
                required 
                className="input-field mt-1 h-12"
                placeholder="e.g. Employee Feedback 2026"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea 
                className="input-field mt-1"
                placeholder="Briefly describe the purpose of this form..."
                rows="2"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-200/50 pt-6 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Questions</h3>
            
            {questions.map((q, index) => (
              <div key={q.id} className="bg-white/80 p-5 rounded-lg border border-gray-200 shadow-sm mb-4 relative">
                <button type="button" onClick={() => removeQuestion(q.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Question Text</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field mt-1 bg-white"
                      value={q.questionText}
                      onChange={e => updateQuestion(q.id, 'questionText', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Type</label>
                    <select 
                      className="input-field mt-1"
                      value={q.type}
                      onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Paragraph</option>
                      <option value="radio">Multiple Choice (Radio)</option>
                      <option value="checkbox">Checkboxes</option>
                      <option value="select">Dropdown</option>
                    </select>
                  </div>
                </div>

                {['radio', 'checkbox', 'select'].includes(q.type) && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Options (Comma separated)</label>
                    <input 
                      type="text" 
                      className="input-field mt-1 bg-gray-50 text-sm border-dashed"
                      placeholder="e.g. Yes, No, Maybe"
                      value={q.options.join(', ')}
                      onChange={e => handleOptionsChange(q.id, e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center mb-4">
                   <input 
                     type="checkbox" 
                     id={`req_${q.id}`}
                     checked={q.required}
                     onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                     className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
                   />
                   <label htmlFor={`req_${q.id}`} className="ml-2 text-sm font-medium text-gray-700">Required Field</label>
                </div>
                
                {/* Condition Builder UI */}
                {index > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Branching Logic (Optional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Show this question ONLY if:</label>
                        <select 
                          className="input-field mt-1 text-sm bg-white"
                          value={q.condition?.dependsOnId || ''}
                          onChange={e => updateCondition(q.id, 'dependsOnId', e.target.value)}
                        >
                          <option value="">Always Show (No condition)</option>
                          {questions.slice(0, index).map(prevQ => (
                            <option key={prevQ.id} value={prevQ.id}>
                              {prevQ.questionText || `Question ${questions.indexOf(prevQ) + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {q.condition?.dependsOnId && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Answers exactly:</label>
                          <input 
                            type="text" 
                            className="input-field mt-1 text-sm bg-white"
                            placeholder="e.g. Yes"
                            value={q.condition?.requiredValue || ''}
                            onChange={e => updateCondition(q.id, 'requiredValue', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button 
              type="button" 
              onClick={addQuestion}
              className="mt-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Add Question
            </button>
          </div>

          <div className="pt-6 text-right">
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn-primary text-lg px-8 py-3 w-full md:w-auto flex items-center justify-center m-auto md:m-0 md:ml-auto"
            >
              {submitting ? 'Saving...' : 'Publish Form'} <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualFormBuilder;
