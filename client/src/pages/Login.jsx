import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="auth-card">
          <div>
            <h2 className="text-center text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Sign in 
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                create a new account
              </Link>
            </p>
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="input-field rounded-t-md bg-transparent"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="input-field rounded-b-md bg-transparent"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button type="submit" className="btn-primary w-full bg-blue-600 hover:bg-blue-500">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}