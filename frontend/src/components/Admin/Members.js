import React, { useState, useEffect } from 'react';
import { getAllMembers, updateMemberStatus, deleteUser } from '../../api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Modal from '../Common/Modal';
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getAllMembers();
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (memberId, newStatus) => {
    try {
      await updateMemberStatus(memberId, { status: newStatus });
      await fetchMembers();
      alert(`Member status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update member status:', error);
      alert('Failed to update member status');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await deleteUser(memberId);
        await fetchMembers();
        alert('Member deleted successfully');
        setShowModal(false);
      } catch (error) {
        console.error('Failed to delete member:', error);
        alert('Failed to delete member');
      }
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesFilter = filter === 'all' || member.status === filter;
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.nim?.includes(searchTerm) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'success',
      inactive: 'warning',
      suspended: 'danger'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status?.toLowerCase()]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="members-management">
      <div className="page-header">
        <h2>Members Management</h2>
        <p>Manage user accounts and member information</p>
      </div>

      <div className="members-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="members-summary">
          <div className="summary-item">
            <span className="label">Total Members:</span>
            <span className="value">{members.length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Active:</span>
            <span className="value success">
              {members.filter(m => m.status === 'active').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Inactive:</span>
            <span className="value warning">
              {members.filter(m => m.status === 'inactive').length}
            </span>
          </div>
        </div>

        <button className="refresh-btn" onClick={fetchMembers}>
          🔄 Refresh
        </button>
      </div>

      <div className="members-table-container">
        {filteredMembers.length > 0 ? (
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>NIM</th>
                <th>Email</th>
                <th>Faculty</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="member-details">
                        <strong>{member.name || 'Unknown'}</strong>
                        <small>{member.phone || 'No phone'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{member.nim || 'N/A'}</td>
                  <td>{member.email}</td>
                  <td>{member.faculty || 'N/A'}</td>
                  <td>{member.batch || 'N/A'}</td>
                  <td>{getStatusBadge(member.status)}</td>
                  <td>{formatDate(member.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowModal(true);
                        }}
                      >
                        View
                      </button>
                      
                      {member.status === 'active' ? (
                        <button
                          className="btn-deactivate"
                          onClick={() => handleStatusUpdate(member.id, 'inactive')}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn-activate"
                          onClick={() => handleStatusUpdate(member.id, 'active')}
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No members found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {showModal && selectedMember && (
        <Modal 
          title="Member Details" 
          onClose={() => {
            setShowModal(false);
            setSelectedMember(null);
          }}
        >
          <div className="member-detail-modal">
            <div className="member-profile">
              <div className="profile-avatar">
                {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3>{selectedMember.name}</h3>
              {getStatusBadge(selectedMember.status)}
            </div>

            <div className="member-info-grid">
              <div className="info-section">
                <h4>Personal Information</h4>
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{selectedMember.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">NIM:</span>
                  <span className="value">{selectedMember.nim || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedMember.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{selectedMember.phone || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">{selectedMember.address || 'N/A'}</span>
                </div>
              </div>

              <div className="info-section">
                <h4>Academic Information</h4>
                <div className="info-item">
                  <span className="label">Faculty:</span>
                  <span className="value">{selectedMember.faculty || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Batch:</span>
                  <span className="value">{selectedMember.batch || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value">{getStatusBadge(selectedMember.status)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Joined:</span>
                  <span className="value">{formatDate(selectedMember.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="member-stats">
              <h4>Payment Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{selectedMember.total_payments || 0}</span>
                  <span className="stat-label">Total Payments</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    Rp {(selectedMember.total_amount || 0).toLocaleString()}
                  </span>
                  <span className="stat-label">Total Amount</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{selectedMember.pending_payments || 0}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <div className="status-actions">
                {selectedMember.status === 'active' ? (
                  <>
                    <button
                      className="btn-warning"
                      onClick={() => {
                        handleStatusUpdate(selectedMember.id, 'inactive');
                        setShowModal(false);
                      }}
                    >
                      Deactivate Member
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => {
                        handleStatusUpdate(selectedMember.id, 'suspended');
                        setShowModal(false);
                      }}
                    >
                      Suspend Member
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-success"
                    onClick={() => {
                      handleStatusUpdate(selectedMember.id, 'active');
                      setShowModal(false);
                    }}
                  >
                    Activate Member
                  </button>
                )}
              </div>

              <button
                className="btn-danger delete-btn"
                onClick={() => handleDeleteMember(selectedMember.id)}
              >
                Delete Member
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Members;