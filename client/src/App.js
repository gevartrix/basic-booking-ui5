import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import Axios from 'axios';

// Enable IE11 + Edge support
import '@ui5/webcomponents-base/dist/features/browsersupport/IE11';
import '@ui5/webcomponents/dist/Assets';
// Import custom components and styles
import Navbar from './components/elements/Navbar';
import Login from './components/pages/Login';
import Admin from './components/pages/Admin';
import User from './components/pages/User';
import userContext from './context/userContext';
import './App.css';

export default function App() {
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
  });
  const [role, setRole] = useState({ admin: false });

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem('auth-token');
      // On the first run there's no `auth-token` key in the local storage
      if (token === null) {
        localStorage.setItem('auth-token', '');
        token = '';
      }
      try {
        // POST requests to the server to check the token's validity
        const tokenRes = await Axios.post('/api/v1/auth/token', null, { headers: { 'x-auth-token': token } });
        // If the token is valid, get the user from the server and set the global userData context
        // Else, reset the context
        if (tokenRes.data) {
          const userRes = await Axios.get('/api/v1/auth/', { headers: { 'x-auth-token': token } });
          setUserData({
            token: userRes.data.token,
            user: userRes.data.user,
            bookings: userRes.data.bookings,
          });
          setRole({
            admin: userRes.data.user.is_admin,
          });
        }
      } catch (error) {
        // Reset the context
        setUserData({});
        setRole({
          admin: false,
        });
      }
    };

    checkLoggedIn();
  }, []);

  return (
    <Router>
      <userContext.Provider value={{ userData, setUserData, role, setRole }}>
        <Navbar />
        <div className="app">
          <>
            {role.admin ? (
              <>
                <Route path="/" exact component={Admin} />
              </>
            ) : (
              <>
                <Route path="/" exact component={User} />
              </>
            )}
          </>
          <Route path="/login" exact component={Login} />
          <Redirect to="/login" />
        </div>
      </userContext.Provider>
    </Router>
  );
}
