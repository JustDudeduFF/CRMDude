import React from "react";
import { Bar } from "react-chartjs-2"; // Import the Bar component
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpiredUsersBarChart = ({ data, type }) => {
  // Sort labels (dates) in ascending order
  const sortedLabels = Object.keys(data).sort((dateA, dateB) => new Date(dateA) - new Date(dateB));

  // Map sorted labels to their respective counts
  const sortedCounts = sortedLabels.map((label) => data[label]);

  const chartData = {
    labels: sortedLabels, // Use sorted dates as labels
    datasets: [
      {
        label: type === "expire" ? "Expired Users" : "Upcoming Renewal",
        data: sortedCounts, // Use counts corresponding to sorted labels
        backgroundColor: type === "expire" ? "rgba(255, 0, 0, 0.5)" : "rgba(60, 255, 0, 0.5)", // Use red for bars
        borderColor: type === "expire" ? "rgba(255, 0, 0, 1)" : "rgb(0, 105, 9)" ,// Border color for the bars
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: type === "expire" ? "Expired Users Count" : "Upcoming Renewal Count",
        },
        beginAtZero: true, // Start the y-axis from 0
      },
    },
  };

  return <Bar data={chartData} options={options} />; // Render the Bar chart
};

export default ExpiredUsersBarChart;
