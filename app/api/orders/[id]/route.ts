import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  UpdateOrderStatusRequest,
  UpdateShippingInfoRequest,
} from "@/app/types/order";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        shippingInfo: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { shippingInfo: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();

    // Update order based on request body
    if ("status" in body) {
      const statusUpdate = body as UpdateOrderStatusRequest;
      await prisma.order.update({
        where: { id: params.id },
        data: { status: statusUpdate.status },
      });
    }

    if ("trackingCompany" in body && "trackingNumber" in body) {
      const shippingUpdate = body as UpdateShippingInfoRequest;
      await prisma.shippingInfo.update({
        where: { orderId: params.id },
        data: {
          trackingCompany: shippingUpdate.trackingCompany,
          trackingNumber: shippingUpdate.trackingNumber,
        },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        shippingInfo: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete related records first
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id },
    });

    await prisma.shippingInfo.delete({
      where: { orderId: params.id },
    });

    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error: unknown) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
