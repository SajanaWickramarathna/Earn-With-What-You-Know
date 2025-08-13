import { Route, Routes } from "react-router-dom";
import Sidebar from "../Creator/components/sidebar";

export default function CreatorDashboard() {
  return (
    <div className="bg-white w-1/6 min-h-screen">
      {/* Sidebar */}
      <div className="bg-white w-1/6 min-h-screen">
        <Sidebar />
      </div>
    </div>
  );
}
