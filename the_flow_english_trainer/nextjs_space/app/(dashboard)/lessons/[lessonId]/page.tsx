
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LessonContent } from '@/components/lesson-content';

interface PageProps {
  params: {
    lessonId: string;
  };
}

export default async function LessonPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <LessonContent lessonId={params.lessonId} />;
}
