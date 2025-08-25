import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../api";
import { CircularProgress } from "@mui/material";
import { Logout } from "@mui/icons-material";

// Icons
import DashboardIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooksOutlined";
import AddBoxIcon from "@mui/icons-material/AddBoxOutlined";
import VideoLibraryIcon from "@mui/icons-material/VideoLibraryOutlined";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOnOutlined";
import NotificationIcon from "@mui/icons-material/Notifications";
import TicketIcon from "@mui/icons-material/ListAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingIcon from "@mui/icons-material/SettingsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function CreatorSidebar() {
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showAddLessonDropdown, setShowAddLessonDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
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

    if (token) fetchUser();
    else setIsLoading(false);
  }, [token, navigate]);

  // Fetch user courses for Add Lesson menu
  useEffect(() => {
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [token]);

  // Fetch notifications
  useEffect(() => {
    if (!userData) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/user/${userData.user_id}`);
        const unread = res.data.filter((n) => !n.read).length;
        setNotificationCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userData]);

  const handleNavigation = (path) => {
    navigate(path, { state: { data: userData } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-64 bg-white flex items-center justify-center">
        <CircularProgress color="primary" />
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", path: "/creator-dashboard", icon: <DashboardIcon /> },
    { name: "Profile", path: "/creator-dashboard/profile", icon: <AccountCircleIcon /> },
    { name: "My Courses", path: "/creator-dashboard/my-courses", icon: <LibraryBooksIcon /> },
    { name: "Add Course", path: "/creator-dashboard/add-course", icon: <AddBoxIcon /> },
    { name: "Lessons", path: "/creator-dashboard/lessons", icon: <VideoLibraryIcon /> },
    { name: "Earnings", path: "/creator-dashboard/earnings", icon: <MonetizationOnIcon /> },
    { name: "Notifications", path: "/creator-dashboard/notifications", icon: <NotificationIcon /> },
    { name: "Tickets", path: "/creator-dashboard/tickets", icon: <TicketIcon /> },
    { name: "Add Ticket", path: "/creator-dashboard/addticket", icon: <AddCircleOutlineIcon /> },
  ];

  return (
    <div className="min-h-screen w-64 bg-gradient-to-b from-blue-50 to-white text-blue-900 flex flex-col border-r border-blue-100 shadow-sm">
      {/* Profile */}
      <div className="w-full p-6 flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={`${api.defaults.baseURL.replace("/api", "")}${userData?.profilePic}`}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="text-xl font-semibold text-center">
          {userData?.firstName} {userData?.lastName}
        </div>
        <div className="text-sm text-blue-500">Creator</div>
      </div>

      <hr className="border-t border-blue-100 mx-4" />

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-blue-50 text-blue-800"
                }`}
              >
                <span className="mr-3 text-blue-600">{item.icon}</span>
                {item.name}
                {item.name === "Notifications" && notificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
            </li>
          ))}

          {/* Add Lesson Dropdown */}
          <li>
            <button
              onClick={() => setShowAddLessonDropdown(!showAddLessonDropdown)}
              className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-blue-50 text-blue-800 transition-all duration-200"
            >
              <div className="flex items-center">
                <AddBoxIcon className="mr-3 text-blue-600" />
                Add Lesson
              </div>
              <ExpandMoreIcon
                className={`transition-transform ${showAddLessonDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showAddLessonDropdown && (
              <ul className="ml-8 mt-1 space-y-1">
                {courses.map((course) => (
                  <li key={course.course_id}>
                    <button
                      onClick={() =>
                        navigate(`/creator-dashboard/course/${course.course_id}/add-lesson`)
                      }
                      className="w-full py-2 px-4 rounded hover:bg-blue-50 text-blue-700 text-sm"
                    >
                      {course.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
            navigate("/logout");
          }}
        >
          <Logout className="mr-2" /> Logout
        </button>

        <footer className="mt-6 text-xs text-blue-400 text-center">
          <p className="mb-1">&copy; {new Date().getFullYear()} Earn With What You Know</p>
          <p>All rights reserved</p>
          <p className="mt-2 text-blue-300">Developed by Sajana Wickramarathna</p>
        </footer>
      </div>
    </div>
  );
}
