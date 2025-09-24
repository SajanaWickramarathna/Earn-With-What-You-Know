import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import {
  Typography, Box, Button, Paper, CircularProgress, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import Nav from "../components/navigation";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart/getcart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token]);

  const handlePlaceOrder = async () => {
    try {
      const res = await api.post("/orders", 
        { payment_method: paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/shop`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  if (loading) return <CircularProgress />;

  if (!cart || cart.items.length === 0)
    return <Typography>Your cart is empty.</Typography>;

  return (
    <div>
      <Nav />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Checkout</Typography>
        <Paper sx={{ p: 2, mt: 2 }}>
          {cart.items.map(item => (
            <Box key={item.course_id} display="flex" justifyContent="space-between">
              <Typography>{item.course_id}</Typography>
              <Typography>LKR {item.price}</Typography>
            </Box>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: LKR {cart.total_price.toFixed(2)}
          </Typography>
        </Paper>

        <Typography variant="h6" sx={{ mt: 3 }}>Payment Method</Typography>
        <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery" />
          <FormControlLabel value="Card" control={<Radio />} label="Credit/Debit Card" />
        </RadioGroup>

        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 3 }}
          onClick={handlePlaceOrder}
        >
          Place Order
        </Button>
      </Box>
    </div>
  );
}
