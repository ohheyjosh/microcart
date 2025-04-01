"use client";

import { useState } from "react";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CreateOrderForm() {
  const [items, setItems] = useState<OrderItem[]>([
    { productId: "", quantity: 1, price: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const shippingInfo: OrderShippingInfo = {
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      country: formData.get("country") as string,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user123", // static for now, replace with actual authenticated user when authentication exists
          items,
          shippingInfo,
        }),
      });

      if (!response.ok)
        throw new Error(`Failed to create order: ${response.statusText}`);

      // Reset form
      form.reset();
      setItems([{ productId: "", quantity: 1, price: 0 }]);
    } catch (err) {
      console.error(`Failed to create order: ${err}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Order Items</h3>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              name={`productId-${index}`}
              value={item.productId}
              onChange={(e) => updateItem(index, "productId", e.target.value)}
              placeholder="Product ID"
              className="flex-1 border rounded px-2 py-1"
              required
            />
            <input
              type="number"
              name={`quantity-${index}`}
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", parseInt(e.target.value))
              }
              min="1"
              className="w-20 border rounded px-2 py-1"
              required
            />
            <input
              type="number"
              name={`price-${index}`}
              value={item.price}
              onChange={(e) =>
                updateItem(index, "price", parseFloat(e.target.value))
              }
              step="0.01"
              min="0"
              className="w-24 border rounded px-2 py-1"
              required
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500">
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-blue-500 hover:text-blue-700 hover:cursor-pointer">
          + Add Item
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Shipping Information</h3>
        <input
          type="text"
          name="address"
          placeholder="Address"
          className="w-full border rounded px-2 py-1"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="city"
            placeholder="City"
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            className="border rounded px-2 py-1"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            className="border rounded px-2 py-1"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 hover:cursor-pointer">
        Create Order
      </button>
    </form>
  );
}
