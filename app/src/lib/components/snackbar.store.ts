import { writable } from "svelte/store";

export interface ISnackbar {
  message: String | null;
  color: String;
  delay: number;
}

const initialState: ISnackbar = {
  message: null,
  color: "",
  delay: 2500,
};

export const SnackBar = writable<ISnackbar>(initialState);
