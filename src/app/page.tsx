import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main application page.
  redirect('/shop-floor');
}
