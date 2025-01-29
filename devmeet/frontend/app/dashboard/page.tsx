"use client";
import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(() => import('./layout'), {
  ssr: false,
});

export default function Dashboard() {
  return <DashboardLayout />;
}
