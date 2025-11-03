// ./src/app/profile/page.tsx
import { Metadata } from 'next';
import ProfileContent from '@/components/login/ProfileContent';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'This is the profile page.',
  robots: 'noindex, nofollow', // Prevent indexing of profile page
};

export default function ProfilePage() {
  return <ProfileContent />;
}