'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Trophy, PlayCircle, Users, BarChart3, Key, BookOpen, Volume2, Mic } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-slate-600">Gerencie o conteúdo do The Flow English Trainer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/lessons">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#1E40AF]">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-[#1E40AF] mb-2" />
              <CardTitle>Gerenciar Aulas</CardTitle>
              <CardDescription className="text-slate-600">Criar e editar aulas completas com vocabulário, listening e speaking</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1E40AF] text-white hover:bg-[#1e3a8a]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/challenges">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#DC2626]">
            <CardHeader>
              <Trophy className="h-10 w-10 text-[#DC2626] mb-2" />
              <CardTitle>Gerenciar Desafios</CardTitle>
              <CardDescription className="text-slate-600">Criar, editar e remover desafios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#DC2626] text-white hover:bg-[#b91c1c]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/videos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#DC2626]">
            <CardHeader>
              <PlayCircle className="h-10 w-10 text-[#DC2626] mb-2" />
              <CardTitle>Gerenciar Vídeos</CardTitle>
              <CardDescription className="text-slate-600">Adicionar e editar aulas em vídeo</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#DC2626] text-white hover:bg-[#b91c1c]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tokens">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#DC2626]">
            <CardHeader>
              <Key className="h-10 w-10 text-[#DC2626] mb-2" />
              <CardTitle>Tokens de Cadastro</CardTitle>
              <CardDescription className="text-slate-600">Gerar e gerenciar tokens de convite</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#DC2626] text-white hover:bg-[#b91c1c]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#DC2626]">
            <CardHeader>
              <Users className="h-10 w-10 text-[#DC2626] mb-2" />
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription className="text-slate-600">Visualizar e gerenciar usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#DC2626] text-white hover:bg-[#b91c1c]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/listening-exercises">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#1E40AF]">
            <CardHeader>
              <Volume2 className="h-10 w-10 text-[#1E40AF] mb-2" />
              <CardTitle>Exercícios de Listening</CardTitle>
              <CardDescription className="text-slate-600">Gerenciar exercícios de compreensão auditiva independentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1E40AF] text-white hover:bg-[#1e3a8a]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/speaking-exercises">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#DC2626]">
            <CardHeader>
              <Mic className="h-10 w-10 text-[#DC2626] mb-2" />
              <CardTitle>Exercícios de Speaking</CardTitle>
              <CardDescription className="text-slate-600">Gerenciar exercícios de prática oral independentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#DC2626] text-white hover:bg-[#b91c1c]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#1E40AF]">
            <CardHeader>
              <Settings className="h-10 w-10 text-[#1E40AF] mb-2" />
              <CardTitle>Configurações de API</CardTitle>
              <CardDescription className="text-slate-600">Configure serviços externos como Text-to-Speech</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1E40AF] text-white hover:bg-[#1e3a8a]">Acessar</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
