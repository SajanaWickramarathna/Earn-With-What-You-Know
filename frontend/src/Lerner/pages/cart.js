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
  ShoppingCart as ShoppingCartIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const { fetchCartCount, setCartCount } = useCart();

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

  // Fetch cart and courses
  useEffect(() => {
    if (!userData) return;

    const fetchCart = async () => {
      try {
        const response = await api.get(`/cart/getcart/${userData.user_id}`);
        const cartData = response.data;

        const coursePromises = cartData.items.map(async (item) => {
          try {
            const res = await api.get(`/courses/${item.course_id}`);
            return res.data;
          } catch (err) {
            console.warn(
              `Course ${item.course_id} not found, removing from cart`
            );
            return null;
          }
        });

        const courseswithDetails = await Promise.all(coursePromises);
        const validCourses = courseswithDetails.filter((c) => c !== null);
        const validCourseIds = validCourses.map((c) => c.course_id);

        // Filter out invalid cart items
        const updatedCartItems = cartData.items.filter((item) =>
          validCourseIds.includes(item.course_id)
        );

        setCart({ ...cartData, items: updatedCartItems });
        setCourses(validCourses);
        setUserId(userData.user_id);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to fetch cart");
        showSnackbar("Failed to fetch cart", "error");
      }
    };

    fetchCart();
  }, [userData]);

  {
    /*const res = await api.get("/cart/getcart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartData = res.data;

        const coursePromises = cartData.items.map(async (item) => {
          try {
            const courseRes = await api.get(`/courses/${item.course_id}`);
            return courseRes.data;
          } catch {
            return null;
          }
        });

        const validCourses = (await Promise.all(coursePromises)).filter(
          (c) => c !== null
        );
        const validCourseIds = validCourses.map((c) => c.course_id);

        // Filter cart items that still exist
        cartData.items = cartData.items.filter((item) =>
          validCourseIds.includes(item.course_id)
        );

        setCart(cartData);
        setCourses(validCourses);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to fetch cart", "error");
      }
    };

    fetchCart();
  }, [userData]);*/
  }

  // Recalculate total price
  useEffect(() => {
    if (!cart || !userData) return;

    const total = cart.items.reduce((acc, item) => {
      const course = courses.find((c) => c.course_id === item.course_id);
      return acc + (course?.price || 0) * item.quantity;
    }, 0);
    setTotalPrice(total);

    api
      .put("/cart/updatetotalprice", {
        user_id: userData.user_id,
        total_price: total,
      })
      .then((response) => setCart(response.data))
      .catch((err) => {
        console.error("Failed to update total price:", err);
        showSnackbar("Failed to update total price", "error");
      });
  }, [cart, courses, userData]);

  {
    /*if (!cart || !courses) return;

    const total = cart.items.reduce((acc, item) => {
      const course = courses.find(c => c.course_id === Number(item.course_id));
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
*/
  }
  // Cart actions
  // Remove from cart
  const handleRemoveFromCart = (course_id) => {
    api
      .delete("/cart/removefromcart", {
        data: { user_id, course_id },
      })
      .then((response) => {
        setCart(response.data);
        fetchCartCount(); // refresh cart count
        showSnackbar("Course removed from cart");
      })
      .catch(() => {
        setError("Failed to remove course from cart");
        showSnackbar("Failed to remove course", "error");
      });
  };

  // Clear cart
  const handleClearCart = () => {
    api
      .delete(`/cart/clearcart/${userData.user_id}`)
      .then(() => {
        setCart(null);
        fetchCartCount();
        showSnackbar("Cart cleared");
        setTimeout(() => {
          window.location.href = "/shop";
        }, 1000);
      })
      .catch(() => {
        setError("Failed to clear cart");
        showSnackbar("Failed to clear cart", "error");
      });
  };

  // Update quantity
  const handleUpdateQuantity = (user_id, course_id, quantity) => {
    if (quantity < 1) return;
    api
      .put("/cart/updatecartitem", {
        user_id,
        course_id,
        quantity,
      })
      .then((response) => {
        setCart(response.data);
        fetchCartCount();
      })
      .catch(() => {
        setError("Failed to update quantity");
        showSnackbar("Failed to update quantity", "error");
      });
  };

  {
    /*const handleRemoveFromCart = (course_id) => {
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

  // Update quantity
  const handleUpdateQuantity = (course_id, quantity) => {
    if (quantity < 1) return;
    api
      .put("/cart/updatecartitem", {
        user_id: userData.user_id,
        course_id,
        quantity,
      })
      .then((res) => {
        setCart(res.data);
        const newCount = res.data.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(newCount); // instant update
      })
      .catch(() => toast.error("Failed to update quantity"));
  };*/
  }

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
                (c) => c.course_id === item.course_id
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
                      src={getCourseImageSrc(course.thumbnail_url)}
                      alt={course.title}
                      sx={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 1,
                        mr: 3,
                      }}
                    />
                    <Box flexGrow={1}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: "medium" }}
                      >
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        LKR {course.price.toFixed(2)}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={2}>
                        <IconButton
                          onClick={() =>
                            handleUpdateQuantity(
                              item.course_id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity === 1}
                          color="primary"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography mx={1}>{item.quantity}</Typography>
                        <IconButton
                          onClick={() =>
                            handleUpdateQuantity(
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
                      color="error"
                      onClick={() => handleRemoveFromCart(item.course_id)}
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
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={handleClearCart}
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
              fullWidth
              color="primary"
              size="large"
              sx={{ py: 2 }}
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  );
}
