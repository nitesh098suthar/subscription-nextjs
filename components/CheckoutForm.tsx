// /components/CheckoutForm.tsx
"use client";
import axios from "axios";
import { useState } from "react";

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async () => {
    setLoading(true);

    try {
      const {
        data: { subscription },
      } = await axios.post("/api/payment", {
        type: "create-subscription",
      });

      // Ensure Razorpay is loaded before using it
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          subscription_id: subscription.id,
          name: "Your Company Name",
          description: "Monthly Subscription",
          handler: async (response: any) => {
            const paymentData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            };

            const result = await axios.post("/api/payment", {
              type: "verify-payment",
              data: paymentData,
            });

            if (result.data.success) {
              window.location.href = "/success";
            } else {
              window.location.href = "/failure";
            }
          },
          prefill: {
            name: "User Name",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        console.error("Razorpay SDK not loaded");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
    }

    setLoading(false);
  };

  return (
    <button onClick={handleSubscription} disabled={loading}>
      {loading ? "Processing..." : "Buy Subscription for ₹500"}
    </button>
  );
};

export default CheckoutForm;
