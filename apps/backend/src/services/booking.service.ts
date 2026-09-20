import prisma from '../lib/prisma';

const ACTIVE_BOOKING_STATUSES = [
  'MENUNGGU_PEMBAYARAN',
  'MENUNGGU_KONFIRMASI',
  'DIPROSES',
] as const;

export const getRoomAvailability = async (
  roomId: number,
  checkIn: Date,
  checkOut: Date
) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      quantity: true,
    },
  });

  if (!room) {
    throw new Error('Room tidak ditemukan');
  }

  const unavailableDates = await prisma.roomAvailability.count({
    where: {
      roomId,
      date: {
        gte: checkIn,
        lt: checkOut,
      },
      isAvailable: false,
    },
  });

  if (unavailableDates > 0) {
    return {
      totalQuantity: room.quantity,
      bookedQuantity: 0,
      availableQuantity: 0,
    };
  }

  const overlappingBookings = await prisma.booking.count({
    where: {
      roomId,
      status: {
        in: [...ACTIVE_BOOKING_STATUSES],
      },
      checkIn: {
        lt: checkOut,
      },
      checkOut: {
        gt: checkIn,
      },
    },
  });

  const availableQuantity = room.quantity - overlappingBookings;

  return {
    totalQuantity: room.quantity,
    bookedQuantity: overlappingBookings,
    availableQuantity: Math.max(availableQuantity, 0),
  };
};

export const getRoomNightlyPrices = async (
  roomId: number,
  checkIn: Date,
  checkOut: Date
) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      price: true,
    },
  });

  if (!room) {
    throw new Error('Room tidak ditemukan');
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  const specialPrices = await prisma.roomPrice.findMany({
    where: {
      roomId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const prices = [];

  const currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];

    const specialPrice = specialPrices.find(
      (item) => item.date.toISOString().split('T')[0] === dateKey
    );

    prices.push({
      date: new Date(currentDate),
      price: specialPrice?.price ?? room.price,
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return prices;
};

export const getUserBookings = async (userId: number) => {
  // Batalkan otomatis booking yang belum dibayar
  // dan sudah melewati payment deadline.
  await prisma.booking.updateMany({
    where: {
      userId,
      status: 'MENUNGGU_PEMBAYARAN',
      paymentDeadline: {
        lt: new Date(),
      },
    },
    data: {
      status: 'DIBATALKAN',
    },
  });

  return prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          category: true,
          imageUrl: true,
          address: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      nights: {
        orderBy: {
          date: 'asc',
        },
        select: {
          id: true,
          date: true,
          price: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};