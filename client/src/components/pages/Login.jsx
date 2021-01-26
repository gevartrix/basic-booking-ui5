import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import Axios from 'axios';

// Import the required Web Components
// See the documentation here:
// https://sap.github.io/ui5-webcomponents/playground/components
import '@ui5/webcomponents/dist/Button';
import '@ui5/webcomponents/dist/Input';
import '@ui5/webcomponents/dist/Label';
import '@ui5/webcomponents/dist/Title';

import ErrorNotice from '../elements/ErrorNotice';
import userContext from '../../context/userContext';

export default function Login() {
  const { userData, setUserData, setRole } = useContext(userContext);
  const history = useHistory();
  const [error, setError] = useState();

  const inputEmail = useRef('');

  useEffect(() => {
    inputEmail.current.addEventListener('submit', handleSubmit);
  }, []);

  const handleSubmit = async () => {
    try {
      // Send the User object to our server
      // Proxy is set in the client's package.json
      const login = await Axios.post('/api/v1/auth/', { email: inputEmail.current.value });

      setUserData({
        token: login.data.token,
        user: login.data.user,
        bookings: login.data.bookings,
      });

      if (login.data.user.is_admin) {
        setRole({ admin: true });
      }
      localStorage.setItem('auth-token', login.data.token);

      // Redirect to the root
      history.push('/');
    } catch (error) {
      console.log(error);
      // Get errors as an array from the server
      error.response.data.error && setError(error.response.data.error);
    }
  };

  // If a user has already signed in, redirect him/her to the root
  if (userData.user)
    return (
      <div>
        <Redirect to="/" />
      </div>
    );

  // Paint the UI
  return (
    <div className="app-login">
      {error && <ErrorNotice errors={error} />}
      <ui5-title level="H1" wrap="true" class="app-title">
        Sign In
      </ui5-title>
      <ui5-input
        class="app-email"
        type="email"
        placeholder="Enter your E-Mail and hit Enter"
        ref={inputEmail}
        required
      ></ui5-input>
    </div>
  );
}
