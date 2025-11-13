
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LessonsContent } from '@/components/lessons-content';

export default async function LessonsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LessonsContent />
    </div>
  );
}
