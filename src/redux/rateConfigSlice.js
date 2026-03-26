import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 FETCH RATE CONFIGS
export const fetchRateConfigs = createAsyncThunk(
  "rateConfig/fetchRateConfigs",
  async ({ 
    search = "", 
    rateType = "", 
    serviceName = "", 
    status = "",
    currency = "",
    page = 1, 
    limit = 50 
  }) => {
    const params = new URLSearchParams({
      search,
      rateType,
      serviceName,
      status,
      currency,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const res = await axios.get(
      `http://localhost:5000/api/rate-config?${params}`
    );
    return res.data;
  }
);

// 🔥 FETCH RATE CONFIG STATS
export const fetchRateConfigStats = createAsyncThunk(
  "rateConfig/fetchRateConfigStats",
  async () => {
    const res = await axios.get(
      "http://localhost:5000/api/rate-config/stats"
    );
    return res.data;
  }
);

// 🔥 CALCULATE RATE
export const calculateRate = createAsyncThunk(
  "rateConfig/calculateRate",
  async (rateData) => {
    const res = await axios.get(
      "http://localhost:5000/api/rate-config/calculate",
      { params: rateData }
    );
    return res.data;
  }
);

// 🔥 CREATE RATE CONFIG
export const createRateConfig = createAsyncThunk(
  "rateConfig/createRateConfig",
  async (configData) => {
    const res = await axios.post(
      "http://localhost:5000/api/rate-config",
      configData
    );
    return res.data;
  }
);

// 🔥 UPDATE RATE CONFIG
export const updateRateConfig = createAsyncThunk(
  "rateConfig/updateRateConfig",
  async ({ id, configData }) => {
    const res = await axios.put(
      `http://localhost:5000/api/rate-config/${id}`,
      configData
    );
    return res.data;
  }
);

// 🔥 CLONE RATE CONFIG
export const cloneRateConfig = createAsyncThunk(
  "rateConfig/cloneRateConfig",
  async ({ id, cloneData }) => {
    const res = await axios.post(
      `http://localhost:5000/api/rate-config/${id}/clone`,
      cloneData
    );
    return res.data;
  }
);

// 🔥 DELETE RATE CONFIG
export const deleteRateConfig = createAsyncThunk(
  "rateConfig/deleteRateConfig",
  async (id) => {
    await axios.delete(`http://localhost:5000/api/rate-config/${id}`);
    return id;
  }
);

const rateConfigSlice = createSlice({
  name: "rateConfig",
  initialState: {
    configs: [],
    pagination: {},
    stats: {},
    calculation: null,
    loading: false,
    calculating: false,
    creating: false,
    updating: false,
    cloning: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCalculation: (state) => {
      state.calculation = null;
    },
    resetState: (state) => {
      state.configs = [];
      state.pagination = {};
      state.stats = {};
      state.calculation = null;
      state.loading = false;
      state.calculating = false;
      state.creating = false;
      state.updating = false;
      state.cloning = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Rate Configs
    builder
      .addCase(fetchRateConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRateConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload.configs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRateConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Fetch Stats
      .addCase(fetchRateConfigStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

    // Calculate Rate
      .addCase(calculateRate.pending, (state) => {
        state.calculating = true;
        state.error = null;
      })
      .addCase(calculateRate.fulfilled, (state, action) => {
        state.calculating = false;
        state.calculation = action.payload;
      })
      .addCase(calculateRate.rejected, (state, action) => {
        state.calculating = false;
        state.error = action.error.message;
      })

    // Create Rate Config
      .addCase(createRateConfig.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createRateConfig.fulfilled, (state, action) => {
        state.creating = false;
        state.configs.unshift(action.payload);
      })
      .addCase(createRateConfig.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message;
      })

    // Update Rate Config
      .addCase(updateRateConfig.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateRateConfig.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.configs.findIndex(config => config._id === action.payload._id);
        if (index !== -1) {
          state.configs[index] = action.payload;
        }
      })
      .addCase(updateRateConfig.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Clone Rate Config
      .addCase(cloneRateConfig.pending, (state) => {
        state.cloning = true;
        state.error = null;
      })
      .addCase(cloneRateConfig.fulfilled, (state, action) => {
        state.cloning = false;
        state.configs.unshift(action.payload);
      })
      .addCase(cloneRateConfig.rejected, (state, action) => {
        state.cloning = false;
        state.error = action.error.message;
      })

    // Delete Rate Config
      .addCase(deleteRateConfig.fulfilled, (state, action) => {
        state.configs = state.configs.filter(config => config._id !== action.payload);
      });
  },
});

export const { clearError, clearCalculation, resetState } = rateConfigSlice.actions;
export default rateConfigSlice.reducer;
