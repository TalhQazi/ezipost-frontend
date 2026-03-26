import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 FETCH TRANSACTIONS
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async ({ 
    search = "", 
    transactionType = "", 
    status = "",
    paymentMethod = "",
    currency = "",
    minAmount = "",
    maxAmount = "",
    startDate = "",
    endDate = "",
    assignedTo = "",
    priority = "",
    hasEscrow = "",
    page = 1, 
    limit = 50 
  }) => {
    const params = new URLSearchParams({
      search,
      transactionType,
      status,
      paymentMethod,
      currency,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      assignedTo,
      priority,
      hasEscrow,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const res = await axios.get(
      `http://localhost:5000/api/transactions?${params}`
    );
    return res.data;
  }
);

// 🔥 FETCH TRANSACTION STATS
export const fetchTransactionStats = createAsyncThunk(
  "transactions/fetchTransactionStats",
  async ({ startDate = "", endDate = "" } = {}) => {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await axios.get(
      `http://localhost:5000/api/transactions/stats?${params}`
    );
    return res.data;
  }
);

// 🔥 CREATE TRANSACTION
export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData) => {
    const res = await axios.post(
      "http://localhost:5000/api/transactions",
      transactionData
    );
    return res.data;
  }
);

// 🔥 UPDATE TRANSACTION STATUS
export const updateTransactionStatus = createAsyncThunk(
  "transactions/updateTransactionStatus",
  async ({ id, statusData }) => {
    const res = await axios.patch(
      `http://localhost:5000/api/transactions/${id}/status`,
      statusData
    );
    return res.data;
  }
);

// 🔥 PROCESS REFUND
export const processRefund = createAsyncThunk(
  "transactions/processRefund",
  async ({ id, refundData }) => {
    const res = await axios.patch(
      `http://localhost:5000/api/transactions/${id}/refund`,
      refundData
    );
    return res.data;
  }
);

// 🔥 ADD FEE
export const addFee = createAsyncThunk(
  "transactions/addFee",
  async ({ id, feeData }) => {
    const res = await axios.patch(
      `http://localhost:5000/api/transactions/${id}/fee`,
      feeData
    );
    return res.data;
  }
);

// 🔥 UPLOAD DOCUMENT
export const uploadDocument = createAsyncThunk(
  "transactions/uploadDocument",
  async ({ id, documentData }) => {
    const res = await axios.patch(
      `http://localhost:5000/api/transactions/${id}/document`,
      documentData
    );
    return res.data;
  }
);

// 🔥 BULK UPDATE TRANSACTIONS
export const bulkUpdateTransactions = createAsyncThunk(
  "transactions/bulkUpdateTransactions",
  async (bulkData) => {
    const res = await axios.patch(
      "http://localhost:5000/api/transactions/bulk",
      bulkData
    );
    return res.data;
  }
);

// 🔥 DELETE TRANSACTION
export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id) => {
    await axios.delete(`http://localhost:5000/api/transactions/${id}`);
    return id;
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [],
    pagination: {},
    stats: {},
    loading: false,
    creating: false,
    updating: false,
    refunding: false,
    bulkUpdating: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.transactions = [];
      state.pagination = {};
      state.stats = {};
      state.loading = false;
      state.creating = false;
      state.updating = false;
      state.refunding = false;
      state.bulkUpdating = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Fetch Stats
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

    // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.creating = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message;
      })

    // Update Transaction Status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.transactions.findIndex(tx => tx._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Process Refund
      .addCase(processRefund.pending, (state) => {
        state.refunding = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.refunding = false;
        const index = state.transactions.findIndex(tx => tx._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.refunding = false;
        state.error = action.error.message;
      })

    // Add Fee
      .addCase(addFee.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(tx => tx._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })

    // Upload Document
      .addCase(uploadDocument.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(tx => tx._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })

    // Bulk Update
      .addCase(bulkUpdateTransactions.pending, (state) => {
        state.bulkUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateTransactions.fulfilled, (state, action) => {
        state.bulkUpdating = false;
        // Refresh the list after bulk update
        return state;
      })
      .addCase(bulkUpdateTransactions.rejected, (state, action) => {
        state.bulkUpdating = false;
        state.error = action.error.message;
      })

    // Delete Transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(tx => tx._id !== action.payload);
      });
  },
});

export const { clearError, resetState } = transactionsSlice.actions;
export default transactionsSlice.reducer;
