'use client';

import { usePathname } from 'next/navigation';
import GooglePayScript from './GooglePayScript';

export default function ConditionalGooglePayScript() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return <GooglePayScript />;
}
