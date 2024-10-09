import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSigninCheck } from 'reactfire';

function PrivateRoute({ children }) {
  const { status, data: signInCheckResult } = useSigninCheck();

  if (status === 'loading') {
    return <span>Loading...</span>;
  }

  if (signInCheckResult.signedIn === true) {
    return children;
  }

  return <Navigate to="/login" replace />;
}

export default PrivateRoute;