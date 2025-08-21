import "./globals.css";
import { AuthProvider } from "../database/auth";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata = {
  title: "Havenly",
  description: "Realtor website for Havenly",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
