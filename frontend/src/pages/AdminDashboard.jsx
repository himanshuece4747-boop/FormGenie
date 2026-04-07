import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { PlusCircle, FileText, BarChart, Share2, X, Copy, Zap, Search } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState({ totalForms: 0, totalResponses: 0 });
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchFormsAndStats = async () => {
      try {
        const [formsRes, statsRes] = await Promise.all([
          axios.get('/forms'), // already auth'd, getting user forms
          axios.get('/forms/stats') // getting global stats
        ]);
        setForms(formsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchFormsAndStats();
  }, []);

  const handleShareCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/view/${shareModal._id}`);
    toast.success('Form link copied to clipboard!');
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Antigravity Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Quick Stats - Framer Motion */}
      <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
      >
        <div className="glass-panel p-6 flex flex-col justify-center items-center">
            <h3 className="text-gray-500 font-semibold mb-2">Total Forms Created</h3>
            <p className="text-4xl font-extrabold text-primary-600 flex items-center">
              <FileText className="w-8 h-8 mr-2 opacity-50" /> {stats.totalForms}
            </p>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center items-center">
            <h3 className="text-gray-500 font-semibold mb-2">Total Responses Received</h3>
            <p className="text-4xl font-extrabold text-blue-600 flex items-center">
              <BarChart className="w-8 h-8 mr-2 opacity-50" /> {stats.totalResponses}
            </p>
        </div>
      </motion.div>

      {/* Header Actions */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.2 }}
         className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your forms and view analytics natively.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link to="/admin/manual-builder" className="btn-secondary flex items-center justify-center">
             <PlusCircle className="w-4 h-4 mr-2" /> Custom Form
          </Link>
          <Link to="/admin/builder" className="btn-primary flex items-center justify-center">
            <Zap className="w-4 h-4 mr-2" /> Auto Generate with AI
          </Link>
        </div>
      </motion.div>

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-sm w-full p-8 relative border border-white/50"
          >
             <button onClick={() => setShareModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
                <X className="w-6 h-6" />
             </button>
             <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Share Form</h3>
             <div className="flex justify-center mb-6 bg-gray-100 p-4 rounded-xl">
                <QRCodeCanvas value={`${window.location.origin}/view/${shareModal._id}`} size={200} />
             </div>
             <p className="text-sm font-semibold text-gray-600 mb-2">Public Link</p>
             <div className="flex">
               <input 
                 readOnly 
                 value={`${window.location.origin}/view/${shareModal._id}`} 
                 className="flex-1 input-field bg-white/50 text-xs rounded-r-none border-r-0 h-10"
               />
               <button 
                 onClick={handleShareCopy}
                 className="btn-primary rounded-l-none flex items-center px-4"
               >
                 <Copy className="w-4 h-4" />
               </button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Forms Grid */}
      <motion.div 
         initial="hidden"
         animate="visible"
         variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
         }}
         className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {forms.length === 0 ? (
          <div className="col-span-full glass-panel p-16 text-center shadow-sm border border-gray-100/50">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No forms available</h3>
            <p className="text-gray-500 mt-2">Create your first custom form or ask AI to build one.</p>
          </div>
        ) : (
          forms.map((form) => (
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               key={form._id} 
               className="glass-panel animate-float flex flex-col justify-between"
               style={{ animationDelay: `${Math.random() * 2}s` }} // offset the floating for natural look
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{form.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{form.description}</p>
                <div className="mt-4 flex items-center text-xs font-semibold text-gray-400">
                   <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full mr-2">
                     {form.questions?.length ?? 0} Questions
                   </div>
                   Created {new Date(form.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-white/30 backdrop-blur-sm border-t border-white/40 p-4 flex flex-wrap gap-3">
                 <button onClick={() => setShareModal(form)} className="flex-1 min-w-[120px] inline-flex justify-center items-center text-sm font-medium text-gray-700 bg-white/70 border border-gray-200 px-3 py-2 rounded-lg hover:bg-white shadow-sm transition-all focus:ring-2 focus:ring-primary-500">
                   <Share2 className="w-4 h-4 mr-2 text-primary-500" /> Share
                 </button>
                 <Link to={`/admin/responses/${form._id}`} className="flex-1 min-w-[120px] inline-flex justify-center items-center text-sm font-medium text-gray-700 bg-white/70 border border-gray-200 px-3 py-2 rounded-lg hover:bg-white shadow-sm transition-all focus:ring-2 focus:ring-primary-500">
                   <BarChart className="w-4 h-4 mr-2 text-blue-500" /> Analytics
                 </Link>
                 <Link to={`/view/${form._id}`} className="w-full text-center text-sm font-bold text-primary-600 hover:text-primary-700 mt-2">
                    Preview Public Form {'->'}
                 </Link>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

    </div>
  );
};

export default AdminDashboard;
