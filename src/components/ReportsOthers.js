import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileBarChart,
  Server,
  Contact2,
  Package,
  UserPlus,
  ShieldCheck,
  MessageSquare,
  Settings,
} from "lucide-react";
import "./Reports_Others.css";
import DevelopmentModal from "./DevelopmentModal";

export default function Reports_Others({ onCloseSidebar }) {
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState("");

  const navigate = useNavigate();

  const handleNavigation = (item) => {
    // List of paths that are currently under development
    const lockedPaths = ["/dashboard/networkrack", "/dashboard/leadmanagment", "/dashboard/setting"];

    if (lockedPaths.includes(item.path)) {
      setPendingFeature(item.label);
      setIsDevModalOpen(true);
    } else {
      navigate(item.path);
      if (onCloseSidebar) onCloseSidebar();
    }
  };

  const menuItems = [
    {
      label: "Manage Employees",
      path: "/dashboard/employees",
      icon: <Users size={28} />,
    },
    {
      label: "All Reports",
      path: "/dashboard/reports",
      icon: <FileBarChart size={28} />,
    },
    {
      label: "Network Rack Info",
      path: "/dashboard/networkrack",
      icon: <Server size={28} />,
    },
    {
      label: "Lead Management",
      path: "/dashboard/leadmanagment",
      icon: <Contact2 size={28} />,
    },
    {
      label: "Inventory",
      path: "/dashboard/inventry",
      icon: <Package size={28} />,
    },
    {
      label: "Add Customer",
      path: "/dashboard/adduser",
      icon: <UserPlus size={28} />,
    },
    {
      label: "Master",
      path: "/dashboard/master",
      icon: <ShieldCheck size={28} />,
    },
    {
      label: "Message & Communication",
      path: "/dashboard/templates",
      icon: <MessageSquare size={28} />,
    },
    {
      label: "Setting",
      path: "/dashboard/setting",
      icon: <Settings size={28} />,
    },
  ];

  return (
    <div className="reports-others-container">
      <div className="reports-others-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => handleNavigation(item)}
            className="reports-others-card"
          >
            <div className="reports-others-icon">{item.icon}</div>
            <label className="reports-others-label">{item.label}</label>
          </div>
        ))}
      </div>

      <DevelopmentModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        featureName={pendingFeature}
      />
    </div>
  );
}
