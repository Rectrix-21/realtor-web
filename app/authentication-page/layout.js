import "../globals.css";
import { AuthProvider } from '../../database/auth'; 
export const metadata = {
  title: "Sign Up",
  description: "Sign up for an account",
};

export default function RootLayout({ children }) {
  return (
    <div>
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}