import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  // Holds the current values of all three form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Holds field-level validation errors returned by the backend
  const [errors, setErrors] = useState({});

  // Holds a general error message (e.g., duplicate username)
  const [generalError, setGeneralError] = useState('');

  // Tracks whether a request is currently in progress
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      await axiosInstance.post('/api/users/register', formData);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 400) {
          // Field-level validation errors, e.g. { "title": "..." }
          setErrors(data);
        } else if (status === 409) {
          // Duplicate username/email conflict
          setGeneralError(data.message);
        } else {
          setGeneralError('Something went wrong. Please try again.');
        }
      } else {
        setGeneralError('Unable to reach the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        {generalError && <div className="error-banner">{generalError}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;