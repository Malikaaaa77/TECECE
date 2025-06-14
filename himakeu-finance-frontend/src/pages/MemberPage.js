import React from 'react';
import MemberDashboard from '../components/Member/Dashboard';
import UploadPayment from '../components/Member/UploadPayment';
import PaymentHistory from '../components/Member/PaymentHistory';

const MemberPage = () => {
  return (
    <div>
      <h1>Member Page</h1>
      <MemberDashboard />
      <UploadPayment />
      <PaymentHistory />
    </div>
  );
};

export default MemberPage;