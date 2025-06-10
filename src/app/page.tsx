"use client";
import { useState } from "react";
import ServiceSelector from "../components/ServiceSelector";
import Availability from "../components/Availability";
import BookingForm from "../components/BookingForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">Book Appointment</h1>

      <ServiceSelector onSelect={(s) => setSelectedService(s)} />

      <div>
        <label className="block font-medium mb-2">Select Date</label>
        <DatePicker
          selected={date ? new Date(date) : null}
          onChange={(date) => {
            if (date) setDate(date.toISOString().slice(0, 10));
            else setDate("");
          }}
          className="w-full border p-2 rounded"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date"
        />
      </div>

      {selectedService && date && (
        <Availability
          serviceId={selectedService.id}
          date={date}
          onSelect={(slot) => setSelectedSlot(slot)}
        />
      )}

      {selectedService && selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          serviceId={selectedService.id}
          price={selectedService.price}
        />
      )}
    </div>
  );
}
