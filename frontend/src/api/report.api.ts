import { instance } from ".";
import { GetReportsRequest, Report } from "../type/report.type";
const URL = "/report";

// 🟢 Lấy danh sách report
export const getReports = async (
  params: GetReportsRequest
): Promise<{ reports: Report[]; totalReports: number }> => {
  const response = await instance.post<{
    reports: Report[];
    totalReports: number;
  }>(`${URL}/get-reports`, params);

  return response.data;
};

// 🟢 Tạo mới báo cáo
export const createReport = async (body: Report): Promise<Report> => {
  const response = await instance.post<Report>(`${URL}/create-report`, body);
  return response.data;
};

// 🟢 Cập nhật thông tin báo cáo
export const handleReport = async (
  reportId: string,
  adminId: string
): Promise<Report> => {
  const response = await instance.put<Report>(
    `${URL}/${reportId}/${adminId}/handle`
  );
  return response.data;
};

// 🟢 Cập nhật trạng thái báo cáo
export const updateReportStatus = async (
  id: string,
  status: boolean
): Promise<Report> => {
  const response = await instance.put<Report>(
    `${URL}/${id}/update-report-status`,
    { status }
  );
  return response.data;
};

// 🟢 Lấy thông tin báo cáo theo ID
export const getReportById = async (id: string): Promise<Report> => {
  const response = await instance.get<Report>(`${URL}/${id}`);

  return response.data;
};
