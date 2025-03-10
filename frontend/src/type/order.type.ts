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

export interface Order {
  _id?: string;
  paymentId?: string;
  userId?: string;
  processorStaffId?: string;
  couponId?: string;
  orderDetails: OrderDetails[];
  address: {
    province?: string;
    district?: string;
    ward?: string;
    details?: string;
  };
  shippingFee?: number;
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
  user?: {
    _id: string;
    name?: string;
  };
  store?: {
    _id: string;
    name?: string;
    logo?: string;
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
  staff?: {
    _id: string;
    name?: string;
  };
  customerNote?: string;
  staffNote?: string;
  cancelNote?: string;
  distance?: number;
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
}
