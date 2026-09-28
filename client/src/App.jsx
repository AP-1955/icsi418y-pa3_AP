import { useState } from 'react';
import Signup from './Signup';
import Login from './Login';

export default function App() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div>
      {isLogin ? (
        <Login onSwitch={() => setIsLogin(false)} />
      ) : (
        <Signup onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  );
}