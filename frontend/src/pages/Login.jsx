import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PackageSearch } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('name@company.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Temporary Mock Login Logic
    // In a real app we would await an API call to our backend here
    
    let mockRole = 'Employee';
    if (email.includes('admin')) mockRole = 'Admin';
    if (email.includes('manager')) mockRole = 'Asset Manager';
    if (email.includes('head')) mockRole = 'Department Head';

    login({
      id: 1,
      name: email.split('@')[0],
      email,
      role: mockRole,
      department_id: 1
    });

    navigate('/'); // go to dashboard
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="logo-icon flex items-center justify-center">
            <PackageSearch size={28} className="text-blue" />
          </div>
          <h2>AssetFlow</h2>
          <p>{isLoginView ? 'Welcome back to your workspace' : 'Create an employee account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group flex-col">
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group flex-col mt-4">
            <div className="flex justify-between items-center">
              <label className="label">Password</label>
              {isLoginView && <a href="#" className="forgot-link">Forgot password?</a>}
            </div>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary login-submit mt-4">
            {isLoginView ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer mt-4">
          <div className="divider">
            <span>or</span>
          </div>
          <div className="toggle-view mt-4">
            {isLoginView ? (
              <p>
                New here? <br/>
                <span>Sign up creates an employee account. (Admin roles assigned later).</span>
              </p>
            ) : (
              <p>Already have an account?</p>
            )}
            <button 
              type="button" 
              className="btn btn-outline toggle-btn mt-2" 
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
