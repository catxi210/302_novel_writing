import { createStore } from "jotai";

export * from "./slices/config_store";
export * from "./slices/language_store";
export * from "./slices/user_store";
export * from "./slices/catalogue_store";

export const store = createStore();
