import Lottie from 'lottie-react';
import React from 'react';
import EmpDashAnimation from './EMPdraw/EmpDashAnimation.json';
import { Users, UserRound, ShieldCheck, Landmark } from 'lucide-react';

export default function EmpDash() {
  return <section className="employee-welcome card border-0 shadow-sm rounded-4 bg-white">
    <div className="employee-welcome-heading"><span className="bg-primary bg-opacity-10 text-primary rounded-3 p-3"><Users size={24}/></span><div><p className="text-primary small fw-semibold mb-1">YOUR TEAM, IN ONE PLACE</p><h4 className="fw-bold mb-0">Employee Overview</h4></div></div>
    <div className="employee-welcome-body">
      <div className="employee-animation-container"><Lottie animationData={EmpDashAnimation} loop /></div>
      <div><h3 className="fw-bold text-dark">People behind your business</h3><p className="text-muted">Select an employee from the team directory to view their profile and manage their details.</p>
        <div className="employee-welcome-features">
          {[{icon:UserRound,title:'Employee profiles',description:'Contact details, roles and work schedules.'},{icon:Landmark,title:'Payout details',description:'Bank information and identity records.'},{icon:ShieldCheck,title:'Access rights',description:'Permissions for each part of your business.'}].map(({icon:Icon,title,description})=><div key={title}><span className="text-primary bg-primary bg-opacity-10 rounded-3 p-2"><Icon size={19}/></span><div><strong>{title}</strong><p>{description}</p></div></div>)}
        </div>
      </div>
    </div>
  </section>;
}
