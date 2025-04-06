const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Payment = require("../../models/Payment.model");

// ----------------------------------------------------------------
// Create payment
// ----------------------------------------------------------------
const createPayment = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Name and description are required"
    );
  }

  try {
    const payment = await Payment.create({
      name: name,
      description: description,
      isDeleted: false,
    });
    if (!payment) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create payment"
      );
    }

    return response(
      res,
      StatusCodes.CREATED,
      true,
      payment,
      "Payment created successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update payment
// ----------------------------------------------------------------
const updatePayment = async (req, res) => {
  const { paymentId } = req.params;
  const paymentData = req.body; // Đổi tên biến để tránh trùng

  if (!paymentId || !paymentData) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Payment ID and payment data are required"
    );
  }

  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      paymentData,
      { new: true }
    );

    if (!updatedPayment) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Payment not found or failed to update"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedPayment,
      "Payment updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get payment by id
// ----------------------------------------------------------------
const getPaymentById = async (req, res) => {
  const { paymentId } = req.params;
  if (!paymentId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Payment ID is required"
    );
  }

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Payment not found"
      );
    }
    if (payment.isDeleted) {
      return response(
        res,
        StatusCodes.GONE,
        false,
        {},
        "Payment has been deleted"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      payment,
      "Payment retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update payment status
// ----------------------------------------------------------------
const updatePaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  if (!paymentId || !status) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Payment ID and status are required"
    );
  }

  try {
    const updatePayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: status,
      },
      { new: true }
    );
    if (!updatePayment) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update payment status"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatePayment,
      "Payment status updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get payments
// ----------------------------------------------------------------
const getPayments = async (req, res) => {
  const { isDeleted } = req.body;

  try {
    const filters = {};
    if (isDeleted !== undefined) {
      filters.push({ isDeleted: isDeleted });
    }

    const totalPayments = await Payment.countDocuments(filters);

    const payments = await Payment.find(filters);

    if (!payments) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to retrieve payments"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      { payments, totalPayments },
      "Payments retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------
module.exports = {
  createPayment,
  updatePayment,
  getPaymentById,
  updatePaymentStatus,
  getPayments,
};
