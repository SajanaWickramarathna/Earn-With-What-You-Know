// pages/Checkout.js
import React, { useEffect, useState } from "react";
import { api } from "../api";
import Nav from "../components/navigation";
import { useCart } from "../context/CartContext";
import { Box, Typography, TextField, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { setCartCount } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState(null);
  const [shipping, setShipping] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (msg, severity = "success") => setSnackbar({ open: true, message: msg, severity });
  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  // Fetch cart
  useEffect(() => {
    if (!token) return;
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart/getcart", { headers: { Authorization: `Bearer ${token}` } });
        setCart(res.data);
        const total = res.data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(total);
      } catch {
        showSnackbar("Failed to fetch cart", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token]);

  const handlePlaceOrder = async () => {
    if (!shipping) {
      showSnackbar("Please enter shipping address", "error");
      return;
    }

    try {
      const res = await api.post("/orders/create", { shipping_address: shipping, payment_method: paymentMethod }, { headers: { Authorization: `Bearer ${token}` } });
      showSnackbar("Order placed successfully");
      setCartCount(0);
      navigate("/my-orders");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Order failed", "error");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!cart || cart.items.length === 0) return <Typography mt={10} textAlign="center">Your cart is empty</Typography>;

  return (
    <div>
      <Nav />
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" mb={2}>Checkout</Typography>

        <Box mb={2}>
          <Typography variant="h6">Shipping Address</Typography>
          <TextField fullWidth multiline rows={3} value={shipping} onChange={(e) => setShipping(e.target.value)} />
        </Box>

        <Box mb={2}>
          <Typography variant="h6">Payment Method</Typography>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="COD">Cash on Delivery</option>
            <option value="Payment Slip">Payment Slip</option>
          </select>
        </Box>

        <Box mb={2}>
          <Typography variant="h6">Total: LKR {totalPrice.toFixed(2)}</Typography>
        </Box>

        <Button variant="contained" fullWidth onClick={handlePlaceOrder}>Place Order</Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={snackbar.severity} onClose={handleClose}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
