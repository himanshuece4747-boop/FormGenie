import React, { useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const FormBuilder = () => {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic before generating a form.');
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post('/forms/generate', { topic });
      setForm({
        title: `${topic} Form`,
        description: `This form was AI generated based on the topic: ${topic}.`,
        questions: res.data
      });
    } catch (err) {
      toast.error('Failed to generate form. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form?.title?.trim()) {
      toast.error('Please add a form title before publishing.');
      return;
    }

    if (!form.questions?.length) {
      toast.error('This form has no questions to publish.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/forms', form);
      toast.success('Form published successfully.');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save form.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(null);
    setTopic('');
    toast.success('Draft discarded.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link to="/admin" className="inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {!form ? (
        <div className="card p-8 text-center bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Form Builder</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">Enter a topic, and our Gemini AI will instantly generate a comprehensive form structure for you in seconds.</p>
          
          <div className="flex max-w-md mx-auto">
             <input
               type="text"
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               placeholder="E.g., Employee Satisfaction Survey"
               className="input-field rounded-r-none border-r-0"
               onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
             />
             <button
               onClick={handleGenerate}
               disabled={generating || !topic}
               className="btn-primary rounded-l-none whitespace-nowrap flex items-center disabled:opacity-70"
             >
               {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : 'Generate Form'}
             </button>
          </div>
        </div>
      ) : (
        <div>
           <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <h2 className="text-2xl font-bold text-gray-900">Preview Form</h2>
             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
               <button onClick={handleDiscard} disabled={saving} className="btn-secondary disabled:opacity-70">
                 Discard
               </button>
               <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center justify-center disabled:opacity-70">
                 {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} {saving ? 'Publishing...' : 'Save & Publish'}
               </button>
             </div>
           </div>

           <div className="card p-8 bg-white border-t-8 border-t-primary-500">
             <input 
                type="text" 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="text-3xl font-bold w-full border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none py-2 mb-2 transition-colors duration-200"
             />
             <input 
                type="text" 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="text-gray-600 w-full border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none py-1 mb-8 transition-colors duration-200"
             />

             <div className="space-y-6">
               {form.questions.map((q, i) => (
                 <div key={q.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="font-medium text-gray-900 mb-3">{i+1}. {q.questionText} {q.required && <span className="text-red-500">*</span>}</p>
                    
                    {q.type === 'text' && <input type="text" disabled className="input-field bg-white" placeholder="Short answer text" />}
                    {q.type === 'textarea' && <textarea disabled className="input-field bg-white" placeholder="Long answer text" />}
                    {(q.type === 'radio' || q.type === 'checkbox') && (
                       <div className="space-y-2">
                         {q.options?.map((opt, j) => (
                           <div key={j} className="flex items-center">
                             <input type={q.type} disabled className="h-4 w-4 text-primary-600 border-gray-300 mr-2" />
                             <label className="text-sm text-gray-700">{opt}</label>
                           </div>
                         ))}
                       </div>
                    )}
                    {q.type === 'select' && (
                      <select disabled className="input-field bg-white">
                        <option>Select an option</option>
                        {q.options?.map((opt, j) => <option key={j}>{opt}</option>)}
                      </select>
                    )}
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
