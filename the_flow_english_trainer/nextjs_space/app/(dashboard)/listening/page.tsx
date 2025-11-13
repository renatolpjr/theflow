
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ListeningPracticePage } from '@/components/listening-practice-page';

export default async function ListeningPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <ListeningPracticePage />;
}
