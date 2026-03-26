import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 FETCH REPORTS
export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async ({ 
    search = "", 
    reportType = "", 
    status = "",
    dataSource = "",
    createdBy = "",
    page = 1, 
    limit = 50 
  }) => {
    const params = new URLSearchParams({
      search,
      reportType,
      status,
      dataSource,
      createdBy,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const res = await axios.get(
      `http://localhost:5000/api/reports?${params}`
    );
    return res.data;
  }
);

// 🔥 FETCH REPORT TEMPLATES
export const fetchReportTemplates = createAsyncThunk(
  "reports/fetchReportTemplates",
  async () => {
    const res = await axios.get(
      "http://localhost:5000/api/reports/templates"
    );
    return res.data;
  }
);

// 🔥 FETCH REPORT STATS
export const fetchReportStats = createAsyncThunk(
  "reports/fetchReportStats",
  async () => {
    const res = await axios.get(
      "http://localhost:5000/api/reports/stats"
    );
    return res.data;
  }
);

// 🔥 CREATE REPORT
export const createReport = createAsyncThunk(
  "reports/createReport",
  async (reportData) => {
    const res = await axios.post(
      "http://localhost:5000/api/reports",
      reportData
    );
    return res.data;
  }
);

// 🔥 EXECUTE REPORT
export const executeReport = createAsyncThunk(
  "reports/executeReport",
  async (id) => {
    const res = await axios.post(
      `http://localhost:5000/api/reports/${id}/execute`
    );
    return { id, result: res.data };
  }
);

// 🔥 UPDATE REPORT
export const updateReport = createAsyncThunk(
  "reports/updateReport",
  async ({ id, reportData }) => {
    const res = await axios.put(
      `http://localhost:5000/api/reports/${id}`,
      reportData
    );
    return res.data;
  }
);

// 🔥 DELETE REPORT
export const deleteReport = createAsyncThunk(
  "reports/deleteReport",
  async (id) => {
    await axios.delete(`http://localhost:5000/api/reports/${id}`);
    return id;
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    reports: [],
    templates: [],
    pagination: {},
    stats: {},
    loading: false,
    creating: false,
    executing: false,
    updating: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.reports = [];
      state.templates = [];
      state.pagination = {};
      state.stats = {};
      state.loading = false;
      state.creating = false;
      state.executing = false;
      state.updating = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Fetch Templates
      .addCase(fetchReportTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      })

    // Fetch Stats
      .addCase(fetchReportStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

    // Create Report
      .addCase(createReport.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.creating = false;
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message;
      })

    // Execute Report
      .addCase(executeReport.pending, (state) => {
        state.executing = true;
        state.error = null;
      })
      .addCase(executeReport.fulfilled, (state, action) => {
        state.executing = false;
        const index = state.reports.findIndex(report => report._id === action.payload.id);
        if (index !== -1) {
          state.reports[index].lastRun = action.payload.result.report;
          state.reports[index].executionResult = action.payload.result;
        }
      })
      .addCase(executeReport.rejected, (state, action) => {
        state.executing = false;
        state.error = action.error.message;
      })

    // Update Report
      .addCase(updateReport.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.reports.findIndex(report => report._id === action.payload._id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Delete Report
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(report => report._id !== action.payload);
      });
  },
});

export const { clearError, resetState } = reportsSlice.actions;
export default reportsSlice.reducer;
