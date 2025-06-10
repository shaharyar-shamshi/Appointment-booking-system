"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  durationInMinutes: number;
  price: number;
  currency: string;
}

interface Props {
  onSelect: (service: Service) => void;
}

export default function ServiceSelector({ onSelect }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch services");
        }
        return res.json();
      })
      .then(setServices)
      .catch((err) => {
        toast.error(err.message || "Error loading services");
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-4">
      <label className="block font-medium mb-2">Select Service</label>
      <select
        className="w-full border p-2 rounded"
        onChange={(e) => {
          const selected = services.find((s) => s.id === e.target.value);
          if (selected) onSelect(selected);
        }}
      >
        <option value="">-- Choose a service --</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} - {s.price} {s.currency}
          </option>
        ))}
      </select>
    </div>
  );
}
