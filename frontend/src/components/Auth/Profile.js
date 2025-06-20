import React, { useEffect, useState } from 'react';
import { getProfile } from '../../api'; // Assuming you have a function to get user profile

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        setUser(profileData);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>Full Name:</strong> {user.fullName}</p>
      <p><strong>NIM:</strong> {user.nim}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Department:</strong> {user.department}</p>
      <p><strong>Year Joined:</strong> {user.yearJoined}</p>
      {/* Add more fields as necessary */}
    </div>
  );
};

export default Profile;