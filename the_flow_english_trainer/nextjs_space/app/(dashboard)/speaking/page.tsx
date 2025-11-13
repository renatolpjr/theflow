
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SpeakingPracticePage } from '@/components/speaking-practice-page';

export default async function SpeakingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <SpeakingPracticePage />;
}
