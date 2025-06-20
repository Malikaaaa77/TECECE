import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    nim: '',
    phone: '',
    address: '',
    faculty: '',
    batch: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data || {});
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateProfile(profile);
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    fetchProfile(); // Reset to original data
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="member-profile">
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-container">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3>{profile.name || 'User Name'}</h3>
          <p className="user-role">Member</p>
        </div>

        <div className="profile-form-container">
          <div className="form-header">
            <h3>Personal Information</h3>
            {!editing ? (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="form-actions">
                <button 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nim">NIM</label>
                <input
                  type="text"
                  id="nim"
                  name="nim"
                  value={profile.nim || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="faculty">Faculty</label>
                <select
                  id="faculty"
                  name="faculty"
                  value={profile.faculty || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                >
                  <option value="">Select Faculty</option>
                  <option value="Teknik">Fakultas Teknik</option>
                  <option value="MIPA">Fakultas MIPA</option>
                  <option value="Ekonomi">Fakultas Ekonomi</option>
                  <option value="Hukum">Fakultas Hukum</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="batch">Batch/Angkatan</label>
                <select
                  id="batch"
                  name="batch"
                  value={profile.batch || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                >
                  <option value="">Select Batch</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows="3"
                  placeholder="Enter your complete address"
                />
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;