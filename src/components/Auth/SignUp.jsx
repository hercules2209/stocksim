import React, { useState } from 'react';
import { useAuth, useFirestore } from 'reactfire';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Attempting to create user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user);

      console.log('Updating user profile with username:', username);
      await updateProfile(userCredential.user, { displayName: username });
      console.log('User profile updated successfully');

      console.log('Creating user document in Firestore');
      try {
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          username,
          email,
        });
        console.log('User document created successfully');
      } catch (firestoreError) {
        console.error('Error creating user document:', firestoreError);
        // Even if Firestore document creation fails, we'll still consider the signup successful
        // You might want to add some error reporting here
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error during sign up:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('An error occurred during sign up');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;