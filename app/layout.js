import "./globals.css";
import { AuthProvider } from "../database/auth";

export const metadata = {
  title: "Brick Development",
  description: "Realtor website for Brick Development",
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
