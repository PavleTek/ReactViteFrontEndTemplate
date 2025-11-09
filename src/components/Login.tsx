import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { twoFactorService } from '../services/twoFactorService';
import TwoFactorSetup from './TwoFactorSetup';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [requiresTwoFactorSetup, setRequiresTwoFactorSetup] = useState(false);
  const [justReturnedFrom2FA, setJustReturnedFrom2FA] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Reset the flag after a short delay to prevent auto-submission but allow manual submission
  useEffect(() => {
    if (justReturnedFrom2FA) {
      const timer = setTimeout(() => {
        setJustReturnedFrom2FA(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [justReturnedFrom2FA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent auto-submission if user just returned from 2FA screen
    if (justReturnedFrom2FA) {
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ username, password });
      
      // Check if 2FA verification is required (user already has 2FA set up)
      if (response.requiresTwoFactor && response.tempToken) {
        setRequiresTwoFactor(true);
        setTempToken(response.tempToken);
        setIsLoading(false);
        return;
      }

      // Check if 2FA setup is required (user doesn't have 2FA set up)
      if (response.requiresTwoFactorSetup && response.tempToken) {
        setRequiresTwoFactorSetup(true);
        setTempToken(response.tempToken);
        setIsLoading(false);
        return;
      }

      // Normal login success
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setIsLoading(false);
      // Don't navigate or reload - just show error
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!tempToken) {
      setError('Session expired. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await twoFactorService.verifyTwoFactor({
        tempToken,
        code: twoFactorCode
      });

      if (response.token && response.user) {
        // Store auth data and update context
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Reload from localStorage to update context
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
          window.location.reload(); // Simple way to refresh auth state
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid 2FA code. Please try again.');
      setIsLoading(false);
      // Clear the code input on error so user can try again
      setTwoFactorCode('');
      // Don't navigate or reload - just show error
    }
  };

  const handleTwoFactorSetupComplete = async (result?: { token?: string; user?: any; backupCodes?: string[] }) => {
    if (result?.token && result?.user) {
      // Store auth data and complete login
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Reload to update auth context
      window.location.reload();
    } else {
      // Fallback: switch to verification (shouldn't happen with mandatory setup)
      setRequiresTwoFactorSetup(false);
      setRequiresTwoFactor(true);
    }
  };

  // Show mandatory 2FA setup screen
  if (requiresTwoFactorSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Two-Factor Authentication Required
              </h2>
              <p className="text-sm text-gray-600">
                Your administrator has enabled two-factor authentication. You must set up 2FA to continue.
              </p>
            </div>
            <TwoFactorSetup
              onComplete={handleTwoFactorSetupComplete}
              onCancel={undefined} // No cancel option for mandatory setup
              tempToken={tempToken || undefined}
              isMandatory={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (requiresTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the code from your authenticator app
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleTwoFactorSubmit}>
            <div>
              <label htmlFor="twoFactorCode" className="sr-only">
                2FA Code
              </label>
              <input
                id="twoFactorCode"
                name="twoFactorCode"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setRequiresTwoFactor(false);
                  setTempToken(null);
                  setTwoFactorCode('');
                  setError('');
                  setJustReturnedFrom2FA(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
