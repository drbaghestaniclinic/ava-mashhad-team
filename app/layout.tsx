import type { Metadata } from 'next';
import './globals.css';
import './visits.css';
export const metadata: Metadata = { title: 'آوا | دفتر بازدید مراکز مشهد', description: 'جست‌وجو و برنامه‌ریزی بازدید مراکز مشهد', icons: { icon: '/favicon.svg' } };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="fa" dir="rtl"><body>{children}</body></html>}
