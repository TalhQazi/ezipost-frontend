import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 FETCH SETTINGS
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async ({ 
    search = "", 
    category = "", 
    isPublic = "",
    isEditable = ""
  }) => {
    const params = new URLSearchParams({
      search,
      category,
      isPublic,
      isEditable
    });
    
    const res = await axios.get(
      `http://localhost:5000/api/settings?${params}`
    );
    return res.data;
  }
);

// 🔥 FETCH SETTING CATEGORIES
export const fetchSettingCategories = createAsyncThunk(
  "settings/fetchSettingCategories",
  async () => {
    const res = await axios.get(
      "http://localhost:5000/api/settings/categories"
    );
    return res.data;
  }
);

// 🔥 GET SETTING BY KEY
export const getSettingByKey = createAsyncThunk(
  "settings/getSettingByKey",
  async ({ category, key }) => {
    const res = await axios.get(
      `http://localhost:5000/api/settings/${category}/${key}`
    );
    return res.data;
  }
);

// 🔥 CREATE/UPDATE SETTING
export const upsertSetting = createAsyncThunk(
  "settings/upsertSetting",
  async ({ category, key, settingData }) => {
    const res = await axios.post(
      `http://localhost:5000/api/settings/${category}/${key}`,
      settingData
    );
    return { category, key, data: res.data };
  }
);

// 🔥 UPDATE SETTING
export const updateSetting = createAsyncThunk(
  "settings/updateSetting",
  async ({ category, key, settingData }) => {
    const res = await axios.put(
      `http://localhost:5000/api/settings/${category}/${key}`,
      settingData
    );
    return { category, key, data: res.data };
  }
);

// 🔥 DELETE SETTING
export const deleteSetting = createAsyncThunk(
  "settings/deleteSetting",
  async ({ category, key }) => {
    await axios.delete(`http://localhost:5000/api/settings/${category}/${key}`);
    return { category, key };
  }
);

// 🔥 BULK UPDATE SETTINGS
export const bulkUpdateSettings = createAsyncThunk(
  "settings/bulkUpdateSettings",
  async (bulkData) => {
    const res = await axios.post(
      "http://localhost:5000/api/settings/bulk",
      bulkData
    );
    return res.data;
  }
);

// 🔥 EXPORT SETTINGS
export const exportSettings = createAsyncThunk(
  "settings/exportSettings",
  async ({ category = "", includePublic = "" } = {}) => {
    const params = new URLSearchParams({ category, includePublic });
    const res = await axios.get(
      `http://localhost:5000/api/settings/export?${params}`
    );
    return res.data;
  }
);

// 🔥 IMPORT SETTINGS
export const importSettings = createAsyncThunk(
  "settings/importSettings",
  async (importData) => {
    const res = await axios.post(
      "http://localhost:5000/api/settings/import",
      importData
    );
    return res.data;
  }
);

// 🔥 RESET SETTINGS
export const resetSettings = createAsyncThunk(
  "settings/resetSettings",
  async (resetData) => {
    const res = await axios.post(
      "http://localhost:5000/api/settings/reset",
      resetData
    );
    return res.data;
  }
);

// 🔥 VALIDATE SETTING
export const validateSetting = createAsyncThunk(
  "settings/validateSetting",
  async (validationData) => {
    const res = await axios.get(
      "http://localhost:5000/api/settings/validate",
      { params: validationData }
    );
    return res.data;
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: {},
    categories: [],
    loading: false,
    updating: false,
    bulkUpdating: false,
    exporting: false,
    importing: false,
    resetting: false,
    validating: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.settings = {};
      state.categories = [];
      state.loading = false;
      state.updating = false;
      state.bulkUpdating = false;
      state.exporting = false;
      state.importing = false;
      state.resetting = false;
      state.validating = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Fetch Categories
      .addCase(fetchSettingCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

    // Get Setting by Key
      .addCase(getSettingByKey.fulfilled, (state, action) => {
        const { category, key } = action.meta.arg;
        if (!state.settings[category]) {
          state.settings[category] = {};
        }
        state.settings[category][key] = action.payload;
      })

    // Upsert Setting
      .addCase(upsertSetting.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(upsertSetting.fulfilled, (state, action) => {
        state.updating = false;
        const { category, key, data } = action.payload;
        if (!state.settings[category]) {
          state.settings[category] = {};
        }
        state.settings[category][key] = data;
      })
      .addCase(upsertSetting.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Update Setting
      .addCase(updateSetting.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.updating = false;
        const { category, key, data } = action.payload;
        if (!state.settings[category]) {
          state.settings[category] = {};
        }
        state.settings[category][key] = data;
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      })

    // Delete Setting
      .addCase(deleteSetting.fulfilled, (state, action) => {
        const { category, key } = action.payload;
        if (state.settings[category]) {
          delete state.settings[category][key];
        }
      })

    // Bulk Update Settings
      .addCase(bulkUpdateSettings.pending, (state) => {
        state.bulkUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateSettings.fulfilled, (state) => {
        state.bulkUpdating = false;
        // Refresh settings after bulk update
        return state;
      })
      .addCase(bulkUpdateSettings.rejected, (state, action) => {
        state.bulkUpdating = false;
        state.error = action.error.message;
      })

    // Export Settings
      .addCase(exportSettings.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportSettings.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportSettings.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.error.message;
      })

    // Import Settings
      .addCase(importSettings.pending, (state) => {
        state.importing = true;
        state.error = null;
      })
      .addCase(importSettings.fulfilled, (state) => {
        state.importing = false;
        // Refresh settings after import
        return state;
      })
      .addCase(importSettings.rejected, (state, action) => {
        state.importing = false;
        state.error = action.error.message;
      })

    // Reset Settings
      .addCase(resetSettings.pending, (state) => {
        state.resetting = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state) => {
        state.resetting = false;
        // Refresh settings after reset
        return state;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.resetting = false;
        state.error = action.error.message;
      })

    // Validate Setting
      .addCase(validateSetting.pending, (state) => {
        state.validating = true;
        state.error = null;
      })
      .addCase(validateSetting.fulfilled, (state) => {
        state.validating = false;
      })
      .addCase(validateSetting.rejected, (state, action) => {
        state.validating = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, resetState } = settingsSlice.actions;
export default settingsSlice.reducer;
