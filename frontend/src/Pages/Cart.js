import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import Nav from "../components/navigation";
import { useCart } from "../context/CartContext";
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
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [courses, setCourses] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { fetchCartCount } = useCart();

  // Helper for correct image path
  const getCourseImageSrc = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/300x200?text=No+Image";
    if (imgPath.startsWith("http")) return imgPath;

    const baseURL = api.defaults.baseURL.replace("/api", ""); // remove `/api` if present
    if (imgPath.startsWith("/uploads")) return `${baseURL}${imgPath}`;
    if (imgPath.startsWith("uploads")) return `${baseURL}/${imgPath}`;

    return `${baseURL}/uploads/${imgPath}`;
  };

  // Show snackbar message
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch user data
  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          showSnackbar("Session expired. Please log in again.", "error");
          setTimeout(() => {
            localStorage.removeItem("token");
            setToken(null);
            window.location.href = "/logout";
          }, 2000);
        } else {
          setError("Failed to load cart");
          showSnackbar("Failed to load cart", "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  // Fetch cart and course details
  useEffect(() => {
    if (!userData) return;

    const fetchCartAndCourses = async () => {
      try {
        const response = await api.get(`/cart/getcart/${userData.user_id}`);
        const cartData = response.data;

        const coursePromises = cartData.items.map(async (item) => {
          try {
            const res = await api.get(`/courses/course/${item.course_id}`);
            return res.data;
          } catch (err) {
            console.warn(
              `Course with ID ${item.course_id} not found or deleted.`
            );
            return null;
          }
        });

        const coursesWithDetails = await Promise.all(coursePromises);
        const validCourses = coursesWithDetails.filter((p) => p !== null);
        const validCourseIds = validCourses.map((p) => p.course_id);

        // Filter out invalid items from cart
        const updatedCartItems = cartData.items.filter((item) =>
          validCourseIds.includes(item.course_id)
        );

        setCart({ ...cartData, items: updatedCartItems });
        setCourses(validCourses);
        setUserId(userData.user_id);
      } catch (err) {
        console.error("Error fetching cart or courses:", err);
        setError("Failed to load cart");
        showSnackbar("Failed to load cart", "error");
      }
    };

    fetchCartAndCourses();
  }, [userData]);

  // Recalculate total price
  useEffect(() => {
    if (!cart || !userData) return;

    const total = cart.items.reduce((acc, item) => {
      const course = courses.find((p) => p.course_id === item.course_id);
      return acc + (course?.course_price || 0) * item.quantity;
    }, 0);

    setTotalPrice(total);

    api
      .put("/cart/updatetotalprice", {
        user_id: userData.user_id,
        total_price: total,
      })
      .then((response) => setCart(response.data))
      .catch((err) => {
        console.error("Error updating total price:", err);
        showSnackbar("Error updating cart total", "error");
      });
  }, [cart, courses, userData]);

  // Cart actions
  const handleRemoveFromCart = (course_id) => {
    api
      .delete("/cart/removefromcart", {
        data: { user_id, course_id },
      })
      .then((response) => {
        setCart(response.data);
        fetchCartCount();
        showSnackbar("Item removed from cart");
      })
      .catch(() => {
        setError("Error removing from cart");
        showSnackbar("Error removing item", "error");
      });
  };

  const handleClearCart = () => {
    api
      .delete(`/cart/clearcart/${userData.user_id}`)
      .then(() => {
        setCart(null);
        fetchCartCount();
        showSnackbar("Cart cleared successfully");
        setTimeout(() => {
          window.location.href = "/shop";
        }, 1000);
      })
      .catch(() => {
        setError("Error clearing cart");
        showSnackbar("Error clearing cart", "error");
      });
  };

  const handleUpdateQuantity = (user_id, course_id, quantity) => {
    if (quantity < 1) return;
    api
      .put("/cart/updatecartitem", {
        user_id: userData.user_id,
        course_id,
        quantity,
      })
      .then((response) => {
        setCart(response.data);
        fetchCartCount();
      })
      .catch(() => {
        setError("Error updating cart item");
        showSnackbar("Error updating quantity", "error");
      });
  };

  // Render logic
  if (!token) {
    return (
      <div>
        <Nav />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
          p={4}
          bgcolor="background.default"
        >
          <ShoppingCartIcon color="disabled" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Please log in to view your cart
          </Typography>
          <Button
            component={Link}
            to="/signin"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            startIcon={<CheckCircleIcon />}
          >
            Log in
          </Button>
        </Box>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Nav />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress size={60} />
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Nav />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <Nav />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
          p={4}
          bgcolor="background.default"
        >
          <ShoppingCartIcon color="disabled" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            component={Link}
            to="/shop"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            startIcon={<ArrowBackIcon />}
          >
            Back to shop
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 8 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 4 }}
          >
            Your Shopping Cart
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            {cart.items.map((item) => {
              const course = courses.find(
                (p) => p.course_id === item.course_id
              );
              if (!course) return null;

              return (
                <React.Fragment key={item.course_id}>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      p: 2,
                      "&:hover": { bgcolor: "action.hover" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Box
                      component="img"
                      src={getCourseImageSrc(course.images?.[0])}
                      alt={course.course_name}
                      sx={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 1,
                        mr: 3,
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />

                    <Box flexGrow={1}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: "medium" }}
                      >
                        {course.course_name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        LKR {course.course_price.toFixed(2)}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                        <IconButton
                          onClick={() =>
                            handleUpdateQuantity(
                              user_id,
                              item.course_id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity === 1}
                          color="primary"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="body1" sx={{ mx: 2 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          onClick={() =>
                            handleUpdateQuantity(
                              user_id,
                              item.course_id,
                              item.quantity + 1
                            )
                          }
                          color="primary"
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => handleRemoveFromCart(item.course_id)}
                      color="error"
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </React.Fragment>
              );
            })}
          </Paper>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Total: LKR {totalPrice.toFixed(2)}
            </Typography>
            <Button
              onClick={handleClearCart}
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              size="large"
            >
              Clear Cart
            </Button>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              component={Link}
              to="/checkout"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 2 }}
            >
              Proceed to Checkout
            </Button>
            <Button
              component={Link}
              to="/shop"
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 2 }}
              startIcon={<ArrowBackIcon />}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
