import "../globals.css";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard for managing the website",
};

export default function RootLayout({ children }) {
  return <div>{children}</div>;
}
