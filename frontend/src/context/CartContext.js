import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Load cart from backend when app loads or user logs in
  useEffect(() => {
    const fetchCart = async () => {
      const user_id = localStorage.getItem("user_id"); // or however you store it
      if (user_id) {
        try {
          const res = await api.get(`/cart/${user_id}`);
          const items = res.data?.items || [];
          const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalQty);
        } catch (err) {
          console.error("Error fetching cart:", err);
        }
      } else {
        setCartCount(0); // reset if no user
      }
    };

    fetchCart();
  }, []); // run on mount (refresh / login)

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
