import { instance } from ".";
import { GetReviewsRequest, Review, ReviewInput } from "../type/review.type";
const URL = "/review";

// 🟢 Lấy danh sách người dùng và tổng số đánh giá
export const getReviews = async (
  params: GetReviewsRequest
): Promise<{ reviews: Review[]; totalReviews: number }> => {
  const response = await instance.post<{
    reviews: Review[];
    totalReviews: number;
  }>(`${URL}/get-reviews`, params);

  return response.data;
};

// 🟢 Tạo mới báo cáo
export const createReview = async (body: ReviewInput): Promise<Review> => {
  const response = await instance.post<Review>(`${URL}/create-review`, body);
  return response.data;
};

export const updateReview = async (
  id: string,
  body: ReviewInput
): Promise<Review> => {
  const response = await instance.put<Review>(
    `${URL}/${id}/update-review`,
    body
  );
  return response.data;
};

// 🟢 Cập nhật trạng thái báo cáo
export const updateReviewStatus = async (
  id: string,
  status: boolean
): Promise<Review> => {
  const response = await instance.put<Review>(
    `${URL}/${id}/update-review-status`,
    { status }
  );

  return response.data;
};

// 🟢 Kiem tra review ton tai
export const checkReviewExistence = async (
  userId: string,
  productId: string
): Promise<{ review: Review; hasReview: boolean }> => {
  const response = await instance.get<{ review: Review; hasReview: boolean }>(
    `${URL}/exist/${userId}/${productId}`
  );

  return response.data;
};

// 🟢 Lấy thông tin báo cáo theo ID
export const getReportById = async (id: string): Promise<Review> => {
  const response = await instance.get<Review>(`${URL}/${id}`);

  return response.data;
};
