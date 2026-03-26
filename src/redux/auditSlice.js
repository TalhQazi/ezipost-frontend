import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 FETCH AUDIT LOGS
export const fetchAuditLogs = createAsyncThunk(
  "audit/fetchAuditLogs",
  async ({ search = "", severity = "", page = 1 }) => {
    const res = await axios.get(
      `http://localhost:5000/api/audit-logs?search=${search}&severity=${severity}&page=${page}`
    );
    return res.data;
  }
);

// 🔥 FETCH STATS
export const fetchAuditStats = createAsyncThunk(
  "audit/fetchAuditStats",
  async () => {
    const res = await axios.get(
      "http://localhost:5000/api/audit-logs/stats"
    );
    return res.data;
  }
);

const auditSlice = createSlice({
  name: "audit",
  initialState: {
    logs: [],
    pagination: {},
    stats: {},
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchAuditStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default auditSlice.reducer;