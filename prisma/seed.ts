const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: "Haircut",
          durationInMinutes: 30,
          price: 35.0,
          currency: "INR",
        },
        {
          name: "Consultation",
          durationInMinutes: 60,
          price: 100.0,
          currency: "INR",
        },
        {
          name: "Massage",
          durationInMinutes: 45,
          price: 65.0,
          currency: "INR",
        },
        {
          name: "Quick Repair",
          durationInMinutes: 20,
          price: 40.0,
          currency: "INR",
        },
      ],
    });
    console.log("✅ Seeded services.");
  } else {
    console.log("ℹ️ Services already exist. Skipping...");
  }
  const services = await prisma.service.findMany();
  const getRandomServiceId = () => {
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex].id;
  };

  // Seed appointments
  const existingAppointments = await prisma.appointment.count();
  if (existingAppointments === 0) {
    await Promise.all([
      prisma.appointment.create({
        data: {
          serviceId: getRandomServiceId(),
          customerName: "John Smith",
          customerEmail: "john@example.com",
          customerAddress: "123 Main St",
          customerMobile: "1234567890",
          quotedPrice: 35.0,
          receivedPrice: 35.0,
          startTime: new Date("2025-04-10T10:00:00.000Z"),
          endTime: new Date("2025-04-10T10:30:00.000Z"),
        },
      }),
      prisma.appointment.create({
        data: {
          serviceId: getRandomServiceId(),
          customerName: "Alice Johnson",
          customerEmail: "alice@example.com",
          customerAddress: "456 Park Ave",
          customerMobile: "9876543210",
          quotedPrice: 65.0,
          receivedPrice: 65.0,
          startTime: new Date("2025-04-10T14:00:00.000Z"),
          endTime: new Date("2025-04-10T14:45:00.000Z"),
        },
      }),
      prisma.appointment.create({
        data: {
          serviceId: getRandomServiceId(),
          customerName: "Robert Brown",
          customerEmail: "robert@example.com",
          customerAddress: "789 Ocean Blvd",
          customerMobile: "5555555555",
          quotedPrice: 100.0,
          receivedPrice: 100.0,
          startTime: new Date("2025-04-11T09:00:00.000Z"),
          endTime: new Date("2025-04-11T10:00:00.000Z"),
        },
      }),
    ]);
    console.log("Seeded appointments.");
  } else {
    console.log("Appointments already exist. Skipping...");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
