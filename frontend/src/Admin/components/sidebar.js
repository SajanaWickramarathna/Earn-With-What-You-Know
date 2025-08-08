import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/adminlogo.png";
import { Logout, ExpandMore, ExpandLess } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AnalyticsIcon from "@mui/icons-material/AnalyticsOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import StoreIcon from "@mui/icons-material/StorefrontOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import NotificationIcon from "@mui/icons-material/Notifications"; // Import NotificationIcon
import { api } from "../../api"; 
import { CircularProgress } from "@mui/material";

export default function Sidebar() {
  const [openDropdowns, setOpenDropdowns] = useState({
    manage_users: false,
    inventory: false,
    analytics: false,
  });

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        setToken(null);
        navigate("/logout");
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [token, navigate]);

  const isDropdownActive = (items) => {
    return items.some((item) => location.pathname === item.to);
  };

  const navItems = [
    {
      name: "Home",
      icon: <HomeIcon />,
      to: "/",
      type: "link",
    },
    {
      name: "Dashboard",
      icon: <DashboardIcon />,
      to: "/admin-dashboard",
      type: "link",
    },
  
    {
      name: "Settings",
      icon: <SettingsIcon />,
      to: "/admin-dashboard/settings",
      type: "link",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen w-64 bg-white flex items-center justify-center">
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-64 bg-gradient-to-b from-blue-50 to-white text-blue-900 flex flex-col border-r border-blue-100 shadow-sm">
      {/* Profile Section */}
      <div className="w-full p-6 flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={
              userData?.profilePic
                ? `${api.defaults.baseURL.replace('/api', '')}${userData.profilePic}`
                : "https://via.placeholder.com/96"
            }
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="text-xl font-semibold text-center">
          {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : "Admin User"}
        </div>
        <div className="text-sm text-blue-500">Administrator</div>
      </div>

      <hr className="border-t border-blue-100 mx-4" />

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            if (item.type === "divider") {
              return <hr key={index} className="border-t border-blue-100 my-4 mx-2" />;
            }

            if (item.type === "link") {
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.to}
                    state={{ data: userData }}
                    end
                    className={({ isActive }) =>
                      `w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "hover:bg-blue-50 text-blue-800"
                      }`
                    }
                  >
                    <span className="mr-3 text-blue-600">{item.icon}</span>
                    {item.name}
                    {/* Badge for Notifications */}
                    {item.name === "Notifications" && notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            }

            if (item.type === "dropdown") {
              const isOpen = openDropdowns[item.dropdownKey] || isDropdownActive(item.items);

              return (
                <li key={item.name}>
                  <button
                    onClick={() => toggleDropdown(item.dropdownKey)}
                    className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                      isOpen || isDropdownActive(item.items)
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-blue-50 text-blue-800"
                    }`}
                  >
                    <span className="mr-3 text-blue-600">{item.icon}</span>
                    {item.name}
                    {isOpen ? (
                      <ExpandLess className="ml-auto text-blue-600" />
                    ) : (
                      <ExpandMore className="ml-auto text-blue-600" />
                    )}
                  </button>

                  <ul
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 mt-1" : "max-h-0"
                    }`}
                  >
                    {item.items.map((subItem) => (
                      <li key={subItem.name} className="ml-6 my-1">
                        <NavLink
                          to={subItem.to}
                          state={{ data: userData }}
                          className={({ isActive }) =>
                            `block py-2 px-4 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "hover:bg-blue-50 text-blue-800"
                            }`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return null;
          })}
        </ul>
      </nav>

      {/* Footer & Logout */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
            navigate("/logout");
          }}
        >
          <Logout className="mr-2" />
          Logout
        </button>

        <footer className="mt-6 text-xs text-blue-400 text-center">
          <p className="mb-1">&copy; {new Date().getFullYear()} DROPship</p>
          <p>All rights reserved</p>
          <p className="mt-2 text-blue-300">Developed by Sajana Wickramarathna</p>
        </footer>
      </div>
    </div>
  );
}