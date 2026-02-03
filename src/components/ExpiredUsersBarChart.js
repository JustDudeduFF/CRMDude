import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from "chart.js";

// Register Pie chart component (ArcElement) along with others
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ExpiredUsersBarChart = ({ data, type, onBarClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive resize for chart switching
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sort labels (dates) in ascending order
  const sortedLabels = Object.keys(data).sort((dateA, dateB) => new Date(dateA) - new Date(dateB));
  const sortedCounts = sortedLabels.map((label) => data[label]);

  // Color logic
  const primaryColor = type === "expire" ? "#ef4444" : "#3b82f6";
  const borderColor = type === "expire" ? "#b91c1c" : "#2563eb";
  
  // Generates different shades for Pie Chart slices
  const generateColors = (count) => {
    return sortedLabels.map((_, i) => `hsla(${type === "expire" ? 0 : 210}, 70%, ${50 + (i * 5)}%, 0.8)`);
  };

  const chartData = {
    labels: sortedLabels,
    datasets: [
      {
        label: type === "expire" ? "Expired Users" : "Upcoming Renewal",
        data: sortedCounts,
        backgroundColor: isMobile ? generateColors(sortedCounts.length) : primaryColor,
        borderColor: isMobile ? "#fff" : borderColor,
        borderWidth: 1,
        borderRadius: isMobile ? 0 : 6, // Rounded bars for desktop
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: isMobile ? "bottom" : "top",
        labels: {
          usePointStyle: true,
          font: { size: 12, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick) {
        const index = elements[0].index;
        const label = sortedLabels[index];
        onBarClick(label, index);
      }
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: "Date", font: { weight: 'bold' } },
      },
      y: {
        beginAtZero: true,
        title: { 
          display: true, 
          text: type === "expire" ? "Expired Count" : "Renewal Count",
          font: { weight: 'bold' } 
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h4 className="chart-title">
          {type === "expire" ? "Expiry Analytics" : "Renewal Forecast"}
        </h4>
        <span className="chart-subtitle">Based on daily volume</span>
      </div>
      
      <div className="chart-body" style={{ height: isMobile ? "350px" : "400px" }}>
        {isMobile ? (
          <Pie data={chartData} options={commonOptions} />
        ) : (
          <Bar data={chartData} options={barOptions} />
        )}
      </div>

      <style>{`
        .chart-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #f1f5f9;
          margin: 10px 0;
        }
        .chart-header {
          margin-bottom: 1.5rem;
        }
        .chart-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e293b;
        }
        .chart-subtitle {
          font-size: 0.8rem;
          color: #64748b;
        }
        .chart-body {
          position: relative;
          width: 100%;
        }
        @media (max-width: 768px) {
          .chart-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ExpiredUsersBarChart;