"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Slot {
  startTime: string;
  endTime: string;
}

interface Props {
  serviceId: string;
  date: string;
  onSelect: (slot: Slot) => void;
}

export default function Availability({ serviceId, date, onSelect }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !date) return;
    const url = `/api/availability?serviceId=${serviceId}&date=${date}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch available slots");
        }
        return res.json();
      })
      .then((data) => setSlots(data.slots || []))
      .catch((err) => {
        toast.error(err.message || "Error loading slots");
        setSlots([]);
      });
  }, [serviceId, date]);

  const handleSelect = (slot: Slot) => {
    setSelectedSlot(slot.startTime);
    onSelect(slot);
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Available Slots</h3>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.startTime}
            className={`border rounded p-2 ${
              selectedSlot === slot.startTime
                ? "bg-blue-100 border-blue-400 text-blue-900 font-semibold"
                : ""
            }`}
            onClick={() => handleSelect(slot)}
          >
            {new Date(slot.startTime).toLocaleTimeString()} -{" "}
            {new Date(slot.endTime).toLocaleTimeString()}
          </button>
        ))}
      </div>
    </div>
  );
}
