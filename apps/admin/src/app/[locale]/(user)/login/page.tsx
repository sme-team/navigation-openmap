// ./src/app/login/page.tsx
import { Metadata } from 'next';
import LoginContent from '@/components/login/LoginContent';

export const metadata: Metadata = {
  title: 'Login | Your Blog Name',
  description: 'Sign in to access your account and personalized features.',
  robots: 'noindex, nofollow', // Prevent indexing of login page
};

export default function LoginPage() {
  return <LoginContent />;
}