import { Route, Routes } from "react-router-dom";
import Sidebar from "../Lerner/components/sidebar";
import Header from "../Lerner/components/header";

export default function LearnerDashboard() {
    return (
        <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="bg-white w-1/6 min-h-screen">
            <Sidebar />
        </div>
    
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-100 p-4">
            {/* Navigation Bar */}
        <div className="h-14 m-4 shadow-lg">
         <Header/>
        </div>
            <Routes>
            {/* Define learner-specific routes here */}
            </Routes>
        </div>
        </div>
    );
}