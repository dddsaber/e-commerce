import { message } from "antd";
import { instance } from ".";
import { GetReviewsRequest, Review } from "../type/review.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/review";

// 🟢 Lấy danh sách người dùng và tổng số đánh giá
export const getReviews = async (
  params: GetReviewsRequest
): Promise<{ reviews: Review[]; totalReviews: number }> => {
  try {
    const response = await instance.post<{
      reviews: Review[];
      totalReviews: number;
    }>(`${URL}/get-reviews`, params);

    if (response.status) {
      return response.data; // Trả về cả danh sách reviews và tổng số reviews
    } else {
      message.error("Không thể lấy danh sách báo cáo");
      return { reviews: [], totalReviews: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { reviews: [], totalReviews: 0 }; // Đảm bảo trả về cả reviews và totalReviews mặc định là 0
  }
};

// 🟢 Tạo mới báo cáo
export const createReview = async (body: Review): Promise<Review> => {
  try {
    const response = await instance.post<Review>(`${URL}/create-review`, body);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo người dùng");
      return {} as Review;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Review;
  }
};

// 🟢 Cập nhật trạng thái báo cáo
export const updateReviewStatus = async (
  id: string,
  status: boolean
): Promise<Review> => {
  try {
    const response = await instance.put<Review>(
      `${URL}/${id}/update-review-status`,
      { status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái người dùng");
      return {} as Review;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Review;
  }
};

// 🟢 Lấy thông tin báo cáo theo ID
export const getReportById = async (id: string): Promise<Review> => {
  try {
    const response = await instance.get<Review>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin người dùng");
      return {} as Review;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Review;
  }
};
