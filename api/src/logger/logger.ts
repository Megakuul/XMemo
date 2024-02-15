import { format } from "date-fns";

// This logger is not doing much, but it makes every log operation
// running over the functions below, which will potentially
// make it easier to control if it should be adjusted in the future.

/**
 * Formats information and logs it to stdout 
 */
export const LogInfo = (message: string, route: string = "") => {
    const formatMsg = 
        `[XMEMO INFORMATION]:\n` +
        `(${format(new Date(), 'dd.MM.yyyy - HH:mm:ss')})\n` +
        `${route?"{":""}${route}${route?"}\n":""}` +
        `${message}\n`;
    
    console.info(formatMsg);
}

/**
 * Formats warning and logs it to stderr 
 */
export const LogWarn = (message: string, route: string = "") => {
    const formatMsg = 
        `[XMEMO WARNING]:\n` +
        `(${format(new Date(), 'dd.MM.yyyy - HH:mm:ss')})\n` +
        `${route?"{":""}${route}${route?"}\n":""}` +
        `${message}\n`;

    console.error(formatMsg);
}

/**
 * Formats error and logs it to stderr 
 */
export const LogErr = (message: string, route: string = "") => {
    const formatMsg = 
        `[XMEMO ERROR]:\n` +
        `(${format(new Date(), 'dd.MM.yyyy - HH:mm:ss')})\n` +
        `${route?"{":""}${route}${route?"}\n":""}` +
        `${message}\n`;
    
    console.error(formatMsg);
}