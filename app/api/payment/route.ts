// /app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { razorpayInstance } from "@/utils/razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { type, data } = await req.json();

  if (type === "create-subscription") {
    try {
      const options = {
        plan_id: "plan_Opqu87gElobp91", // Your plan ID
        total_count: 1, // Number of billing cycles
        customer_notify: 1, // Notify customer via email/SMS
      };

      const subscription = await razorpayInstance.subscriptions.create(options);
      return NextResponse.json({ success: true, subscription });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Subscription creation failed!",
      });
    }
  } else if (type === "verify-payment") {
    try {
      const {
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
      } = data;
      console.log(
        " razorpay_payment_id, razorpay_subscription_id, razorpay_signature",
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature
      );
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest("hex");

      if (generated_signature === razorpay_signature) {
        // Payment is verified, store the subscription and payment details in the database
        // Here, you can update the user's subscription status in the database
        console.log("data saved in db");
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({
          success: false,
          message: "Payment verification failed!",
        });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Something went wrong during verification!",
      });
    }
  }

  return NextResponse.json({ success: false });
}
