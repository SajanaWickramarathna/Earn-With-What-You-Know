import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoute";

import Admin from "./Routes/adminDashboard";
import Creator from "./Routes/creatorDashboard";
import Lernar from "./Routes/learnerDashboard";
import CustomerSupporter from "./Routes/supportDashboard";
import Login from "./Pages/signin";
import Signup from "./Pages/signup";
import Logout from "./components/logout";
import VerifyEmail from "./components/verifyemail";
import ForgotPassword from "./Pages/forgotPassword";
import ResetPassword from "./components/resetPassword";
import Home from "./Pages/home";
import ContactUsForm from "./Pages/ContactUsForm";
import Shop from "./Pages/shop";
import CartPage from "./Pages/Cart";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/signup" element={<Signup />} />

      <Route path="/signin" element={<Login />} />

      <Route path="/forgotpassword" element={<ForgotPassword />} />

      <Route path="/logout" element={<Logout />} />

      <Route path="/verify/:token" element={<VerifyEmail />} />

      <Route path="/reset/:token" element={<ResetPassword />} />

      <Route path="/contactform" element={<ContactUsForm />} />

      <Route path="/shop" element={<Shop />} />

      <Route path="/cart" element={<CartPage />} />

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
export default App;
