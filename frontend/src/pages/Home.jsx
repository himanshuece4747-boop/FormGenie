import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import {
  FileText,
  ArrowRight,
  Sparkles,
  ScanSearch,
  ChartNoAxesCombined,
  WandSparkles,
  Clock3
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get('/forms');
        setForms(res.data);
      } catch (err) {
        console.error('Failed to fetch forms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const totalForms = forms.length;
  const latestFormDate = forms[0]?.createdAt
    ? new Date(forms[0].createdAt).toLocaleDateString()
    : 'Today';
  const highlightedForms = forms.slice(0, 6);

  if (loading) {
    return <div className="text-center p-10 text-lg font-medium text-gray-600">Loading forms...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/65 px-6 py-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 lg:px-12 lg:py-14">
        <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-44 w-44 rounded-full bg-orange-200/40 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Smart forms that feel modern from the first click
            </div>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Build, publish, and explore forms with an interface that actually grabs attention.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              FormGenie turns plain form workflows into a polished experience with AI-powered creation,
              clean public pages, and analytics that feel fast and professional.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={user?.role === 'Admin' ? '/admin/builder' : '/register'}
                className="btn-primary inline-flex items-center justify-center px-6 py-3 text-base font-semibold"
              >
                {user?.role === 'Admin' ? 'Create With AI' : 'Get Started'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to={user?.role === 'Admin' ? '/admin/manual-builder' : '/login'}
                className="btn-secondary inline-flex items-center justify-center px-6 py-3 text-base font-semibold"
              >
                {user?.role === 'Admin' ? 'Build Manually' : 'Login'}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Live Forms</span>
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900">{totalForms}</p>
                <p className="mt-1 text-sm text-slate-500">Ready to fill right now</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Latest Drop</span>
                  <Clock3 className="h-4 w-4 text-sky-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900">{latestFormDate}</p>
                <p className="mt-1 text-sm text-slate-500">Newest published form</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Experience</span>
                  <WandSparkles className="h-4 w-4 text-orange-500" />
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900">AI + UX</p>
                <p className="mt-1 text-sm text-slate-500">Fast creation and elegant sharing</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Interactive Preview</p>
                  <h2 className="mt-2 text-2xl font-bold">Why users stop scrolling</h2>
                </div>
                <div className="rounded-full bg-white/10 p-3">
                  <ChartNoAxesCombined className="h-5 w-5 text-emerald-300" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/80">AI Build Flow</span>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-300">Fast</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ duration: 1.1, delay: 0.4 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-sky-300"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <ScanSearch className="mb-3 h-5 w-5 text-sky-300" />
                    <p className="text-lg font-bold">Beautiful previews</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      Forms feel less like admin work and more like a product experience.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <Sparkles className="mb-3 h-5 w-5 text-orange-300" />
                    <p className="text-lg font-bold">Smoother onboarding</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      Cleaner entry points help visitors understand what to do immediately.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-emerald-400/20 to-sky-400/20 p-4">
                  <p className="text-sm font-semibold text-white/80">FormGenie Signal</p>
                  <p className="mt-2 text-3xl font-black">Designed to feel alive</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700">Available Forms</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Explore what is live right now</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Pick a form below to see the public experience. The cards animate and elevate on hover to make the dashboard feel active and modern.
          </p>
        </div>

        {highlightedForms.length === 0 ? (
          <div className="glass-panel rounded-[1.75rem] p-12 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-12 w-12 text-primary-500" />
            <h3 className="text-2xl font-bold text-slate-900">No forms available yet</h3>
            <p className="mt-3 text-slate-500">Create the first form and this dashboard will instantly feel alive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {highlightedForms.map((form, index) => (
              <motion.div
                key={form._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group"
              >
                <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/78 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-orange-300" />
                  <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-primary-200/30 blur-2xl transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative flex h-full flex-col">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-2xl bg-primary-50 p-3 text-primary-600 shadow-sm">
                        <FileText className="h-6 w-6" />
                      </div>
                      <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{form.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{form.description}</p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Access</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">Public View</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flow</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">Login to Submit</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4">
                      <Link
                        to={user ? `/form/${form._id}` : '/login'}
                        state={user ? undefined : { from: `/view/${form._id}` }}
                        className="inline-flex items-center text-sm font-bold text-primary-700 transition-colors hover:text-primary-800"
                      >
                        {user ? 'Open Form' : 'Login to fill form'}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
