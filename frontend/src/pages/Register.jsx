import React, { useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'User'
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/register', formData);
      login(res.data.user, res.data.token);
      toast.success('Registration successful!');
      navigate(redirectTo || (res.data.user.role === 'Admin' ? '/admin' : '/'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen border-t border-transparent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 glass-panel animate-float p-10 mt-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
             {location.state?.from ? 'Create an account to fill this form' : 'Register to submit or create forms'}
          </p>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleStandardSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="username"
                type="text"
                required
                className="input-field rounded-b-none border-b-0 h-10"
                placeholder="Username"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                className="input-field rounded-none border-b-0 h-10"
                placeholder="Email address"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="input-field rounded-t-none h-10"
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <select
              className="mt-1 input-field"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="User">Regular User</option>
              <option value="Admin">Admin (Create Forms)</option>
            </select>
          </div>

          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-glass focus:outline-none">
              Register
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" state={location.state} className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
