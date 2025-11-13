
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Key, Save, Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApiSetting {
  id: string;
  serviceName: string;
  apiKey: string;
  config: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SERVICE_TEMPLATES = {
  google_tts: {
    name: 'Google Cloud Text-to-Speech',
    description: 'Serviço de conversão de texto em áudio da Google Cloud',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'projectId', label: 'Project ID', type: 'text', required: false }
    ]
  },
  elevenlabs: {
    name: 'ElevenLabs',
    description: 'Serviço de Text-to-Speech com vozes naturais',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ]
  },
  openai_tts: {
    name: 'OpenAI Text-to-Speech',
    description: 'Serviço TTS da OpenAI',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ]
  }
};

export default function SettingsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [settings, setSettings] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    apiKey: '',
    config: {},
    isActive: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || []);
      } else if (response.status === 403) {
        toast.error('Acesso negado. Apenas administradores.');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.serviceName || !formData.apiKey) {
      toast.error('Nome do serviço e API Key são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Configuração salva com sucesso!');
        await fetchSettings();
        setEditingService(null);
        setFormData({
          serviceName: '',
          apiKey: '',
          config: {},
          isActive: true
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceName: string) => {
    if (!confirm(`Tem certeza que deseja excluir as configurações de ${serviceName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/settings/${serviceName}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Configuração excluída com sucesso!');
        await fetchSettings();
      } else {
        toast.error('Erro ao excluir configuração');
      }
    } catch (error) {
      console.error('Error deleting settings:', error);
      toast.error('Erro ao excluir configuração');
    }
  };

  const handleEdit = (setting: ApiSetting) => {
    setEditingService(setting.serviceName);
    setFormData({
      serviceName: setting.serviceName,
      apiKey: '', // Don't show the actual key
      config: setting.config || {},
      isActive: setting.isActive
    });
  };

  const handleNewService = (serviceType: string) => {
    setEditingService('new');
    setFormData({
      serviceName: serviceType,
      apiKey: '',
      config: {},
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
          Configurações de API
        </h1>
        <p className="text-slate-600">
          Configure os serviços externos necessários para o funcionamento completo do aplicativo
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-8 border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                Sobre as configurações de API
              </p>
              <p className="text-sm text-blue-700">
                As chaves de API são armazenadas de forma segura no banco de dados. Você precisará configurar pelo menos um serviço de Text-to-Speech (TTS) para gerar áudios para os exercícios de listening.
              </p>
              <p className="text-sm text-blue-700">
                <strong>Recomendado:</strong> Google Cloud Text-to-Speech (oferece plano gratuito generoso)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Settings */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {settings.map((setting) => (
          <Card key={setting.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                    <Key className="w-5 h-5" />
                    {SERVICE_TEMPLATES[setting.serviceName as keyof typeof SERVICE_TEMPLATES]?.name || setting.serviceName}
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-600">
                    {SERVICE_TEMPLATES[setting.serviceName as keyof typeof SERVICE_TEMPLATES]?.description || 'Serviço configurado'}
                  </CardDescription>
                </div>
                <Badge variant={setting.isActive ? 'default' : 'secondary'} className={setting.isActive ? 'bg-green-600 text-white' : 'bg-slate-400 text-white'}>
                  {setting.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-600 font-semibold">API Key</Label>
                  <p className="font-mono text-sm text-slate-900">{setting.apiKey}</p>
                </div>
                {setting.config && Object.keys(setting.config).length > 0 && (
                  <div>
                    <Label className="text-xs text-slate-600 font-semibold">Configuração</Label>
                    <pre className="text-xs bg-slate-100 text-slate-900 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(setting.config, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(setting)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(setting.serviceName)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingService ? 'Configurar Serviço' : 'Adicionar Novo Serviço'}
          </CardTitle>
          <CardDescription>
            {editingService 
              ? 'Configure ou atualize as credenciais do serviço'
              : 'Selecione um serviço para configurar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!editingService ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(SERVICE_TEMPLATES).map(([key, template]) => (
                <Card 
                  key={key}
                  className="border-2 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleNewService(key)}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2 text-slate-900">{template.name}</h3>
                    <p className="text-sm text-slate-600">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Serviço</Label>
                <Input
                  value={SERVICE_TEMPLATES[formData.serviceName as keyof typeof SERVICE_TEMPLATES]?.name || formData.serviceName}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label>API Key *</Label>
                <Input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Cole aqui sua API key..."
                />
              </div>

              {formData.serviceName === 'google_tts' && (
                <div>
                  <Label>Project ID (opcional)</Label>
                  <Input
                    value={(formData.config as any)?.projectId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, projectId: e.target.value }
                    })}
                    placeholder="ID do projeto Google Cloud"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Serviço ativo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configuração
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingService(null);
                    setFormData({
                      serviceName: '',
                      apiKey: '',
                      config: {},
                      isActive: true
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
