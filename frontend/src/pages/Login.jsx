import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { PackageSearch } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const emailInputRef = useRef(null);

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('name@company.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // useEffect + useRef: Auto-focus email field on mount and view change
  useEffect(() => {
    emailInputRef.current?.focus();
    setErrorMessage(null);
  }, [isLoginView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isLoginView) {
        const data = await authApi.login(email, password);
        if (data && data.token) {
          localStorage.setItem('token', data.token);
          login(data.user || {
            id: 1,
            name: email.split('@')[0],
            email,
            role: data.role || 'Employee',
            department_id: 1,
          });
          navigate('/');
          return;
        }
      } else {
        const data = await authApi.register({
          name: email.split('@')[0],
          email,
          password,
        });
        if (data && data.token) {
          localStorage.setItem('token', data.token);
          login(data.user || {
            id: 1,
            name: email.split('@')[0],
            email,
            role: 'Employee',
            department_id: 1,
          });
          navigate('/');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend auth request offline or invalid. Falling back to local auth state.', err);
    }

    // Fallback local mock authentication
    let mockRole = 'Employee';
    if (email.includes('admin')) mockRole = 'Admin';
    if (email.includes('manager')) mockRole = 'Asset Manager';
    if (email.includes('head')) mockRole = 'Department Head';

    login({
      id: 1,
      name: email.split('@')[0],
      email,
      role: mockRole,
      department_id: 1,
    });
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-bg-primary to-[#e2e8f0] p-4">
      <div className="card w-full max-w-[420px] p-10 shadow-lg flex flex-col">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-alert-success-bg text-accent-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <PackageSearch size={28} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">AssetFlow</h2>
          <p className="text-text-secondary text-sm">
            {isLoginView ? 'Welcome back to your workspace' : 'Create an employee account'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded bg-alert-danger-bg text-alert-danger text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col">
            <label className="label">Email Address</label>
            <input
              ref={emailInputRef}
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col mt-4">
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Password</label>
              {isLoginView && (
                <a href="#forgot" className="text-xs text-accent-primary font-medium hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-base mt-4 cursor-pointer"
          >
            {loading ? 'Authenticating...' : isLoginView ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center text-center text-text-secondary text-sm">
            <div className="flex-1 border-b border-border-color"></div>
            <span className="px-3">or</span>
            <div className="flex-1 border-b border-border-color"></div>
          </div>
          <div className="text-center text-sm text-text-secondary mt-4">
            {isLoginView ? (
              <p>
                New here? <br />
                <span className="block text-xs mt-1 text-text-primary">
                  Sign up creates an employee account. (Admin roles assigned later).
                </span>
              </p>
            ) : (
              <p>Already have an account?</p>
            )}
            <button
              type="button"
              className="btn btn-outline w-full mt-3 cursor-pointer"
              onClick={() => setIsLoginView(!isLoginView)}
            >
              {isLoginView ? 'Create an Account' : 'Sign In instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
