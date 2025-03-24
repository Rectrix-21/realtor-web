import "./globals.css";

export const metadata = {
  title: "Brick Development",
  description: "Realtor website for Brick Development",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
