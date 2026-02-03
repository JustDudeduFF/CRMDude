import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import EnquiryIcon from '../subscriberpage/drawables/enquiry.png';
import CreateLeadForm from './CreateLeadForm';
import { onValue, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { isToday, isThisWeek, isThisMonth, subDays } from 'date-fns';
import CreateEnquiry from './CreateEnquiry';
import ExpandLeads from './ExpandLeads';
import ExpandIcon from '../subscriberpage/drawables/expand-arrows.png'
import { usePermissions } from '../PermissionProvider';
import { Plus, Filter, LayoutGrid, Users, Briefcase, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LeadDash() {
  const { hasPermission } = usePermissions();
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [shoeExpand, setShowExpand] = useState(false);
  const [arrayleads, setArrayLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [filterType, setFilterType] = useState('All Time');
  const [selectedCompany, setSelectedCompany] = useState('All');

  const leadRef = ref(db, `Leadmanagment`);

  useEffect(() => {
    const fetchLeads = onValue(leadRef, (leadSnap) => {
      const leadArray = [];
      if (leadSnap.exists()) {
        leadSnap.forEach((child) => {
          const val = child.val();
          const date = new Date(val.date);
          const leadsource = val.leadsource;
          const companyName = val.companyName;
          const type = val.type;
          leadArray.push({ date, leadsource, companyName, type });
        });
        setArrayLeads(leadArray);
      }
    });
    return () => fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = arrayleads;
    const currentDate = new Date();

    switch (filterType) {
      case 'Today':
        filtered = arrayleads.filter((lead) => isToday(lead.date));
        break;
      case 'This Week':
        filtered = arrayleads.filter((lead) => isThisWeek(lead.date));
        break;
      case 'This Month':
        filtered = arrayleads.filter((lead) => isThisMonth(lead.date));
        break;
      case 'Last 7 Days':
        filtered = arrayleads.filter((lead) => lead.date >= subDays(currentDate, 7));
        break;
      default:
        filtered = arrayleads;
    }

    if (selectedCompany !== 'All') {
      filtered = filtered.filter(lead => lead.companyName === selectedCompany);
    }
    setFilteredLeads(filtered);
  }, [filterType, selectedCompany, arrayleads]);

  const lastFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (4 - i));
    return date.toISOString().split('T')[0];
  });

  const leadCountByDate = filteredLeads.reduce((acc, lead) => {
    const dateString = new Date(lead.date).toISOString().split('T')[0];
    if (lastFiveDays.includes(dateString)) {
      acc[dateString] = (acc[dateString] || 0) + 1;
    }
    return acc;
  }, {});

  const chartDataObject = lastFiveDays.reduce((acc, date) => {
    acc[date] = leadCountByDate[date] || 0;
    return acc;
  }, {});

  const leadCountBySource = filteredLeads.reduce((acc, lead) => {
    const source = lead.leadsource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const leadCountByType = filteredLeads.reduce((acc, lead) => {
    const source = lead.type;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: ['Employee', 'Sales Team', 'Customer'],
    datasets: [{
      data: [
        leadCountBySource.employee || 0,
        leadCountBySource.sales_team || 0,
        leadCountBySource.customer || 0,
      ],
      backgroundColor: ['#3b82f6', '#f43f5e', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  const chartData = {
    labels: Object.keys(chartDataObject).map(d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'New Leads',
      data: Object.values(chartDataObject),
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  const companyNames = ['All', ...new Set(arrayleads.map((lead) => lead.companyName))];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="title-block">
            <h2 className="main-title">Lead Management</h2>
            <p className="subtitle">Track and manage your business pipeline</p>
          </div>
          <div className="action-buttons">
            <button onClick={() => setShow1(true)} className="btn-secondary-custom">
              <Plus size={18} /> <span>Add Enquiry</span>
            </button>
            <button onClick={() => {
              if (hasPermission("ADD_LEAD")) { setShow(true); } else { alert("Permission Denied") }
            }} className="btn-primary-custom">
              <Plus size={18} /> <span>Create Lead</span>
            </button>
          </div>
        </header>

        {/* Filters Section */}
        <section className="filter-section card-custom">
          <div className="filter-group">
            <div className="select-wrapper">
              <Filter size={16} className="select-icon" />
              <select onChange={(e) => setFilterType(e.target.value)} className="select-custom">
                <option>All Time</option>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="select-wrapper">
              <Briefcase size={16} className="select-icon" />
              <select onChange={(e) => setSelectedCompany(e.target.value)} className="select-custom">
                {companyNames.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-convert-custom">
            Enquiry to Lead Convert
          </button>
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card card-custom">
            <div className="stat-header">
              <div className="stat-info">
                <span className="stat-label">Total Enquiries</span>
                <h3 className="stat-value text-enquiry">{leadCountByType.enquiry || 0}</h3>
              </div>
              <div className="stat-icon-bg bg-enquiry">
                <Users size={24} color="#92400e" />
              </div>
            </div>
          </div>

          <div className="stat-card card-custom">
            <div className="stat-header">
              <div className="stat-info">
                <span className="stat-label">Total Leads</span>
                <h3 className="stat-value text-lead">{leadCountByType.lead || 0}</h3>
              </div>
              <div className="stat-icon-bg bg-lead">
                <TrendingUp size={24} color="#1e40af" />
              </div>
            </div>
          </div>
          
          <div className="expand-stats-card card-custom" onClick={() => setShowExpand(true)}>
            <img src={ExpandIcon} alt="expand" />
            <span>Detailed Analysis</span>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-grid">
          <div className="card-custom chart-card">
            <div className="card-header">
              <h5 className="card-title">Leads Trend</h5>
              <p className="card-subtitle">Performance over last 5 days</p>
            </div>
            <div className="chart-wrapper">
              <Line data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
              }} />
            </div>
          </div>

          <div className="card-custom stats-detail-card">
            <div className="card-header">
              <h5 className="card-title">Generation Stats</h5>
              <p className="card-subtitle">Distribution by source</p>
            </div>
            <div className="source-list">
              <div className="source-item">
                <div className="source-dot bg-blue"></div>
                <span className="source-name">Employee</span>
                <span className="source-count">{leadCountBySource.employee || 0}</span>
              </div>
              <div className="source-item">
                <div className="source-dot bg-rose"></div>
                <span className="source-name">Sales Team</span>
                <span className="source-count">{leadCountBySource.sales_team || 0}</span>
              </div>
              <div className="source-item">
                <div className="source-dot bg-amber"></div>
                <span className="source-name">Customer</span>
                <span className="source-count">{leadCountBySource.customer || 0}</span>
              </div>
            </div>
            <div className="pie-wrapper">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      </div>

      <CreateLeadForm showModal={show} modalClose={() => setShow(false)} />
      <CreateEnquiry showModal1={show1} modalClose1={() => setShow1(false)} />
      <ExpandLeads showExpand={shoeExpand} closeExpand={() => setShowExpand(false)} />

      <style>{`
        .dashboard-wrapper {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 20px 20px 20px 20px;
        }
        .dashboard-content {
          max-width: 100%;
          margin: 0 auto;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .main-title { font-weight: 800; color: #1e293b; margin: 0; font-size: 1.75rem; }
        .subtitle { color: #64748b; margin: 5px 0 0 0; }
        
        .action-buttons { display: flex; gap: 12px; }
        .btn-primary-custom, .btn-secondary-custom {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; font-weight: 600;
          transition: all 0.2s; border: none; cursor: pointer;
        }
        .btn-primary-custom { background: #3b82f6; color: white; }
        .btn-primary-custom:hover { background: #2563eb; transform: translateY(-1px); }
        .btn-secondary-custom { background: #fff; color: #3b82f6; border: 1px solid #e2e8f0; }
        .btn-secondary-custom:hover { background: #f8fafc; }

        .card-custom {
          background: white; border-radius: 16px; 
          border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .filter-section {
          padding: 15px 20px; display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 15px;
        }
        .filter-group { display: flex; gap: 12px; flex-wrap: wrap; }
        .select-wrapper { position: relative; display: flex; align-items: center; }
        .select-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
        .select-custom {
          padding: 8px 12px 8px 35px; border-radius: 8px; border: 1px solid #e2e8f0;
          color: #475569; font-weight: 500; appearance: none; background: white;
        }
        .btn-convert-custom {
          background: #f1f5f9; color: #475569; border: none; padding: 8px 16px;
          border-radius: 8px; font-weight: 600; cursor: pointer;
        }

        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px; margin-bottom: 24px;
        }
        .stat-card { padding: 20px; position: relative; overflow: hidden; }
        .stat-header { display: flex; justify-content: space-between; align-items: center; }
        .stat-label { color: #64748b; font-size: 0.875rem; font-weight: 600; }
        .stat-value { font-size: 2rem; font-weight: 800; margin-top: 5px; }
        .text-enquiry { color: #92400e; }
        .text-lead { color: #1e40af; }
        .stat-icon-bg { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .bg-enquiry { background: #fef3c7; }
        .bg-lead { background: #dbeafe; }

        .expand-stats-card {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; padding: 20px; background: #1e293b; color: white;
          transition: 0.3s;
        }
        .expand-stats-card:hover { background: #0f172a; }
        .expand-stats-card img { width: 24px; filter: invert(1); }

        .analytics-grid {
          display: grid; grid-template-columns: 2fr 1fr; gap: 24px;
        }
        .chart-card { padding: 24px; }
        .stats-detail-card { padding: 24px; display: flex; flexDirection: column; }
        .card-header { margin-bottom: 20px; }
        .card-title { font-weight: 700; color: #1e293b; margin: 0; }
        .card-subtitle { color: #94a3b8; font-size: 0.875rem; margin: 4px 0 0 0; }
        
        .chart-wrapper { height: 300px; position: relative; }
        .pie-wrapper { height: 200px; margin-top: auto; }
        
        .source-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .source-item { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
        .source-dot { width: 8px; height: 8px; border-radius: 50%; }
        .bg-blue { background: #3b82f6; }
        .bg-rose { background: #f43f5e; }
        .bg-amber { background: #f59e0b; }
        .source-name { flex: 1; color: #475569; }
        .source-count { font-weight: 700; color: #1e293b; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .dashboard-wrapper { padding: 10px 8px 10px 8x; }
          .dashboard-header { flex-direction: column; align-items: flex-start; }
          .action-buttons { width: 100%; }
          .btn-primary-custom, .btn-secondary-custom { flex: 1; justify-content: center; font-size: 0.9rem; }
          .filter-section { flex-direction: column; align-items: stretch; }
          .filter-group { flex-direction: column; }
          .analytics-grid { grid-template-columns: 1fr; }
          .chart-wrapper { height: 250px; }
        }
      `}</style>
    </div>
  );
}