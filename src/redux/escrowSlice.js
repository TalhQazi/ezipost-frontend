import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 FETCH ESCROW ACCOUNTS
export const fetchEscrowAccounts = createAsyncThunk(
  "escrow/fetchEscrowAccounts",
  async ({ 
    search = "", 
    status = "", 
    accountType = "", 
    currency = "",
    page = 1, 
    limit = 50 
  }) => {
    const params = new URLSearchParams({
      search,
      status,
      accountType,
      currency,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const res = await axios.get(
      `http://localhost:5000/api/escrow-accounts?${params}`
    );
    return res.data;
  }
);

// 🔥 FETCH ESCROW STATS
export const fetchEscrowStats = createAsyncThunk(
  "escrow/fetchEscrowStats",
  async () => {
    const res = await axios.get(
      "http://localhost:5000/api/escrow-accounts/stats"
    );
    return res.data;
  }
);

// 🔥 CREATE ESCROW ACCOUNT
export const createEscrowAccount = createAsyncThunk(
  "escrow/createEscrowAccount",
  async (accountData) => {
    const res = await axios.post(
      "http://localhost:5000/api/escrow-accounts",
      accountData
    );
    return res.data;
  }
);

// 🔥 UPDATE ESCROW ACCOUNT
export const updateEscrowAccount = createAsyncThunk(
  "escrow/updateEscrowAccount",
  async ({ id, accountData }) => {
    const res = await axios.put(
      `http://localhost:5000/api/escrow-accounts/${id}`,
      accountData
    );
    return res.data;
  }
);

// 🔥 UPDATE ESCROW BALANCE
export const updateEscrowBalance = createAsyncThunk(
  "escrow/updateEscrowBalance",
  async ({ id, balanceData }) => {
    const res = await axios.patch(
      `http://localhost:5000/api/escrow-accounts/${id}/balance`,
      balanceData
    );
    return res.data;
  }
);

// 🔥 DELETE ESCROW ACCOUNT
export const deleteEscrowAccount = createAsyncThunk(
  "escrow/deleteEscrowAccount",
  async (id) => {
    await axios.delete(`http://localhost:5000/api/escrow-accounts/${id}`);
    return id;
  }
);

const escrowSlice = createSlice({
  name: "escrow",
  initialState: {
    accounts: [],
    pagination: {},
    stats: {},
    loading: false,
    creating: false,
    updating: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.accounts = [];
      state.pagination = {};
      state.stats = {};
      state.loading = false;
      state.creating = false;
      state.updating = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Accounts
    builder
      .addCase(fetchEscrowAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEscrowAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEscrowAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Fetch Stats
      .addCase(fetchEscrowStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

    // Create Account
      .addCase(createEscrowAccount.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createEscrowAccount.fulfilled, (state, action) => {
        state.creating = false;
        state.accounts.unshift(action.payload);
      })
      .addCase(createEscrowAccount.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message;
      })

    // Update Account
      .addCase(updateEscrowAccount.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEscrowAccount.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.accounts.findIndex(acc => acc._id === action.payload._id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(updateEscrowAccount.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Update Balance
      .addCase(updateEscrowBalance.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEscrowBalance.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.accounts.findIndex(acc => acc._id === action.payload.account._id);
        if (index !== -1) {
          state.accounts[index] = action.payload.account;
        }
      })
      .addCase(updateEscrowBalance.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Delete Account
      .addCase(deleteEscrowAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(acc => acc._id !== action.payload);
      });
  },
});

export const { clearError, resetState } = escrowSlice.actions;
export default escrowSlice.reducer;
