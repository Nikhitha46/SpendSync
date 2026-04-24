import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = React.useContext(AuthContext);
    if (loading) return <div className="h-screen w-screen flex items-center justify-center text-primary">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
              <ProtectedRoute>
                  <Layout>
                      <Dashboard />
                  </Layout>
              </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
              <ProtectedRoute>
                  <Layout>
                      <Expenses />
                  </Layout>
              </ProtectedRoute>
          } />

          <Route path="/budgets" element={
              <ProtectedRoute>
                  <Layout>
                      <Budgets />
                  </Layout>
              </ProtectedRoute>
          } />

          <Route path="/analytics" element={
              <ProtectedRoute>
                  <Layout>
                      <Analytics />
                  </Layout>
              </ProtectedRoute>
          } />

          <Route path="/profile" element={
              <ProtectedRoute>
                  <Layout>
                      <Profile />
                  </Layout>
              </ProtectedRoute>
          } />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
