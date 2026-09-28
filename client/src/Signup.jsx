import { useState } from 'react';
import axios from 'axios';

export default function Signup({ onSwitch }) {
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/signup', formData);
      setMessage(res.data.message);
    } catch (err) {
      console.error("Signup error details:", err.response?.data || err);
      setMessage(err.response?.data?.message || 'Server error: check if MongoDB and backend are running.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          name="f_name"
          placeholder="First Name"
          value={formData.f_name}
          onChange={handleChange}
          required
        />
        <input
          name="l_name"
          placeholder="Last Name"
          value={formData.l_name}
          onChange={handleChange}
          required
        />
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{ padding: '10px' }}>Register</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      <p style={{ marginTop: '15px' }}>Already have an account? <button onClick={onSwitch}>Login here</button></p>
    </div>
  );
}