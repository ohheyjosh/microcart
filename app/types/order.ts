export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  trackingCompany?: string;
  trackingNumber?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingInfo: OrderShippingInfo;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  shippingInfo: OrderShippingInfo;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface UpdateShippingInfoRequest {
  trackingCompany: string;
  trackingNumber: string;
}
