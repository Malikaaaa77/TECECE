import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import Profile from '../components/Auth/Profile';

const AuthPage = () => {
  return (
    <div className="auth-page">
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/profile" component={Profile} />
      </Switch>
    </div>
  );
};

export default AuthPage;