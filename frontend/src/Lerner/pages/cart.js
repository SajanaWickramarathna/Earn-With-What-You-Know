import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { Link } from "react-router-dom";
import Nav from "../../components/navigation";
import { useCart } from "../../context/CartContext";
import {
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ClearAll as ClearAllIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [courses, setCourses] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { setCartCount } = useCart();
  const [cartLoading, setCartLoading] = useState(true);


  const token = localStorage.getItem("token");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const getCourseImageSrc = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/300x200?text=No+Image";
    if (imgPath.startsWith("http")) return imgPath;
    const baseURL = api.defaults.baseURL.replace("/api", "");
    return imgPath.startsWith("/")
      ? `${baseURL}${imgPath}`
      : `${baseURL}/${imgPath}`;
  };

  // Fetch user data
  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to fetch user data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [token]);

  // Fetch cart and courses
  useEffect(() => {
  if (!userData) return;

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      // 1️⃣ Fetch cart
      const res = await api.get("/cart/getcart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = res.data;

      if (cartData.items.length === 0) {
        setCart(cartData);
        setCourses([]);
        setCartLoading(false);
        return;
      }

      // 2️⃣ Fetch all course details in one request
      const ids = cartData.items.map(item => item.course_id).join(',');
      const coursesRes = await api.get(`/courses?ids=${ids}`);
      const validCourses = coursesRes.data;

      // 3️⃣ Filter cart items that exist
      const validCourseIds = validCourses.map(c => c.course_id);
      cartData.items = cartData.items.filter(item =>
        validCourseIds.includes(item.course_id)
      );

      setCart(cartData);
      setCourses(validCourses);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch cart", "error");
    } finally {
      setCartLoading(false);
    }
  };

  fetchCart();
}, [userData]);


  // Recalculate total price
  useEffect(() => {
    if (!cart || !courses) return;

    const total = cart.items.reduce((acc, item) => {
      const course = courses.find(
        (c) => c.course_id === Number(item.course_id)
      );
      return acc + (course?.price || 0) * item.quantity;
    }, 0);

    setTotalPrice(total);

    // Update total price in backend
    if (userData) {
      api
        .put("/cart/updatetotalprice", {
          user_id: userData.user_id,
          total_price: total,
        })
        .catch((err) => console.error("Failed to update total:", err));
    }
  }, [cart, courses, userData]);

  // Cart actions
  // Remove from cart
  const handleRemoveFromCart = (course_id) => {
    api
      .delete("/cart/removefromcart", {
        data: { user_id: userData.user_id, course_id },
      })
      .then((res) => {
        setCart(res.data);
        const newCount = res.data.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(newCount); // instant update
      })
      .catch(() => toast.error("Failed to remove course"));
  };

  // Clear cart
  const handleClearCart = () => {
    api
      .delete(`/cart/clearcart/${userData.user_id}`)
      .then(() => {
        setCart(null);
        setCartCount(0); // instant update
      })
      .catch(() => toast.error("Failed to clear cart"));
  };

  // No longer needed, block quantity updates
  const handleUpdateQuantity = () => {
    toast.info("Each course can only be added once.");
  };

  if (!token)
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5">Please log in to view your cart</Typography>
        <Button
          component={Link}
          to="/signin"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
      </Box>
    );

  if (isLoading || cartLoading)
  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  );

if (!cart || cart.items.length === 0)
  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h5">Your cart is empty</Typography>
      <Button component={Link} to="/shop" variant="contained" sx={{ mt: 2 }}>
        Back to shop
      </Button>
    </Box>
  );


  return (
    <div>
      
      <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>

        <Paper sx={{ p: 2, mb: 4 }}>
          {cart.items.map((item) => {
            const course = courses.find((c) => c.course_id === item.course_id);
            if (!course) return null;

            return (
              <React.Fragment key={item.course_id}>
                <Box display="flex" alignItems="center" sx={{ p: 1 }}>
                  <Box
                    component="img"
                    src={getCourseImageSrc(course.thumbnail_url)}
                    alt={course.title}
                    sx={{ width: 120, height: 80, objectFit: "cover", mr: 2 }}
                  />
                  <Box flexGrow={1}>
                    <Typography variant="h6">{course.title}</Typography>
                    <Typography>LKR {course.price.toFixed(2)}</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Typography mx={1}>Quantity: 1</Typography>
                    </Box>
                  </Box>

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveFromCart(item.course_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Divider />
              </React.Fragment>
            );
          })}
        </Paper>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">
            Total: LKR {totalPrice.toFixed(2)}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearAllIcon />}
            onClick={handleClearCart}
          >
            Clear Cart
          </Button>
        </Box>

        <Box display="flex" gap={2}>
          <Button component={Link} to="/checkout" variant="contained" fullWidth>
            Proceed to Checkout
          </Button>
          <Button
            component={Link}
            to="/shop"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
