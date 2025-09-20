import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, Divider, Button, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, ClearAll as ClearAllIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import Nav from "../components/navigation";
import { api } from "../api";
import { useCart } from "../context/CartContext";

export default function CourseCart() {
  const [cart, setCart] = useState(null);
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { fetchCartCount } = useCart();

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const getCourseImageSrc = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/300x200?text=No+Image";
    const baseURL = api.defaults.baseURL.replace("/api", "");
    return imgPath.startsWith("http") ? imgPath : `${baseURL}/${imgPath}`;
  };

  // Fetch user info
  useEffect(() => {
    if (!token) return;
    api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserData(res.data))
      .catch(err => {
        console.error(err);
        showSnackbar("Session expired, please login.", "error");
        localStorage.removeItem("token");
        setToken(null);
        setTimeout(() => window.location.href = "/signin", 2000);
      });
  }, [token]);

  // Fetch cart and course details
  useEffect(() => {
    if (!userData) return;

    const fetchCart = async () => {
      try {
        const res = await api.get(`/cart/getcart/${userData.user_id}`);
        const cartData = res.data;
        const coursePromises = cartData.items.map(item =>
          api.get(`/courses/${item.course_id}`).then(r => r.data).catch(() => null)
        );
        const validCourses = (await Promise.all(coursePromises)).filter(c => c !== null);

        setCart({ ...cartData, items: cartData.items.filter(i => validCourses.find(c => c.course_id === i.course_id)) });
        setCourses(validCourses);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load cart", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [userData]);

  // Update total price
  const totalPrice = cart?.items.reduce((sum, item) => {
    const course = courses.find(c => c.course_id === item.course_id);
    return sum + (course?.price || 0) * item.quantity;
  }, 0);

  // Actions
  const handleUpdateQuantity = (course_id, quantity) => {
    if (quantity < 1) return;
    api.put("/cart/updatecartitem", { user_id: userData.user_id, course_id, quantity })
      .then(res => setCart(res.data))
      .catch(() => showSnackbar("Failed to update quantity", "error"));
  };

  const handleRemove = (course_id) => {
    api.delete("/cart/removefromcart", { data: { user_id: userData.user_id, course_id } })
      .then(res => { setCart(res.data); fetchCartCount(); showSnackbar("Course removed"); })
      .catch(() => showSnackbar("Failed to remove course", "error"));
  };

  const handleClearCart = () => {
    api.delete(`/cart/clearcart/${userData.user_id}`)
      .then(() => { setCart(null); fetchCartCount(); showSnackbar("Cart cleared"); })
      .catch(() => showSnackbar("Failed to clear cart", "error"));
  };

  if (!token) return (
    <div>
      <Nav />
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
        <CheckCircleIcon sx={{ fontSize: 80, mb: 2 }} color="disabled"/>
        <Typography variant="h5" gutterBottom>Please log in to view your cart</Typography>
        <Button component={Link} to="/signin" variant="contained" color="primary">Log in</Button>
      </Box>
    </div>
  );

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress size={60}/></Box>;

  if (!cart || cart.items.length === 0) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
      <Typography variant="h5">Your cart is empty</Typography>
      <Button component={Link} to="/shop" startIcon={<ArrowBackIcon />} variant="contained" sx={{ mt: 2 }}>Back to courses</Button>
    </Box>
  );

  return (
    <div>
      <Nav />
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 1000, mx: "auto", mt: 8 }}>
          <Typography variant="h4" gutterBottom>Your Course Cart</Typography>
          <Paper sx={{ p: 3, mb: 4 }}>
            {cart.items.map(item => {
              const course = courses.find(c => c.course_id === item.course_id);
              if (!course) return null;
              return (
                <React.Fragment key={item.course_id}>
                  <Box display="flex" alignItems="center" sx={{ p: 2, "&:hover": { bgcolor: "action.hover" } }}>
                    <Box component="img" src={getCourseImageSrc(course.thumbnail_url)} alt={course.title} sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 1, mr: 3 }} />
                    <Box flexGrow={1}>
                      <Typography variant="h6">{course.title}</Typography>
                      <Typography variant="body1">LKR {course.price.toFixed(2)}</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <IconButton onClick={() => handleUpdateQuantity(item.course_id, item.quantity - 1)} disabled={item.quantity===1}><RemoveIcon /></IconButton>
                        <Typography mx={2}>{item.quantity}</Typography>
                        <IconButton onClick={() => handleUpdateQuantity(item.course_id, item.quantity + 1)}><AddIcon /></IconButton>
                      </Box>
                    </Box>
                    <IconButton color="error" onClick={() => handleRemove(item.course_id)}><DeleteIcon /></IconButton>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </React.Fragment>
              )
            })}
          </Paper>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h5">Total: LKR {totalPrice.toFixed(2)}</Typography>
            <Button variant="outlined" color="error" startIcon={<ClearAllIcon />} onClick={handleClearCart}>Clear Cart</Button>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Button component={Link} to="/checkout" variant="contained" color="primary" fullWidth>Proceed to Checkout</Button>
            <Button component={Link} to="/courses" variant="outlined" color="primary" fullWidth startIcon={<ArrowBackIcon />}>Continue Shopping</Button>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbarSeverity} onClose={handleSnackbarClose}>{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  )
}