// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email
      });

      if (response.data.success) {
        // Store user info in localStorage
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', response.data.user.name);
        
        toast.success('Welcome to Guhuza!');
        setTimeout(() => {
          navigate('/method-choice');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-2xl shadow-lg mb-4">
            <div className="text-5xl font-bold text-blue-600">G</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Guhuza</h1>
          <p className="text-gray-600">AI-Powered Job Description Optimizer</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Employer Login
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="employer@company.com"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo Account: <span className="font-medium text-blue-600">employer@guhuza.com</span>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Features:</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                  AI Analysis
                </span>
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                  Smart Builder
                </span>
                <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full">
                  Real-time Preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 Guhuza. All rights reserved.</p>
          <a href="https://www.guhuza.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            www.guhuza.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;