"use client";
import { useState } from "react";
import { toast } from "sonner";

interface BookingData {
  serviceId: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  quotedPrice: number;
  receivedPrice: number;
}

interface Props {
  slot: { startTime: string; endTime: string };
  serviceId: string;
  price: number;
}

export default function BookingForm({ slot, serviceId, price }: Props) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerMobile: "",
    customerAddress: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (
      !form.customerName.trim() ||
      !form.customerEmail.trim() ||
      !form.customerMobile.trim() ||
      !form.customerAddress.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.customerEmail)) {
      toast.error("Invalid email format");
      return;
    }

    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(form.customerMobile)) {
      toast.error("Invalid phone number format");
      return;
    }

    const payload: BookingData = {
      ...form,
      serviceId,
      startTime: slot.startTime,
      quotedPrice: Number(price),
      receivedPrice: Number(price),
    };
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Appointment booked successfully!");
      } else {
        console.log(res);
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to book appointment");
      }
    } catch (err: any) {
      console.log(err);
      toast.error(err.message || "Failed to book appointment");
    }
  };

  if (submitted)
    return (
      <div className="space-y-3 text-green-600 font-semibold">
        <p>Appointment Booked!</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({
              customerName: "",
              customerEmail: "",
              customerMobile: "",
              customerAddress: "",
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book Another
        </button>
      </div>
    );

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Booking Details</h3>
      <input
        className="w-full border p-2 rounded"
        placeholder="Customer Name"
        value={form.customerName}
        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Customer Email"
        value={form.customerEmail}
        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Customer Mobile"
        value={form.customerMobile}
        onChange={(e) => setForm({ ...form, customerMobile: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Customer Address"
        value={form.customerAddress}
        onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Book Appointment
      </button>
    </div>
  );
}
