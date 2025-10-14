// client/src/App.js - ENHANCED VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DarkModeProvider } from './contexts/DarkModeContext';

import Login from './pages/Login';
import MethodChoice from './pages/MethodChoice';
import SmartBuilder from './pages/SmartBuilder';
import ManualEntry from './pages/ManualEntry';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/method-choice" element={<MethodChoice />} />
            <Route path="/smart-builder" element={<SmartBuilder />} />
            <Route path="/manual-entry" element={<ManualEntry />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;