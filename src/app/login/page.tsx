import { redirect } from 'next/navigation';

export default function LoginPage() {
  // This page is no longer used. Redirect to the main application page.
  redirect('/shop-floor');
}
