"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/app/types/order";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete order");
    await fetchOrders(); // Refresh the list
  };

  const updateShipping = async (
    orderId: string,
    trackingCompany: string,
    trackingNumber: string
  ) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCompany, trackingNumber }),
    });
    if (!response.ok) throw new Error("Failed to update shipping info");
    await fetchOrders(); // Refresh the list
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update order status");
    await fetchOrders(); // Refresh the list
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Status:</p>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="text-sm border rounded px-1 py-0.5">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
              <p className="text-sm text-gray-600">
                Total: ${order.totalAmount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => deleteOrder(order.id)}
              className="text-red-500 hover:text-red-700 hover:cursor-pointer">
              Delete
            </button>
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">
                      Product ID: {item.productId}
                    </span>
                    <span className="mx-2">×</span>
                    <span>{item.quantity}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">Shipping Information</h4>
            {order.shippingInfo ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {order.shippingInfo.address}
                </div>
                <div>
                  <span className="font-medium">City:</span>{" "}
                  {order.shippingInfo.city}
                </div>
                <div>
                  <span className="font-medium">State:</span>{" "}
                  {order.shippingInfo.state}
                </div>
                <div>
                  <span className="font-medium">ZIP Code:</span>{" "}
                  {order.shippingInfo.zipCode}
                </div>
                <div>
                  <span className="font-medium">Country:</span>{" "}
                  {order.shippingInfo.country}
                </div>
                {order.shippingInfo.trackingCompany &&
                  order.shippingInfo.trackingNumber && (
                    <div className="mt-2 pt-2 border-t">
                      <div>
                        <span className="font-medium">Tracking Company:</span>{" "}
                        {order.shippingInfo.trackingCompany}
                      </div>
                      <div>
                        <span className="font-medium">Tracking Number:</span>{" "}
                        {order.shippingInfo.trackingNumber}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No shipping information available
              </p>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">Update Shipping</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateShipping(
                  order.id,
                  formData.get("trackingCompany") as string,
                  formData.get("trackingNumber") as string
                );
              }}
              className="flex gap-2">
              <input
                type="text"
                name="trackingCompany"
                placeholder="Tracking Company"
                className="flex-1 border rounded px-2 py-1"
                required
              />
              <input
                type="text"
                name="trackingNumber"
                placeholder="Tracking Number"
                className="flex-1 border rounded px-2 py-1"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700 hover:cursor-pointer">
                Update
              </button>
            </form>
          </div>
        </div>
      ))}

      {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}
    </div>
  );
}
