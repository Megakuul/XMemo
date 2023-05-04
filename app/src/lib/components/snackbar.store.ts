import { writable } from "svelte/store";

export interface ISnackbar {
  visible: Boolean;
  message: String;
  color: String;
  delay: number;
}

const initialState: ISnackbar = {
  visible: false,
  message: "",
  color: "",
  delay: 3000,
};

export const SnackBar = writable<ISnackbar>(initialState);
