import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import MemberPage from '../pages/MemberPage';
import AuthPage from '../pages/AuthPage';
import TransactionPage from '../pages/TransactionPage';

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/admin" component={AdminPage} />
        <Route path="/member" component={MemberPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/transactions" component={TransactionPage} />
        <Route path="/" exact component={AuthPage} />
      </Switch>
    </Router>
  );
};

export default Routes;