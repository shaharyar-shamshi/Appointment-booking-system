import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import { parseZodError } from "@/lib/utils/zodErrorParser";
import Decimal from "decimal.js";
import { AppointmentItem, appointmentSchema } from "@/lib/schemas/appointment";
import { getAvailability } from "@/lib/utils/schedulingUtils";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      include: { service: true },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /appointments error:", error);
    return new NextResponse("Failed to fetch appointments", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const data = appointmentSchema.parse(body);

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.durationInMinutes);

    const parsedStart = new Date(startTime);
    const parsedDate = new Date(parsedStart);
    parsedDate.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: parsedDate,
          lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const availableSlots = getAvailability(
      appointments as AppointmentItem[],
      service,
      9,
      17,
      parsedDate
    );

    const matchedSlot = availableSlots.find(
      (slot) => new Date(slot.startTime).getTime() === parsedStart.getTime()
    );

    if (!matchedSlot) {
      return NextResponse.json(
        { error: "Slot is not available" },
        { status: 409 }
      );
    }

    const created = await prisma.appointment.create({
      data: {
        serviceId: data.serviceId,
        startTime,
        endTime,
        quotedPrice: new Decimal(data.quotedPrice.toFixed(2)),
        receivedPrice: data.receivedPrice
          ? new Decimal(data.receivedPrice.toFixed(2))
          : new Decimal(data.quotedPrice.toFixed(2)),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerMobile: data.customerMobile,
        customerAddress: data.customerAddress,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      const parsed = parseZodError(err);
      return new NextResponse(JSON.stringify(parsed), { status: 400 });
    }

    console.error("POST /appointments error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
