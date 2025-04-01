import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import OrderList from "../OrderList";

// Mock the fetch function
global.fetch = jest.fn();

describe("OrderList", () => {
  const mockOrders = [
    {
      id: "1",
      userId: "user123",
      items: [{ productId: "123", quantity: 2, price: 10 }],
      totalAmount: 20,
      status: "pending",
      shippingInfo: {
        address: "123 Example St",
        city: "New York",
        state: "NY",
        zipCode: "12345",
        country: "US",
      },
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Setup default fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });
  });

  it("renders loading state initially", () => {
    render(<OrderList />);

    const loadingText = screen.getByText("Loading orders...");

    expect(loadingText).toBeInTheDocument();
  });

  it("renders orders after successful fetch", async () => {
    render(<OrderList />);

    await waitFor(() => {
      const orderAddress = screen.getByText("123 Example St");

      expect(orderAddress).toBeInTheDocument();
    });
  });

  it("updates order status when status is changed", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([{ ...mockOrders[0], status: "processing" }]),
      });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText("Status:")).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "processing" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "processing" }),
      });
    });
  });

  it("updates shipping information when form is submitted", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              ...mockOrders[0],
              shippingInfo: {
                ...mockOrders[0].shippingInfo,
                trackingCompany: "Test Company",
                trackingNumber: "123456",
              },
            },
          ]),
      });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText("Update Shipping")).toBeInTheDocument();
    });

    const trackingCompanyInput =
      screen.getByPlaceholderText("Tracking Company");
    const trackingNumberInput = screen.getByPlaceholderText("Tracking Number");
    const updateButton = screen.getByText("Update");

    fireEvent.change(trackingCompanyInput, {
      target: { value: "Test Company" },
    });
    fireEvent.change(trackingNumberInput, { target: { value: "123456" } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingCompany: "Test Company",
          trackingNumber: "123456",
        }),
      });
    });
  });

  it("deletes an order when delete button is clicked", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(<OrderList />);

    await waitFor(() => {
      const deleteButton = screen.getByText("Delete");

      expect(deleteButton).toBeInTheDocument();
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders/1", {
        method: "DELETE",
      });
    });
  });
});
