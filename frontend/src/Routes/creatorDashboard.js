import { Route, Routes } from "react-router-dom";
import Sidebar from "../Creator/components/sidebar";

import Dashboard from "../Creator/Pages/dashboard";
import Profile from "../Creator/Pages/profile";
import AddCourse from "../Creator/Pages/Courses/addCourse";
import MyCourses from "../Creator/Pages/Courses/courses";
import ViewCourse from "../Creator/Pages/Courses/viewcourse";
import EditCourse from "../Creator/Pages/Courses/editcourses";
import Tickets from "../Creator/Pages/tickets/tickets";
import ViweTicket from "../Creator/Pages/tickets/viewticket";
import AddTicket from "../Creator/Pages/tickets/addticket";
import Notification from "../Creator/Pages/notifications";
import AddLesson from "../Creator/Pages/lessons/addlessons";
import Lessons from "../Creator/Pages/lessons/lessons";

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
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/view-course/:id" element={<ViewCourse />} />
          <Route path="/edit-course/:id" element={<EditCourse />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/viewticket/:id" element={<ViweTicket />} />
          <Route path="/addticket" element={<AddTicket />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/lessons" element={<Lessons />} />
          {/* Add lesson under a specific course */}
          <Route path="/course/:courseId/add-lesson" element={<AddLesson />} />
        </Routes>
      </div>
    </div>
  );
}
