import React from 'react';
import { BrowserRouter as Router, Routes,Route  } from 'react-router-dom';
import Login from './components/Login'
import New_Dashboard from './components/New_Dashboard';
import { SpeedInsights } from '@vercel/speed-insights/next';




function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" Component={Login}/>
        <Route path='/dashboard/*' Component={New_Dashboard}/>
        <SpeedInsights />
      </Routes> 
    </Router>
  );
}

export default App;

