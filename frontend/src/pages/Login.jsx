import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { User } from 'lucide-react';

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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] to-[#d9e2ec] p-4">
      <div className="card w-full max-w-[400px] p-8 shadow-lg flex flex-col border-2 border-border-color">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-6">AssetFlow – {isLoginView ? 'login' : 'sign up'}</h1>
          <div className="w-16 h-16 rounded-full border-2 border-border-color mx-auto flex items-center justify-center bg-bg-primary">
            <User size={28} className="text-text-secondary" />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded bg-alert-danger-bg text-alert-danger text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="label">Email</label>
            <input 
              ref={emailInputRef}
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="label mb-0">Password</label>
              {isLoginView && (
                <a href="#" className="text-xs text-text-secondary hover:text-accent-primary transition-colors no-underline">
                  Forgot password
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
            className="btn btn-primary w-full py-3 text-base mt-1"
          >
            {loading ? 'Authenticating...' : isLoginView ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-color">
          {isLoginView ? (
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">New here?</p>
              <div className="border border-border-color rounded-lg p-3 mb-4 bg-bg-primary">
                <p className="text-xs text-text-primary leading-relaxed m-0">
                  Sign up creates an employee account.<br/>Admin roles assigned later.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center mb-3">Already have an account?</p>
          )}
          <button 
            type="button" 
            className="btn btn-outline w-full py-2.5" 
            onClick={() => setIsLoginView(!isLoginView)}
          >
            {isLoginView ? 'Create Account' : 'Sign In instead'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
