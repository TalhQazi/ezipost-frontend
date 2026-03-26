import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 API CALL
export const fetchMails = createAsyncThunk(
  "mail/fetchMails",
  async ({ search = "", status = "" }) => {
    const res = await axios.get(
      `http://localhost:5000/api/mails?search=${search}&status=${status}`
    );
    return res.data;
  }
);

const mailSlice = createSlice({
  name: "mail",
  initialState: {
    mails: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMails.fulfilled, (state, action) => {
        state.loading = false;
        state.mails = action.payload;
      })
      .addCase(fetchMails.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default mailSlice.reducer;