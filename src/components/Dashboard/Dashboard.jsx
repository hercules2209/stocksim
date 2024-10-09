import React, { useState } from 'react';
import { useUser, useStorage, useAuth } from 'reactfire';
import { updateProfile, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import defaulAvatar from '/home/harsh/Documents/Stocksim/stocksim/frontend/src/assets/images/default-avatar.png';
import './Dashboard.css';

function Dashboard() {
  const { data: user } = useUser();
  const storage = useStorage();
  const auth = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      let photoURL = user.photoURL;

      if (file) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, { 
        displayName: displayName,
        photoURL: photoURL
      });

      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      setError('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.displayName || 'User'}!</h2>
      <div className="profile-section">
        <img src={user?.photoURL || defaulAvatar} alt="Profile" className="profile-picture" />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button type="submit" className="update-button">Update Profile</button>
        </form>
      </div>
      <div className="user-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.uid}</p>
        <p><strong>Account Created:</strong> {user?.metadata.creationTime}</p>
        <p><strong>Last Sign In:</strong> {user?.metadata.lastSignInTime}</p>
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Dashboard;