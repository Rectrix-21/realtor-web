import "./globals.css";
import { AuthProvider } from "../database/auth";

export const metadata = {
  title: "Havenly",
  description: "Realtor website for Havenly",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
