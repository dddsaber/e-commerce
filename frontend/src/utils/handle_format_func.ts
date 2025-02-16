export function formatDate(dateString: Date) {
  const date = new Date(dateString);

  // Lấy giờ, phút, giây
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Lấy ngày, tháng, năm
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  // Trả về định dạng hh:mm:ss dd-mm-yyyy
  return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
}

export function formatRate(num: number) {
  return Math.round(num * 100) / 100;
}
