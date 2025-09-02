import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './pages/App';
import './index.css';
import Login from './pages/Login';
import CreatePayable from './pages/CreatePayable';
import PayableDetail from './pages/PayableDetail';
import ProtectedRoute from './pages/ProtectedRoute';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>          
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="payables/new" element={<ProtectedRoute><CreatePayable /></ProtectedRoute>} />
          <Route path="payables/:id" element={<ProtectedRoute><PayableDetail /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
