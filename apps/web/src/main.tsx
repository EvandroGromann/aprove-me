import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './pages/App';
import './index.css';
import Login from './pages/Login';
import CreatePayable from './pages/CreatePayable';
import PayableDetail from './pages/PayableDetail';
import ProtectedRoute from './pages/ProtectedRoute';
import { CreateAssignor } from './pages/CreateAssignor';
import PayableList from './pages/PayableList';
import AssignorList from './pages/AssignorList';
import { EditAssignor } from './pages/EditAssignor';
import EditPayable from './pages/EditPayable';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>          
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="payables" element={<ProtectedRoute><PayableList /></ProtectedRoute>} />
          <Route path="payables/new" element={<ProtectedRoute><CreatePayable /></ProtectedRoute>} />
          <Route path="payables/edit/:id" element={<ProtectedRoute><EditPayable /></ProtectedRoute>} />
          <Route path="payables/:id" element={<ProtectedRoute><PayableDetail /></ProtectedRoute>} />
          <Route path="assignors" element={<ProtectedRoute><AssignorList /></ProtectedRoute>} />
          <Route path="create-assignor" element={<ProtectedRoute><CreateAssignor /></ProtectedRoute>} />
          <Route path="edit-assignor/:id" element={<ProtectedRoute><EditAssignor /></ProtectedRoute>} />
          <Route path="create-payable" element={<ProtectedRoute><CreatePayable /></ProtectedRoute>} />
          {/* Redirect legacy routes to new routes */}
          <Route path="payables/new" element={<Navigate to="/create-payable" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
