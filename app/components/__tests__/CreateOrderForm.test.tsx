import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateOrderForm from "../CreateOrderForm";

// Mock the fetch function
global.fetch = jest.fn();

describe("CreateOrderForm", () => {
  const mockOnOrderCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "1" }),
    });
  });

  it("renders the form with initial item fields", () => {
    render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    expect(screen.getByPlaceholderText("Product ID")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
    expect(screen.getByText("+ Add Item")).toBeInTheDocument();
  });

  it("adds a new item when Add Item button is clicked", () => {
    render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    const addButton = screen.getByText("+ Add Item");
    fireEvent.click(addButton);

    const productIdInputs = screen.getAllByPlaceholderText("Product ID");
    expect(productIdInputs).toHaveLength(2);
  });

  it("removes an item when Remove button is clicked", () => {
    render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    // Add an item first
    const addButton = screen.getByText("+ Add Item");
    fireEvent.click(addButton);

    // Remove the second item
    const removeButton = screen.getAllByText("Remove")[0];
    fireEvent.click(removeButton);

    const productIdInputs = screen.getAllByPlaceholderText("Product ID");
    expect(productIdInputs).toHaveLength(1);
  });

  it("updates item fields when values change", () => {
    const { container } = render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    const productIdInput = screen.getByPlaceholderText("Product ID");
    const quantityInput = container.querySelector(`input[name="quantity-0"]`);
    const priceInput = container.querySelector(`input[name="price-0"]`);

    fireEvent.change(productIdInput, { target: { value: "123" } });
    fireEvent.change(quantityInput, { target: { value: "2" } });
    fireEvent.change(priceInput, { target: { value: "0.99" } });

    expect(productIdInput).toHaveValue("123");
    expect(quantityInput).toHaveValue(2);
    expect(priceInput).toHaveValue(0.99);
  });

  it("submits the form successfully", async () => {
    const { container } = render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Product ID"), {
      target: { value: "123" },
    });
    fireEvent.change(container.querySelector(`input[name="quantity-0"]`), {
      target: { value: "2" },
    });
    fireEvent.change(container.querySelector(`input[name="price-0"]`), {
      target: { value: "10" },
    });

    fireEvent.change(screen.getByPlaceholderText("Address"), {
      target: { value: "123 Example St" },
    });
    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByPlaceholderText("State"), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByPlaceholderText("ZIP Code"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText("Country"), {
      target: { value: "US" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Create Order"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user123",
          items: [{ productId: "123", quantity: 2, price: 10 }],
          shippingInfo: {
            address: "123 Example St",
            city: "New York",
            state: "NY",
            zipCode: "12345",
            country: "US",
          },
        }),
      });
    });

    expect(mockOnOrderCreated).toHaveBeenCalled();
  });

  it("handles form submission error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { container } = render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText("Product ID"), {
      target: { value: "123" },
    });
    fireEvent.change(container.querySelector(`input[name="quantity-0"]`), {
      target: { value: "2" },
    });
    fireEvent.change(container.querySelector(`input[name="price-0"]`), {
      target: { value: "10.99" },
    });

    fireEvent.change(screen.getByPlaceholderText("Address"), {
      target: { value: "123 Example St" },
    });
    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByPlaceholderText("State"), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByPlaceholderText("ZIP Code"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText("Country"), {
      target: { value: "US" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Create Order"));

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    render(<CreateOrderForm onOrderCreated={mockOnOrderCreated} />);

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText("Create Order"));

    // Check that the form wasn't submitted
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });
});
