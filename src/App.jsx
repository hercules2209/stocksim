import React from 'react';
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, FirestoreProvider, StorageProvider } from 'reactfire';
import { auth, firestore, storage } from './firebase';
import Sidebar from './components/sidebar/sidebar';
import Home from './components/home/home';
import Learn from './components/Learn/Learn';
import Stock from './components/stock/stock';
import PortfolioOverview from './components/Portfolios/PortfolioOverview';
import PortfolioDetail from './components/Portfolios/PortfolioDetail';
import CreatePortfolio from './components/Portfolios/CreatePortfolio';
import EditPortfolio from './components/Portfolios/EditPortfolio';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestore}>
        <StorageProvider sdk={storage}>
          <HashRouter>
            <div className="app-container">
              <Sidebar />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
                  <Route path="/stock/:id" element={<PrivateRoute><Stock /></PrivateRoute>} />
                  <Route path="/portfolios" element={<PrivateRoute><PortfolioOverview /></PrivateRoute>} />
                  <Route path="/portfolios/:id" element={<PrivateRoute><PortfolioDetail /></PrivateRoute>} />
                  <Route path="/create-portfolio" element={<PrivateRoute><CreatePortfolio /></PrivateRoute>} />
                  <Route path="/edit-portfolio/:id" element={<PrivateRoute><EditPortfolio /></PrivateRoute>} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                </Routes>
              </div>
            </div>
          </HashRouter>
        </StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
}

export default App;