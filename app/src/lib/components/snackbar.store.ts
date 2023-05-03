export interface ISnackbar {
    visible: Boolean;
    message: String;
    color: String;
    delay: number;
}

/// Global SnackBar Object
/// Edit this element to influence the snackbar Component in every file
export let SnackBar: ISnackbar = {
    visible: false,
    message: "",
    color: "",
    delay: 3000
}