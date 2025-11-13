'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, ArrowLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminTokensPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Form state
  const [tokenCount, setTokenCount] = useState(1);
  const [description, setDescription] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchTokens();
    }
  }, [status, router]);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/admin/tokens');
      if (response.status === 403) {
        toast.error('Acesso negado - Apenas administradores');
        router.push('/dashboard');
        return;
      }
      const data = await response.json();
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Erro ao carregar tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: tokenCount,
          description: description || undefined,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchTokens();
        setDialogOpen(false);
        setTokenCount(1);
        setDescription('');
        setExpiresInDays('');
      } else {
        toast.error('Erro ao gerar tokens');
      }
    } catch (error) {
      console.error('Error generating tokens:', error);
      toast.error('Erro ao gerar tokens');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este token?')) return;

    try {
      const response = await fetch(`/api/admin/tokens/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTokens(tokens.filter(t => t.id !== id));
        toast.success('Token excluído');
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      toast.error('Erro ao excluir token');
    }
  };

  const copyToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      toast.success('Token copiado para área de transferência');
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar token');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Tokens de Cadastro</CardTitle>
              <CardDescription className="mt-2">
                Gerencie os tokens de convite para novos cadastros
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Gerar Tokens
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tokens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Usado Por</TableHead>
                  <TableHead>Criado Em</TableHead>
                  <TableHead>Expira Em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-xs">
                          {token.token}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.token)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedToken === token.token ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{token.description || '-'}</TableCell>
                    <TableCell className="text-center">
                      {token.isUsed ? (
                        <Badge variant="secondary">Usado</Badge>
                      ) : token.expiresAt && new Date(token.expiresAt) < new Date() ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : (
                        <Badge className="bg-green-600">Disponível</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {token.usedBy || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(token.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {token.expiresAt ? formatDate(token.expiresAt) : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(token.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={token.isUsed}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Nenhum token encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Tokens Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Tokens de Cadastro</DialogTitle>
            <DialogDescription>
              Configure quantos tokens deseja gerar e suas propriedades
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Quantidade de Tokens</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={tokenCount}
                onChange={(e) => setTokenCount(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Tokens para turma de Janeiro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expira em (dias) - Opcional</Label>
              <Input
                id="expires"
                type="number"
                min="1"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="Deixe vazio para nunca expirar"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={generating}
            >
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
