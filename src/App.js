import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login'
import New_Dashboard from './components/New_Dashboard';
import { PermissionProvider } from './components/PermissionProvider';





function App() {
  return (
    
    <PermissionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} />
          <Route path="/dashboard/*" Component={New_Dashboard} />
        </Routes>
      </BrowserRouter>
    </PermissionProvider>
  );
}

export default App;

