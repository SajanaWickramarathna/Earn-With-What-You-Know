import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoute";

import Admin from "./Routes/adminDashboard";
import Creator from "./Routes/creatorDashboard";
import Lernar from "./Routes/learnerDashboard";
import CustomerSupporter from "./Routes/supportDashboard";
import Login from "./pages/signin";
import Signup from "./pages/signup";
import Logout from "./components/logout";
import VerifyEmail from "./components/verifyemail";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./components/resetPassword";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />

      <Route path="/signin" element={<Login />} />
      
      <Route path="/forgotpassword" element={<ForgotPassword />} />

      <Route path="/logout" element={<Logout />} />

      <Route path="/contactform" element={<ContactUsForm />} />

      <Route path="/verify/:token" element={<VerifyEmail />} />

      <Route path="/reset/:token" element={<ResetPassword />} />

      <Route
        path="/admin-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lernar-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["learner"]}>
            <Lernar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <Creator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["customer_supporter"]}>
            <CustomerSupporter />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
