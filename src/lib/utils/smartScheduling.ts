import { ServiceItem } from "../schemas/services";
import { AppointmentItem } from "../schemas/appointment";
import { getAvailability } from "./schedulingUtils";

/**
 *
 *
 * @param appointments - list of appointments
 * @param service - service to schedule
 * @param services - list of services
 * @param startHour - start hour
 * @param endHour - end hour
 * @param date - date
 * @returns list of scored slots
 * @logic
 * In this
 * 1. If the slot has a preceding appointment, we check if the gap between the preceding appointment and the slot is usable.
 * 2.
 * 2. If the slot has a succeeding appointment, we check if the gap between the slot and the succeeding appointment is usable.
 * 3. If the slot has a preceding appointment, we check if the duration of the preceding appointment is the same as the service duration.
 * 4. If the slot has a succeeding appointment, we check if the duration of the succeeding appointment is the same as the service duration.
 * 5. We then sort the slots by score and and then by start time as the tie breaker to get the most optimal slot.
 *
 * @reasoning_of_score
 * 1. we check for gap created by preceding and succeeding appointments can be used for another service appointment this way we avoid the small fragments of time that are not used.
 * this has a score of 2 because it is a good use of time and further we should more likely use this slot as it helps us with avoid ideal time slots.
 */

export function smartScheduling(
  appointments: AppointmentItem[],
  service: ServiceItem,
  services: ServiceItem[],
  startHour: number,
  endHour: number,
  date: Date
) {
  const availability = getAvailability(
    appointments,
    service,
    startHour,
    endHour,
    date
  );

  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, 0, 0, 0);

  // Create a new array with score property
  const scoredSlots = availability.map((slot) => {
    let score = 0;

    const precedingAppointment = getPrecedingAppointment(
      appointments,
      slot.startTime
    );
    if (precedingAppointment) {
      const gapMinutes =
        (new Date(slot.startTime).getTime() -
          new Date(precedingAppointment.endTime).getTime()) /
        60000;
      // gap perfect fit is the subset of the gap usable so if we have a perfect fit we should give it a higher score
      //if (isGapPerfectFit(gapMinutes, service)) {
      //  score += 3;
      //}

      if (isGapUsable(gapMinutes, services)) {
        score += 2;
      }
    }
    const succeedingAppointment = getSucceedingAppointments(
      appointments,
      slot.endTime
    );
    if (succeedingAppointment) {
      const gapMinutes =
        (new Date(succeedingAppointment.startTime).getTime() -
          new Date(slot.endTime).getTime()) /
        60000;
      // gap usable is the subset of the perfect fit so if we have a perfect fit we should give it a higher score
      //if (isGapPerfectFit(gapMinutes, service)) {
      //  score += 3;
      //}

      if (isGapUsable(gapMinutes, services)) {
        score += 2;
      }
    }

    if (isServiceDurationSame(service, precedingAppointment)) {
      score += 1;
    }

    if (isServiceDurationSame(service, succeedingAppointment)) {
      score += 1;
    }

    const lowestDurationService = lowestDuration(services);

    const perfectFit = isPerfectFitSlot(
      new Date(slot.startTime),
      new Date(slot.endTime),
      service,
      precedingAppointment,
      succeedingAppointment,
      dayStart,
      dayEnd,
      lowestDurationService
    );

    if (perfectFit) {
      score += 5;
    }

    return { ...slot, score };
  });

  scoredSlots.sort((a, b) => b.score - a.score);
  return scoredSlots.sort(
    (a, b) =>
      b.score - a.score ||
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

function isGapPerfectFit(gapMinutes: number, service: ServiceItem) {
  const rounded = Math.floor(gapMinutes);
  return rounded % service.durationInMinutes === 0;
}

function isGapUsable(gapMinutes: number, services: ServiceItem[]) {
  return services.some((service) => service.durationInMinutes <= gapMinutes);
}

function getPrecedingAppointment(
  appointments: AppointmentItem[],
  slotStartTime: string | Date
) {
  const slotStart = new Date(slotStartTime);
  // Filter appointments that end before the slot's start time
  const preceding = appointments
    .filter((app) => new Date(app.endTime) <= slotStart)
    .sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );
  // Return the latest one (if any)
  return preceding[0] || null;
}

function getSucceedingAppointments(
  appointments: AppointmentItem[],
  slotEndTime: string | Date
) {
  const slotEnd = new Date(slotEndTime);
  const succeeding = appointments
    .filter((app) => new Date(app.startTime) >= slotEnd)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  return succeeding[0] || null;
}

function isServiceDurationSame(
  service: ServiceItem,
  appointment: AppointmentItem
) {
  if (!appointment) return false;
  const durationMs =
    new Date(appointment.endTime).getTime() -
    new Date(appointment.startTime).getTime();
  const durationMinutes = durationMs / (60 * 1000);
  return service.durationInMinutes === durationMinutes;
}

/**
 * Checks if the given slot fits perfectly between the preceding and succeeding appointments,
 * or between the start/end of the working day — without leaving unusable gaps before or after.
 *
 * @param slotStart - Start time of the current slot
 * @param slotEnd - End time of the current slot (based on service duration)
 * @param service - The service being scheduled
 * @param precedingAppointment - The last appointment before the current slot (if any)
 * @param succeedingAppointment - The next appointment after the current slot (if any)
 * @param dayStart - Start of the working day
 * @param dayEnd - End of the working day
 * @returns true if both the gap before and after the slot are exact multiples of the service duration (no wasted space), else false
 *
 * Example: If a slot starts at 11:00 and ends at 11:30, and the gap before it is exactly 30 mins,
 * and the gap after it is 0 mins (immediately followed by another appointment), and the service is 30 mins long,
 * then it is a perfect fit.
 */
function isPerfectFitSlot(
  slotStart: Date,
  slotEnd: Date,
  service: ServiceItem,
  precedingAppointment: AppointmentItem | null,
  succeedingAppointment: AppointmentItem | null,
  dayStart: Date,
  dayEnd: Date,
  lowestDurationService: number
): boolean {
  const serviceDuration = service.durationInMinutes;

  // End of last appointment or start of day
  const beforeEnd = precedingAppointment
    ? new Date(precedingAppointment.endTime)
    : dayStart;

  // Start of next appointment or end of day
  const afterStart = succeedingAppointment
    ? new Date(succeedingAppointment.startTime)
    : dayEnd;

  // Calculate available gap in minutes
  const availableGap = (afterStart.getTime() - beforeEnd.getTime()) / 60000;

  // Perfect fit: gap exactly matches service duration
  if (serviceDuration === availableGap) {
    return true;
  }

  // Almost perfect: leftover gap is less than the smallest service
  if (
    availableGap - serviceDuration < lowestDurationService &&
    availableGap - serviceDuration >= 0
  ) {
    return true;
  }

  return false;
}

function lowestDuration(services: ServiceItem[]): number {
  return services.reduce((min, service) => {
    return service.durationInMinutes < min ? service.durationInMinutes : min;
  }, services[0].durationInMinutes);
}
