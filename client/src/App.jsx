import { useState } from 'react';
import Signup from './Signup';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div>
      {isLogin ? (
        <Login onSwitch={() => setIsLogin(false)} 
        onLoginSuccess={() => setIsLoggedIn(true)} 
        />
      ) : (
        <Signup onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  );
}