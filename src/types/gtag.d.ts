declare global {
    interface Window {
        gtag: (command: string, action: string, options?: { [key: string]: string | number | undefined }) => void;
    }
}