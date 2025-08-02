import React from 'react';
import { googleLogout } from '@react-oauth/google';

function Logout({ setUser, clientId }) {
  const onSuccess = () => {
    googleLogout();
    setUser(null);
    localStorage.setItem("login", null);
    console.log('Logout made successfully');
  };

  return (
    <button onClick={onSuccess}>
      Logout
    </button>
  );
}

export default Logout;