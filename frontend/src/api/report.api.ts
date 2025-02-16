import { message } from "antd";
import { instance } from ".";
import { GetReportsRequest, Report } from "../type/report.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/report";

// 🟢 Lấy danh sách người dùng
export const getReports = async (
  params: GetReportsRequest
): Promise<{ reports: Report[]; totalReports: number }> => {
  try {
    console.log(params);
    const response = await instance.post<{
      reports: Report[];
      totalReports: number;
    }>(`${URL}/get-reports`, params);
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách báo cáo");
      return { reports: [], totalReports: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { reports: [], totalReports: 0 };
  }
};

// 🟢 Tạo mới báo cáo
export const createReport = async (body: Report): Promise<Report> => {
  try {
    const response = await instance.post<Report>(`${URL}/create-report`, body);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo người dùng");
      return {} as Report;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Report;
  }
};

// 🟢 Cập nhật thông tin báo cáo
export const handleReport = async (
  reportId: string,
  adminId: string
): Promise<Report> => {
  try {
    const response = await instance.put<Report>(
      `${URL}/${reportId}/${adminId}/handle`
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật người dùng");
      return {} as Report;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Report;
  }
};

// 🟢 Cập nhật trạng thái báo cáo
export const updateReportStatus = async (
  id: string,
  status: boolean
): Promise<Report> => {
  try {
    const response = await instance.put<Report>(
      `${URL}/${id}/update-report-status`,
      { status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái người dùng");
      return {} as Report;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Report;
  }
};

// 🟢 Lấy thông tin báo cáo theo ID
export const getReportById = async (id: string): Promise<Report> => {
  try {
    const response = await instance.get<Report>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin người dùng");
      return {} as Report;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Report;
  }
};
