import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { ArrowLeft, Download, Sparkles, Loader2, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ResponsesView = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics | individual
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, respRes] = await Promise.all([
          axios.get(`/forms/${id}`),
          axios.get(`/forms/${id}/responses`)
        ]);
        setForm(formRes.data);
        setResponses(respRes.data);
      } catch (err) {
        console.error('Error fetching responses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`/forms/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${form.title.replace(/\\s+/g, '_')}_Responses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await axios.get(`/forms/${id}/insights`);
      setInsight(res.data.insight);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AI Analytics');
    } finally {
      setLoadingInsight(false);
    }
  };

  const getChartData = (question) => {
    const counts = {};
    responses.forEach(resp => {
      const ans = resp.answers.find(a => a.questionId === question.id);
      if (ans && ans.value) {
        if (Array.isArray(ans.value)) {
          ans.value.forEach(val => counts[val] = (counts[val] || 0) + 1);
        } else {
          counts[ans.value] = (counts[ans.value] || 0) + 1;
        }
      }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  if (loading) return <div className="p-10 text-center">Loading responses...</div>;
  if (!form) return <div className="p-10 text-center text-red-500">Form not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
       <div className="mb-8 flex justify-between items-end">
         <div>
           <Link to="/admin" className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium mb-4">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
           </Link>
           <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
           <p className="text-gray-500 mt-2">{responses.length} responses</p>
         </div>
         {responses.length > 0 && (
           <div className="flex space-x-3">
             <button onClick={handleGenerateInsight} disabled={loadingInsight} className="btn-primary bg-primary-600 hover:bg-primary-700 text-white flex items-center shadow-glass transition-all disabled:opacity-70">
               {loadingInsight ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} 
               AI Insights
             </button>
             <button onClick={handleExportCSV} className="btn-secondary flex items-center shadow-sm">
               <Download className="w-4 h-4 mr-2" /> Export CSV
             </button>
           </div>
         )}
       </div>

       {/* AI Insight Modal */}
       {insight && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative border border-white/50 max-h-[90vh] overflow-y-auto">
             <button onClick={() => setInsight(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <X className="w-6 h-6" />
             </button>
             <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <Sparkles className="w-6 h-6 mr-2 text-primary-500" /> Executive AI Summary
             </h3>
             <div className="text-gray-700 space-y-4 prose prose-sm max-w-none">
                {insight.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('#') || line.startsWith('**') ? 'font-bold text-gray-900 text-lg mt-4' : 'text-base leading-relaxed'}>
                    {line.replace(/\*\*/g, '') /* Strip raw markdown bolding locally */}
                  </p>
                ))}
             </div>
           </div>
         </div>
       )}

       {responses.length === 0 ? (
         <div className="card p-10 text-center text-gray-500">
            No responses yet. Share the form link to start collecting responses!
         </div>
       ) : (
         <>
           <div className="flex border-b border-gray-200 mb-8">
             <button
               onClick={() => setActiveTab('analytics')}
               className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
             >
               Analytics
             </button>
             <button
               onClick={() => setActiveTab('individual')}
               className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'individual' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
             >
               Individual Responses
             </button>
           </div>

           {activeTab === 'analytics' && (
             <div className="space-y-8">
               {form.questions.map(q => {
                 const isChoice = ['radio', 'select', 'checkbox'].includes(q.type);
                 const chartData = isChoice ? getChartData(q) : [];

                 return (
                   <div key={q.id} className="card p-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">{q.questionText}</h3>
                     {!isChoice && (
                       <p className="text-sm text-gray-500 italic">Text responses are only viewable in the Individual tab or CSV.</p>
                     )}
                     {isChoice && chartData.length > 0 && (
                       <div className="h-72 w-full mt-4">
                         {q.type === 'checkbox' ? (
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" />
                               <YAxis allowDecimals={false} />
                               <Tooltip cursor={{fill: 'transparent'}} />
                               <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                             </BarChart>
                           </ResponsiveContainer>
                         ) : (
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                 {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                               </Pie>
                               <Tooltip />
                             </PieChart>
                           </ResponsiveContainer>
                         )}
                       </div>
                     )}
                     {isChoice && chartData.length === 0 && (
                       <p className="text-sm text-gray-500">No data submitted for this question.</p>
                     )}
                   </div>
                 );
               })}
             </div>
           )}

           {activeTab === 'individual' && (
              <div className="space-y-8">
                {responses.map((resp, idx) => (
                   <div key={resp._id} className="card p-6 border-l-4 border-l-primary-500">
                     <div className="flex justify-between items-center mb-6 border-b pb-4">
                       <h3 className="text-xl font-bold text-gray-900 flex items-center">
                         Response #{idx + 1}
                       </h3>
                       <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{new Date(resp.createdAt).toLocaleString()}</span>
                     </div>
                     
                     <dl className="space-y-6">
                       {form.questions.map(q => {
                         const ans = resp.answers.find(a => a.questionId === q.id);
                         let displayAns = "No Answer";
                         if (ans && ans.value) {
                           displayAns = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
                         }
                         return (
                           <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                             <dt className="text-sm font-semibold text-gray-600 mb-1">{q.questionText}</dt>
                             <dd className="text-base text-gray-900">{displayAns}</dd>
                           </div>
                         );
                       })}
                     </dl>
                   </div>
                ))}
              </div>
           )}
         </>
       )}
    </div>
  );
};

export default ResponsesView;
