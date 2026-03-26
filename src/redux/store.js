import { configureStore } from "@reduxjs/toolkit";
import mailReducer from "./mailSlice";
import auditReducer from "./auditSlice";
import escrowReducer from "./escrowSlice";
import rateConfigReducer from "./rateConfigSlice";
import reportsReducer from "./reportsSlice";
import transactionsReducer from "./transactionsSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
    reducer: {
        mail: mailReducer,
        audit: auditReducer,
        escrow: escrowReducer,
        rateConfig: rateConfigReducer,
        reports: reportsReducer,
        transactions: transactionsReducer,
        settings: settingsReducer,
    }
})