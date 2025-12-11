import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // This page is not used, redirect to the main operational page.
  redirect('/shop-floor');
}
