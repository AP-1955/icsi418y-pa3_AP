import { useState } from 'react';
import axios from 'axios';

export default function Login({ onSwitch, onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      setMessage(res.data.message);
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };
    
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="Username" onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        <button type="submit" style={{ padding: '10px' }}>Log In</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: 'blue' }}>{message}</p>}
      <p style={{ marginTop: '15px' }}>Need an account? <button onClick={onSwitch}>Sign up here</button></p>
    </div>
  );
}