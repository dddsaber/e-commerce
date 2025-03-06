export interface Payment {
  _id: string;
  name: string;
  description: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetPaymentsRequest {
  isDeleted?: boolean;
}
