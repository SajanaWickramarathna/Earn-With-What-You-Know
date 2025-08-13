import { Route, Routes } from "react-router-dom";
import Sidebar from "../Creator/components/sidebar";

import Dashboard from "../Creator/Pages/dashboard";

export default function CreatorDashboard() {
  return (
    <div className="bg-white w-1/6 min-h-screen">
      {/* Sidebar */}
      <div className="bg-white w-1/6 min-h-screen">
        <Sidebar />
      </div>

      
        {/* Page Content */}
        <div className="flex-1 bg-gray-100 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
           </Routes> 
        </div>
    </div>
  );
}
