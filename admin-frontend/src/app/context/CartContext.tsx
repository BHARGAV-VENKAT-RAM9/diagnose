"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  type: "test" | "package";
  [key: string]: any;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  bookingType: "LAB_VISIT" | "HOME_COLLECTION";
  setBookingType: (type: "LAB_VISIT" | "HOME_COLLECTION") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bookingType, setBookingType] = useState<"LAB_VISIT" | "HOME_COLLECTION">("LAB_VISIT");
  const [isLoaded, setIsLoaded] = useState(false);

  // Retrieve initial cart and bookingType on client mount
  useEffect(() => {
    const storedCart = localStorage.getItem("vicky_cart");
    const storedType = localStorage.getItem("vicky_booking_type");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((item: any) => ({
            ...item,
            price: Number(item.price) || 0,
            discount_price: item.discount_price !== undefined && item.discount_price !== null ? Number(item.discount_price) : undefined
          }));
          setCart(sanitized);
        }
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
    if (storedType === "LAB_VISIT" || storedType === "HOME_COLLECTION") {
      setBookingType(storedType);
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("vicky_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("vicky_booking_type", bookingType);
    }
  }, [bookingType, isLoaded]);

  const addToCart = (item: CartItem) => {
    const formattedItem = {
      ...item,
      price: Number(item.price) || 0,
      discount_price: item.discount_price !== undefined && item.discount_price !== null ? Number(item.discount_price) : undefined
    };
    setCart((prev) => {
      const exists = prev.find((i) => i.id === formattedItem.id);
      if (exists) return prev;
      return [...prev, formattedItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        bookingType,
        setBookingType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
