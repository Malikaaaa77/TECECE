import React, { useState } from 'react';
import axios from 'axios';

const UploadPayment = () => {
  const [receipt, setReceipt] = useState(null);
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('receipt', receipt);
    formData.append('description', description);
    formData.append('period', period);

    try {
      const response = await axios.post('/api/member/upload-payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Upload Payment Proof</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Period:</label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Receipt:</label>
          <input type="file" onChange={handleFileChange} required />
        </div>
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadPayment;