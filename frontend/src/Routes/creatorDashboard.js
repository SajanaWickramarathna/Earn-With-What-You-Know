import { Route, Routes } from "react-router-dom";
import Sidebar from "../Creator/components/sidebar";

import Dashboard from "../Creator/Pages/dashboard";
import Profile from "../Creator/Pages/profile";
import AddCourse from "../Creator/Pages/addCourse";

export default function CreatorDashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-white w-1/6 min-h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-course" element={<AddCourse />} />
        </Routes>
      </div>
    </div>
  );
}
