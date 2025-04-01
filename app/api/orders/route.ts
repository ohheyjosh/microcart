import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateOrderRequest } from "@/app/types/order";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        shippingInfo: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
