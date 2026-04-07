import React, { useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success('Successfully logged in!');
      navigate(redirectTo || (res.data.user.role === 'Admin' ? '/admin' : '/'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen border-t border-transparent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel animate-float p-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {location.state?.from ? 'Login to fill this form' : 'Login to access your account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleStandardSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="input-field rounded-b-none border-b-0 h-12"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="input-field rounded-t-none h-12"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium outline-none text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-glass">
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" state={location.state} className="font-medium text-primary-600 hover:text-primary-500">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
