// ./src/app/register/page.tsx
import { Metadata } from 'next';
import RegisterContent from '@/components/login/RegisterContent';

export const metadata: Metadata = {
  title: 'Register | Your Blog Name',
  description: 'Create a new account to join our community and access exclusive features.',
  robots: 'noindex, nofollow', // Prevent indexing of register page
};

export default function RegisterPage() {
  return <RegisterContent />;
}