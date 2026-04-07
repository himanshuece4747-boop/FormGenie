import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { CheckCircle, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';

const FormView = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const questionRefs = useRef({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return setNotFound(true);
      try {
        const res = await axios.get(`/forms/${id}`);
        setForm(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
        console.error('Error fetching form:', err);
      }
    };
    fetchForm();
  }, [id]);

  const handleAnswerChange = (questionId, value, type) => {
    // Clear error for this question when changed
    if (errors[questionId]) {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      setErrors(newErrors);
    }

    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (type === 'checkbox') {
        const currentVals = existing ? existing.value : [];
        const newVals = currentVals.includes(value) 
          ? currentVals.filter(v => v !== value) 
          : [...currentVals, value];
        return prev.filter(a => a.questionId !== questionId).concat({ questionId, value: newVals });
      } else {
        return prev.filter(a => a.questionId !== questionId).concat({ questionId, value });
      }
    });
  };

  const visibleQuestions = form?.questions.filter(q => {
    if (!q.condition || !q.condition.dependsOnId) return true;
    const depAnswer = answers.find(a => a.questionId === q.condition.dependsOnId);
    if (!depAnswer || !depAnswer.value) return false;
    
    if (Array.isArray(depAnswer.value)) {
      return depAnswer.value.includes(q.condition.requiredValue);
    }
    return depAnswer.value === q.condition.requiredValue;
  }) || [];

  const validateForm = () => {
    let newErrors = {};
    let firstErrorId = null;

    visibleQuestions.forEach(q => {
      if (q.required) {
        const ans = answers.find(a => a.questionId === q.id);
        const isEmpty = !ans || 
                        ans.value === '' || 
                        (Array.isArray(ans.value) && ans.value.length === 0);
        if (isEmpty) {
          newErrors[q.id] = 'This is a required question';
          if (!firstErrorId) firstErrorId = q.id;
        }
      }
    });

    setErrors(newErrors);

    if (firstErrorId && questionRefs.current[firstErrorId]) {
      questionRefs.current[firstErrorId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await axios.post(`/forms/${id}/responses`, { answers });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error submitting form';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Form Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">The form you are looking for does not exist or the URL is invalid.</p>
        <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center px-8 py-3 text-lg">
          Return Home
        </button>
      </div>
    );
  }

  if (!form) return <div className="p-10 text-center animate-pulse text-lg text-gray-500 font-medium">Loading form...</div>;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Response Submitted</h2>
        <p className="text-gray-600 mb-8">Thank you for filling out {form.title}. Your response has been recorded and the admin has been notified.</p>
        <button onClick={() => navigate('/')} className="btn-primary flex mx-auto items-center">Return Home</button>
      </div>
    );
  }

  const backLabel = user?.role === 'Admin' ? 'Back to Dashboard' : 'Back to Home';
  const backPath = user?.role === 'Admin' ? '/admin' : '/';

  // Calculate Progress based on visible routes
  const requiredQuestions = visibleQuestions.filter(q => q.required);
  const answeredRequired = requiredQuestions.filter(q => {
     const ans = answers.find(a => a.questionId === q.id);
     return ans && ans.value !== '' && (!Array.isArray(ans.value) || ans.value.length > 0);
  }).length;
  const progressPercent = requiredQuestions.length === 0 ? 100 : Math.round((answeredRequired / requiredQuestions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      <div className="mb-6">
        <Link to={backPath} className="inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Link>
      </div>

      <div className="sticky top-4 z-10 rounded-2xl border border-white/60 bg-white/90 px-5 py-4 shadow-sm backdrop-blur mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Form Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="card border-t-8 border-t-primary-500 mb-6 shadow-md">
        <div className="p-8 border-b border-gray-100">
           <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{form.title}</h1>
           <p className="text-gray-600 text-lg leading-relaxed">{form.description}</p>
           <hr className="my-6" />
           <p className="text-sm text-red-500 font-medium">* Indicates required question</p>
        </div>
      </div>

      {!user ? (
        <div className="card p-8 border border-amber-200 bg-amber-50/80 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-3">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to fill this form</h2>
              <p className="text-gray-700 mb-5">
                Please sign in to continue and submit your response for <span className="font-semibold">{form.title}</span>.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/login', { state: { from: `/view/${id}` } })}
                  className="btn-primary"
                >
                  Login to Fill Form
                </button>
                <button
                  onClick={() => navigate('/register', { state: { from: `/view/${id}` } })}
                  className="btn-secondary"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {visibleQuestions.map((q) => {
           const currentAnswer = answers.find(a => a.questionId === q.id)?.value || (q.type === 'checkbox' ? [] : '');
           const hasError = !!errors[q.id];

           return (
             <div 
               key={q.id} 
               ref={el => questionRefs.current[q.id] = el}
               className={`card p-6 border-l-4 transition-all ${hasError ? 'border-l-red-500 border-red-200 shadow-sm' : 'border-l-primary-100 border-gray-200 hover:shadow-md'}`}
             >
               <label className="block text-lg font-medium text-gray-900 mb-4">
                 {q.questionText} {q.required && <span className="text-red-500 ml-1">*</span>}
               </label>
               
               {q.type === 'text' && (
                 <input 
                   type="text" 
                   className={`input-field border rounded-xl bg-white px-4 py-3 text-base transition-colors ${hasError ? 'border-red-500 placeholder-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'}`} 
                   placeholder="Your answer"
                   value={currentAnswer}
                   onChange={e => handleAnswerChange(q.id, e.target.value, q.type)}
                 />
               )}
               {q.type === 'textarea' && (
                 <textarea 
                   className={`input-field border rounded-xl bg-white px-4 py-3 text-base transition-colors ${hasError ? 'border-red-500 placeholder-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'}`} 
                   placeholder="Your answer"
                   rows="4"
                   value={currentAnswer}
                   onChange={e => handleAnswerChange(q.id, e.target.value, q.type)}
                 />
               )}
               {q.type === 'radio' && (
                 <div className="space-y-3">
                   {q.options?.map((opt, j) => (
                     <label key={j} className={`flex items-center rounded-xl border px-4 py-3 transition-colors ${currentAnswer === opt ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'}`}>
                       <input 
                         type="radio" 
                         name={q.id} 
                         value={opt}
                         checked={currentAnswer === opt}
                         onChange={e => handleAnswerChange(q.id, e.target.value, q.type)}
                         className={`h-5 w-5 focus:ring-2 focus:ring-offset-1 ${hasError ? 'text-red-600 border-red-500 focus:ring-red-500' : 'text-primary-600 border-gray-300 focus:ring-primary-500'}`}
                       />
                       <span className="ml-3 block text-base font-normal text-gray-700">{opt}</span>
                     </label>
                   ))}
                 </div>
               )}
               {q.type === 'checkbox' && (
                 <div className="space-y-3">
                   {q.options?.map((opt, j) => (
                     <label key={j} className={`flex items-center rounded-xl border px-4 py-3 transition-colors ${currentAnswer.includes(opt) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'}`}>
                       <input 
                         type="checkbox" 
                         name={q.id} 
                         value={opt}
                         checked={currentAnswer.includes(opt)}
                         onChange={e => handleAnswerChange(q.id, e.target.value, q.type)}
                         className={`h-5 w-5 rounded focus:ring-2 focus:ring-offset-1 ${hasError ? 'text-red-600 border-red-500 focus:ring-red-500' : 'text-primary-600 border-gray-300 focus:ring-primary-500'}`}
                       />
                       <span className="ml-3 block text-base font-normal text-gray-700">{opt}</span>
                     </label>
                   ))}
                 </div>
               )}
               {q.type === 'select' && (
                 <select 
                   value={currentAnswer}
                   onChange={e => handleAnswerChange(q.id, e.target.value, q.type)}
                   className={`input-field w-full md:w-1/2 rounded-xl bg-white ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 bg-red-50' : 'border-gray-200 focus:border-primary-500'}`}
                 >
                   <option value="">Choose an option</option>
                   {q.options?.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                 </select>
               )}

               {/* Error Message */}
               {hasError && (
                 <div className="flex items-center mt-3 text-red-600 text-sm font-medium animate-pulse">
                   <AlertCircle className="w-4 h-4 mr-1.5" />
                   {errors[q.id]}
                 </div>
               )}
             </div>
           );
        })}

        <div className="flex justify-between items-center mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500">Never submit passwords through this form app.</p>
          <button type="submit" disabled={submitting} className="btn-primary px-8 py-3 text-lg font-semibold shadow-md transform hover:scale-105 transition-transform">
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default FormView;
