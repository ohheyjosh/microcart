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

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate request body
    if (!body.userId || !body.items || !body.shippingInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create new order with items and shipping info
    const newOrder = await prisma.order.create({
      data: {
        userId: body.userId,
        totalAmount,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        shippingInfo: {
          create: {
            address: body.shippingInfo.address,
            city: body.shippingInfo.city,
            state: body.shippingInfo.state,
            zipCode: body.shippingInfo.zipCode,
            country: body.shippingInfo.country,
          },
        },
      },
      include: {
        items: true,
        shippingInfo: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
