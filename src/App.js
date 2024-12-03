import React from 'react';
import { BrowserRouter as Router, Routes,Route  } from 'react-router-dom';
import Login from './components/Login'
import New_Dashboard from './components/New_Dashboard';





function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" Component={Login}/>
        <Route path='/dashboard/*' Component={New_Dashboard}/>
      </Routes> 
    </Router>
  );
}

export default App;

