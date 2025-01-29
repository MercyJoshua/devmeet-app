"use client"
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';
import { usePathname } from 'next/navigation';
import { Analytics } from "@vercel/analytics/react";
export default function RootLayout({ children }) {
  const pathname = usePathname();

  //Check if the current route includes "dashboard"
  const isDashboard = pathname.includes("/dashboard");

  return (
    <UserProvider>
    <html lang="en">
      <body>
        {/* Render Header and Footer only if not on the dashboard */}
        {!isDashboard && <Header />}
        <main>{children}</main>
        {!isDashboard && <Footer />}
        <Analytics />
      </body>
    </html>
    </UserProvider>
  );
}
