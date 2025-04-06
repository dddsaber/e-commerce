export interface OrderDetails {
  productId?: string;
  quantity: number;
  price: number;
  discount?: number;
  _id?: string;
  product?: {
    _id?: string;
    name?: string;
    image?: string;
  };
}

export interface Fee {
  commission: number;
  transaction: number;
  service: number;
}

export interface Order {
  _id?: string;
  paymentId?: string;
  userId?: string;
  processorStaffId?: string;
  couponId?: string;
  orderDetails: OrderDetails[];
  fees: Fee;
  total?: number;
  status?: string;
  statusTimestamps?: {
    pending?: Date;
    confirmed?: Date;
    shipped?: Date;
    delivered?: Date;
    cancelled?: Date;
    completed?: Date;
  };
  distance?: number;
  user?: {
    _id: string;
    name?: string;
  };
  store?: {
    _id: string;
    name?: string;
    logo?: string;
    userId: string;
  };
  payment?: {
    _id: string;
    name?: string;
  };
  coupon?: {
    _id: string;
    name?: string;
    type?: string;
    value?: number;
  };
  delivery?: Delivery;
  customerNote?: string;
  staffNote?: string;
  cancelNote?: string;
  description?: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetOrdersRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  userId?: string;
  storeId?: string;
  processorStaffId?: string;
  paymentId?: string;
  statuses?: string[];
  total_low?: number;
  total_high?: number;
  status?: string;
  settled?: boolean;
}

export interface Delivery {
  _id: string;
  orderId: string;
  courier?: string;
  trackingNumber?: string;
  estimatedDate?: Date;
  deliveredDate?: Date;
  failedReason?: string;
  recipientName: string;
  phoneNumber: string;
  address: {
    province: string;
    district: string;
    ward: string;
    details?: string;
  };
  postalCode?: string;
  shippingFee: number;
  codAmount: number;
  paymentStatus: string;
  deliveryLogs: {
    _id: string;
    location: string;
    timestamp: Date;
    warehouseInfo: {
      _id: string;
      name: string;
      address: {
        province: string;
        district: string;
        ward: string;
        details?: string;
      };
    };
  }[];
  status: string;
}

export interface GetDeliveryRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  warehouseId?: string;
  includeAll?: boolean;
  statuses?: string[];
  status?: string;
}
