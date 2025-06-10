import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { ServiceItem, serviceItemSchema } from "@/lib/schemas/services";
import z, { ZodError } from "zod";
import { parseZodError } from "@/lib/utils/zodErrorParser";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /services error:", error);
    return new NextResponse("Failed to fetch services", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let parsed: ServiceItem[] = [];
    const isArrayInput = Array.isArray(body);

    if (isArrayInput) {
      parsed = z.array(serviceItemSchema).parse(body);
    } else {
      parsed = [serviceItemSchema.parse(body)];
    }

    if (isArrayInput) {
      const data = parsed.map((item) => ({
        name: item.name,
        durationInMinutes: item.durationInMinutes,
        price: new Decimal(item.price.toFixed(2)),
        currency: item.currency,
      }));

      const created = await prisma.service.createMany({ data });
      return NextResponse.json({ count: created }, { status: 201 });
    } else {
      const item = parsed[0];
      const created = await prisma.service.create({
        data: {
          name: item.name,
          durationInMinutes: item.durationInMinutes,
          price: new Decimal(item.price.toFixed(2)),
          currency: item.currency,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const parsed = parseZodError(error);
      return new NextResponse(JSON.stringify(parsed), { status: 400 });
    }
    console.error("POST /services error:", error);
    return new NextResponse(
      error?.errors ? JSON.stringify(error.errors) : "Invalid input",
      { status: 400 }
    );
  }
}
