import { ServiceItem } from "../schemas/services";
import { AppointmentItem } from "../schemas/appointment";

export function getAvailability(
  appointments: AppointmentItem[],
  service: ServiceItem,
  startHour: number,
  endHour: number,
  date: Date
) {
  const slots = allSlots(service, startHour, endHour, date);

  const availableSlots = slots
    .filter(
      (slot) =>
        !isOverlapping(slot, appointments, service.durationInMinutes, service)
    )
    .map((slot) => {
      const startTime = new Date(slot);
      const endTime = new Date(slot);
      endTime.setMinutes(endTime.getMinutes() + service.durationInMinutes);

      return {
        ...slot,
        startTime,
        endTime,
      };
    });

  return availableSlots;
}

function allSlots(
  service: ServiceItem,
  startHour: number,
  endHour: number,
  date: Date
) {
  const slots = [];

  const duration = service.durationInMinutes * 60 * 1000;
  const start = new Date(date);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);
  let current = new Date(start);

  while (current.getTime() + duration <= end.getTime()) {
    slots.push(new Date(current));
    current.setMinutes(current.getMinutes() + service.durationInMinutes);
  }

  return slots;
}

function isOverlapping(
  slot: Date,
  appointments: AppointmentItem[],
  duration: number,
  service: ServiceItem
) {
  const slotStart = new Date(slot);
  const slotEnd = new Date(slot);
  slotEnd.setMinutes(slotEnd.getMinutes() + service.durationInMinutes);

  return appointments.some((appointment) => {
    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);

    return slotStart < appointmentEnd && slotEnd > appointmentStart;
  });
}
