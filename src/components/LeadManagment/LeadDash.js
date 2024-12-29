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
  const {hasPermission} = usePermissions();
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [shoeExpand, setShowExpand] = useState(false);
  const [arrayleads, setArrayLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [filterType, setFilterType] = useState('All Time');
  const [selectedCompany, setSelectedCompany] = useState('All'); // State for selected company

  const leadRef = ref(db, `Leadmanagment`);

  useEffect(() => {
    const fetchLeads = onValue(leadRef, (leadSnap) => {
      const leadArray = [];
      if (leadSnap.exists()) {
        leadSnap.forEach((child) => {
          const date = new Date(child.val().date); // Parse date as Date object
          const leadsource = child.val().leadsource;
          const companyName = child.val().companyName;
          const type = child.val().type;
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

    // Filter leads based on selected filter type (date range)
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
        filtered = arrayleads; // No filter for 'All Time'
    }

    // Filter by selected company name if applicable
    if (selectedCompany !== 'All') {
      filtered = filtered.filter(lead => lead.companyName === selectedCompany);
    }

    setFilteredLeads(filtered);
  }, [filterType, selectedCompany, arrayleads]);

  // Generate last five days in chronological order (left to right)
const lastFiveDays = Array.from({ length: 5 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (4 - i)); // Start with 5 days ago
  return date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
});

// Filter and count leads for the last five days
const leadCountByDate = filteredLeads.reduce((acc, lead) => {
  const dateString = lead.date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
  if (lastFiveDays.includes(dateString)) {
    acc[dateString] = (acc[dateString] || 0) + 1;
  }
  return acc;
}, {});

// Ensure all dates in the last five days are present and in chronological order
const chartDataObject = lastFiveDays.reduce((acc, date) => {
  acc[date] = leadCountByDate[date] || 0;
  return acc;
}, {});

  // Group leads by leadsource
  const leadCountBySource = filteredLeads.reduce((acc, lead) => {
    const source = lead.leadsource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

    // Group leads by Type
    const leadCountByType = filteredLeads.reduce((acc, lead) => {
        const source = lead.type;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

  // Pie chart data for lead sources
  const pieData = {
    labels: ['Employee', 'Sales Team', 'Customer'], // The labels for the pie chart
    datasets: [
      {
        label: 'Leads Source',
        data: [
          leadCountBySource.employee || 0,
          leadCountBySource.sales_team || 0,
          leadCountBySource.customer || 0,
        ], // Data corresponding to the sources
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'], // Colors for each source
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Leads Source',
      },
    },
  };

  const chartData = {
    labels: Object.keys(chartDataObject), // x-axis labels (dates)
    datasets: [
      {
        label: 'Leads OverView',
        data: Object.values(chartDataObject), // y-axis data (lead counts)
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Last Five Days',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Get unique company names from leads
  const companyNames = ['All', ...new Set(arrayleads.map((lead) => lead.companyName))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4.5%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', margin: '10px' }}>
        <h4 style={{ flex: '1' }}>Lead Management</h4>
        <img alt='enquiries' src={EnquiryIcon} className='img_download_icon me-3'></img>
        <button onClick={() => setShow1(true)} className='btn btn-outline-info me-4'>
          Add Enquiry
        </button>
        <button onClick={() => 
          {
            if(hasPermission("ADD_LEAD")){
              setShow(true);
            }else{
              alert("Permission Denied")
            }
          }
        } className='btn btn-outline-primary'>
          Create New Lead
        </button>
      </div>
      <CreateLeadForm showModal={show} modalClose={() => setShow(false)} />
      <CreateEnquiry showModal1={show1} modalClose1={() => setShow1(false)} />
        <ExpandLeads showExpand={shoeExpand} closeExpand={() => setShowExpand(false)}/>
      <div className='container mt-3'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <div className='d-flex flex-row'>
            <select onChange={(e) => setFilterType(e.target.value)} className='form-select'>
              <option>All Time</option>
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>

          </div>
          <div className='btn-group d-flex flex-column'>
            <button type='button' className='btn btn-primary'>
              Show Enquiry To Lead Convert
            </button>
            <select
              className='form-select mt-3'
              onChange={(e) => setSelectedCompany(e.target.value)} // Handle company selection
            >
              {companyNames.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6 mb-4'>
            <div className='card'>
              <div className='card-body'>
                <div className='d-flex flex-row'>
                <h6 style={{flex:'1'}}>Your lead stats are showing below</h6>
                <img onClick={() => setShowExpand(true)} style={{width:'25px', height:'25px', float:'right', cursor:'pointer'}} src={ExpandIcon}></img>
                </div>
                <div className='row'>
                  <div className='col-6'>
                    <p>Enquiries</p>
                    <h5 style={{color:'brown'}}>{leadCountByType.enquiry || 0}</h5>
                  </div>
                  <div className='col-6'>
                    <p>Leads</p>
                    <h5 style={{color:'blue'}}>{leadCountByType.lead || 0}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card mb-4'>
          <div className='card-body'>
            <h5>Get to know your business leads</h5>
            <div className='row'>
              <div className='col-md-4'>
                <h6>Leads Trend</h6>
                <div className='chart-container' style={{ height: '250px', width: '100%' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
              <div className='col-md-4'>
                <h6>Leads Generation stats</h6>
                <p>{`Employee: ${leadCountBySource.employee || 0}`}</p>
                <p>{`Sales Team: ${leadCountBySource.sales_team || 0}`}</p>
                <p>{`Customer: ${leadCountBySource.customer || 0}`}</p>
              </div>
              <div className='col-md-4'>
                <h6>Leads Source</h6>
                <div className='chart-container' style={{ height: '250px', width: '100%' }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
