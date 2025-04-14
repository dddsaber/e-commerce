const mongoose = require("mongoose");

const financeSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bankAccountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountHolder: {
      type: String,
      required: true,
    },

    transactionHistory: [
      {
        amount: {
          type: Number, // Số tiền giao dịch
          required: true,
        },
        type: {
          type: String, // Loại giao dịch: 'credit' hoặc 'debit'
          enum: ["credit", "debit"], // Chỉ chấp nhận các giá trị này
          required: true,
        },
        date: {
          type: Date, // Ngày giờ giao dịch
          default: Date.now, // Mặc định là thời gian hiện tại
        },

        description: {
          type: String, // Mô tả chi tiết giao dịch (tùy chọn)
        },
      },
      {
        timestamps: true, // Thêm timestamps cho các thuộc tính tạo và cập nhật
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Finance = mongoose.model("Finance", financeSchema);

module.exports = Finance;
