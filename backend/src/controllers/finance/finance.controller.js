const Finance = require("../../models/Finance.model");

// ----------------------------------------------------------------
// Create a new finance information
// ----------------------------------------------------------------
const createFinancialInformation = async (
  userId,
  backAccountNumber,
  bankName,
  accountHolder
) => {
  if (!userId || !backAccountNumber || !bankName || !accountHolder) {
    return false;
  }
  const newFinancialInformation = await Finance.create({
    userId: userId,
    backAccountNumber: backAccountNumber,
    bankName: bankName,
    accountHolder: accountHolder,
    transactionHistory: [],
    isActive: true,
  });
  if (!newFinancialInformation) {
    return false;
  }
  return true;
};

// ----------------------------------------------------------------
// Update a finance information
// ----------------------------------------------------------------
const updateFinancialInformation = async (id, finance) => {
  if (!finance) {
    return false;
  }
  const updatedFinancialInformation = await Finance.findByIdAndUpdate(
    id,
    finance,
    { new: true }
  );

  if (!updatedFinancialInformation) {
    return false;
  }
  return true;
};

// ----------------------------------------------------------------
// Add transactions history
// ----------------------------------------------------------------
const addTransactionHistory = async (
  financeId,
  amount,
  type,
  date,
  description
) => {
  if (!financeId || !amount || !type || !date || !description) {
    return false;
  }
  const finance = await Finance.findByIdAndUpdate(
    financeId,
    {
      $push: {
        transactionHistory: {
          amount: amount,
          type: type,
          date: date,
          description: description,
        },
      },
    },
    { new: true }
  );
  if (!finance) {
    return false;
  }
  return true;
};

// ----------------------------------------------------------------
// Update finance status
// ----------------------------------------------------------------

const updateFinanceStatus = async (financeId, isActive) => {
  if (!financeId || typeof isActive !== "boolean") {
    return false;
  }
  const updatedFinance = await Finance.findByIdAndUpdate(
    financeId,
    { isActive: isActive },
    { new: true }
  );
  if (!updatedFinance) {
    return false;
  }
  return true;
};

// ----------------------------------------------------------------
// Export modules
// ----------------------------------------------------------------

module.exports = {
  createFinancialInformation,
  updateFinancialInformation,
  addTransactionHistory,
  updateFinanceStatus,
};
