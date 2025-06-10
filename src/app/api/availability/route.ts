import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/utils/schedulingUtils";
import { availabilityQuerySchema } from "@/lib/schemas/availability";
import { AppointmentItem } from "@/lib/schemas/appointment";
import { ServiceItem } from "@/lib/schemas/services";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const result = availabilityQuerySchema.safeParse({
    date: searchParams.get("date"),
    serviceId: searchParams.get("serviceId"),
  });

  if (!result.success) {
    return NextResponse.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { date, serviceId } = result.data;

  // Fetch the service
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return new NextResponse("Service not found", { status: 404 });
  }

  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  const nextDate = new Date(selectedDate);
  nextDate.setDate(selectedDate.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: selectedDate,
        lt: nextDate,
      },
    },
  });

  const slots = getAvailability(
    appointments as AppointmentItem[],
    service as ServiceItem,
    9,
    17,
    selectedDate
  );

  return NextResponse.json({ slots });
}
