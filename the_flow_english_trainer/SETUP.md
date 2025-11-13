
# The Flow English Trainer - Guia de Configuração e Funcionamento

## 📖 Visão Geral

The Flow English Trainer é uma plataforma completa de aprendizado de inglês americano com funcionalidades de listening, speaking, desafios, vídeos e gamificação.

## 🏗️ Arquitetura do Sistema

### Tecnologias Principais
- **Framework**: Next.js 14 (App Router)
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Armazenamento**: AWS S3 para arquivos de áudio
- **UI**: Shadcn/ui + Tailwind CSS
- **Serviços Externos**: Text-to-Speech (Google Cloud, OpenAI ou ElevenLabs)

### Estrutura de Diretórios
```
the_flow_english_trainer/
├── nextjs_space/
│   ├── app/
│   │   ├── (dashboard)/        # Páginas protegidas
│   │   │   ├── admin/          # Painel administrativo
│   │   │   ├── challenges/     # Desafios
│   │   │   ├── lessons/        # Aulas
│   │   │   ├── listening/      # Exercícios de listening
│   │   │   ├── speaking/       # Exercícios de speaking
│   │   │   └── videos/         # Vídeos educativos
│   │   ├── api/                # API Routes
│   │   └── auth/               # Login/Signup
│   ├── components/             # Componentes React
│   ├── lib/                    # Utilitários
│   ├── prisma/                 # Schema do banco de dados
│   └── public/                 # Arquivos estáticos
```

## 🚀 Instalação e Configuração Inicial

### 1. Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+
- Yarn (gerenciador de pacotes)
- Conta AWS (para S3)
- Conta Google Cloud, OpenAI ou ElevenLabs (para TTS)

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `nextjs_space/` com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui" # Gere com: openssl rand -base64 32

# AWS S3
AWS_BUCKET_NAME="seu-bucket-s3"
AWS_FOLDER_PREFIX="the-flow/"
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
AWS_REGION="us-east-1"

# Abacus AI (para análise de speaking)
ABACUSAI_API_KEY="sua-chave-abacus-ai"
```

### 3. Instalação de Dependências

```bash
cd nextjs_space
yarn install
```

### 4. Configuração do Banco de Dados

```bash
# Gerar o Prisma Client
yarn prisma generate

# Aplicar o schema ao banco de dados
yarn prisma db push

# Popular o banco com dados iniciais
yarn prisma db seed
```

### 5. Executar o Projeto

```bash
# Modo de desenvolvimento
yarn dev

# Modo de produção
yarn build
yarn start
```

O aplicativo estará disponível em `http://localhost:3000`

## 🔐 Sistema de Autenticação

### Tipos de Usuário
1. **Admin**: Acesso total ao painel administrativo
2. **User**: Acesso às funcionalidades de aprendizado

### Cadastro com Token
O sistema utiliza tokens de registro para controlar novos cadastros:

1. Admin gera tokens em `/admin/tokens`
2. Usuário utiliza o token na página de cadastro
3. Token é marcado como usado após o primeiro cadastro

### Contas Padrão (após seed)
- **Admin**: 
  - Email: `admin@theflow.com`
  - Senha: `admin123`
- **Usuário Teste**:
  - Email: `user@theflow.com`
  - Senha: `user123`

## 🎯 Funcionalidades Principais

### 1. Aulas (Lessons)
Aulas completas com:
- Vocabulário com traduções
- Exercícios de listening
- Exercícios de speaking
- Questionários de múltipla escolha

**Gerenciamento**: `/admin/lessons`

### 2. Exercícios de Listening
Exercícios independentes de compreensão auditiva:
- Upload ou geração de áudio via TTS
- Perguntas de múltipla escolha
- Sistema de pontuação
- Tracking de progresso

**Gerenciamento**: `/admin/listening-exercises`

### 3. Exercícios de Speaking
Prática de fala com:
- Gravação de áudio do usuário
- Transcrição automática
- Análise de feedback por IA
- Pontuação baseada em critérios

**Gerenciamento**: `/admin/speaking-exercises`

### 4. Desafios (Challenges)
Desafios gamificados:
- Diferentes tipos (vocabulário, gramática, listening)
- Sistema de recompensas
- Leaderboard
- Tempo limite

**Gerenciamento**: `/admin/challenges`

### 5. Vídeos Educativos
Aulas em vídeo:
- Integração com YouTube
- Transcrições
- Sistema de likes
- Tracking de progresso

**Gerenciamento**: `/admin/videos`

### 6. Sistema de Gamificação
- **Pontos**: Ganhos ao completar exercícios
- **Níveis**: Progressão automática baseada em pontos
- **Badges**: Conquistas especiais
- **Streak**: Dias consecutivos de estudo
- **Leaderboard**: Ranking de usuários

## ⚙️ Configuração de Serviços Externos

### Configurações de API

Acesse: `/admin/settings`

#### 1. Text-to-Speech (TTS)

O sistema suporta três serviços de TTS. Configure pelo menos um:

##### A) Google Cloud Text-to-Speech (Recomendado)

**Por que escolher**: 
- Plano gratuito generoso (1 milhão de caracteres/mês)
- Vozes naturais de alta qualidade
- Suporte a múltiplas vozes americanas

**Passo a passo**:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a API Text-to-Speech:
   - Navegue até "APIs & Services" > "Library"
   - Busque por "Cloud Text-to-Speech API"
   - Clique em "Enable"
4. Crie uma API Key:
   - Vá em "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
   - Copie a chave gerada
5. No app, vá em `/admin/settings`
6. Selecione "Google Cloud Text-to-Speech"
7. Cole sua API Key
8. (Opcional) Adicione o Project ID
9. Clique em "Salvar Configuração"

**Vozes disponíveis**:
- en-US-Neural2-A: Masculina
- en-US-Neural2-C: Feminina
- en-US-Neural2-D: Masculina
- E mais 6 opções

**Custo**: 
- Gratuito até 1M caracteres/mês
- $4.00 por 1M caracteres adicionais (Standard)
- $16.00 por 1M caracteres (WaveNet/Neural2)

##### B) OpenAI Text-to-Speech

**Por que escolher**:
- Integração simples
- Vozes expressivas
- Boa qualidade-preço

**Passo a passo**:

1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Clique em "Create new secret key"
5. Copie a chave (começa com `sk-`)
6. No app, vá em `/admin/settings`
7. Selecione "OpenAI Text-to-Speech"
8. Cole sua API Key
9. Clique em "Salvar Configuração"

**Vozes disponíveis**:
- alloy, echo, fable, onyx, nova, shimmer

**Custo**: 
- $15.00 por 1M caracteres (tts-1)
- $30.00 por 1M caracteres (tts-1-hd)

##### C) ElevenLabs

**Por que escolher**:
- Vozes ultra-realistas
- Melhor qualidade do mercado
- Controle fino de emoção

**Passo a passo**:

1. Acesse [ElevenLabs](https://elevenlabs.io)
2. Crie uma conta
3. Vá em "Profile" > "API Key"
4. Copie sua API Key
5. No app, vá em `/admin/settings`
6. Selecione "ElevenLabs"
7. Cole sua API Key
8. Clique em "Salvar Configuração"

**Vozes disponíveis**:
- Rachel, Antoni, Arnold, Adam, Sam

**Custo**:
- Plano gratuito: 10.000 caracteres/mês
- Starter ($5/mês): 30.000 caracteres
- Creator ($22/mês): 100.000 caracteres

### AWS S3 (Armazenamento de Áudio)

**Configuração obrigatória** para armazenar arquivos de áudio.

**Passo a passo**:

1. Acesse [AWS Console](https://aws.amazon.com/console)
2. Vá para o serviço S3
3. Crie um novo bucket:
   - Nome: `the-flow-english-trainer` (ou outro nome único)
   - Região: `us-east-1` (ou sua região preferida)
   - Desmarque "Block all public access" se quiser URLs públicas
4. Crie um usuário IAM:
   - Vá para IAM > Users > Add user
   - Habilite "Programmatic access"
   - Anexe a política `AmazonS3FullAccess`
   - Salve o Access Key ID e Secret Access Key
5. Configure as variáveis de ambiente no `.env`:
   ```env
   AWS_BUCKET_NAME="the-flow-english-trainer"
   AWS_FOLDER_PREFIX="audio/"
   AWS_ACCESS_KEY_ID="AKIA..."
   AWS_SECRET_ACCESS_KEY="..."
   AWS_REGION="us-east-1"
   ```

## 📝 Fluxo de Criação de Conteúdo

### Criar um Exercício de Listening

1. Acesse `/admin/listening-exercises`
2. Clique em "Novo Exercício"
3. Preencha:
   - Título
   - Descrição
   - Dificuldade (Beginner, Intermediate, Advanced)
   - Categoria (Daily Life, Business, Travel, etc.)
   - Texto para o áudio
4. **Gerar áudio**:
   - Opção 1: Clique em "Gerar com IA" (requer TTS configurado)
   - Opção 2: Faça upload de um arquivo MP3
5. Adicione perguntas:
   - Tipo: Múltipla escolha ou Verdadeiro/Falso
   - Pergunta
   - Opções de resposta
   - Resposta correta
6. Configure:
   - Nível requerido
   - Tags
   - Ordem de exibição
7. Clique em "Salvar"

### Criar um Exercício de Speaking

1. Acesse `/admin/speaking-exercises`
2. Clique em "Novo Exercício"
3. Preencha:
   - Título
   - Prompt (instrução para o usuário)
   - Contexto (situação para praticar)
   - Palavras-alvo (vocabulário a incluir)
   - Duração mínima/máxima
4. Configure dificuldade e categoria
5. Clique em "Salvar"

### Criar um Desafio

1. Acesse `/admin/challenges`
2. Clique em "Novo Desafio"
3. Preencha:
   - Título e descrição
   - Tipo (vocabulary, grammar, listening)
   - Dificuldade
   - Perguntas com respostas
   - Pontos e tempo limite
4. Configure datas de início/fim (opcional)
5. Clique em "Salvar"

## 🎨 Personalização

### Branding
O sistema utiliza cores personalizadas:
- Azul: `#1E40AF` (bandeira americana)
- Vermelho: `#DC2626` (bandeira americana)

Para alterar, edite:
- `nextjs_space/app/globals.css`
- `nextjs_space/tailwind.config.ts`

### Logos
Substitua os arquivos em:
- `nextjs_space/public/logo-new.jpeg`
- `nextjs_space/public/favicon.svg`

## 🔧 Manutenção

### Backup do Banco de Dados

```bash
# Backup
pg_dump -h host -U user -d database > backup.sql

# Restaurar
psql -h host -U user -d database < backup.sql
```

### Limpeza de Arquivos S3

Crie uma política de ciclo de vida no bucket S3 para remover arquivos antigos não utilizados.

### Logs

Monitore os logs em:
```bash
# Logs do Next.js
yarn dev

# Logs de produção
pm2 logs
```

## 🐛 Troubleshooting

### Erro: "Nenhum serviço de TTS configurado"

**Solução**: 
1. Vá em `/admin/settings`
2. Configure pelo menos um serviço TTS
3. Certifique-se que está marcado como "Ativo"

### Erro: "Failed to upload to S3"

**Solução**:
1. Verifique as credenciais AWS no `.env`
2. Confirme que o bucket existe
3. Verifique as permissões IAM do usuário

### Erro: "Cannot connect to database"

**Solução**:
1. Verifique a `DATABASE_URL` no `.env`
2. Confirme que o PostgreSQL está rodando
3. Teste a conexão: `yarn prisma db pull`

### Áudio não reproduz

**Solução**:
1. Verifique se o arquivo foi salvo no S3
2. Confirme as permissões do bucket (deve permitir leitura pública ou usar URLs assinadas)
3. Verifique os logs do navegador (F12 > Console)

## 📊 Monitoramento

### Métricas Importantes

1. **Usuários ativos**: Veja em `/admin/users`
2. **Taxa de conclusão**: Monitore em `/admin`
3. **Uso de TTS**: Verifique logs da API
4. **Armazenamento S3**: Monitore no AWS Console

### Performance

- Use caching para conteúdo estático
- Otimize imagens com Next.js Image
- Configure CDN para assets
- Use índices no Prisma para queries frequentes

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite** arquivos `.env`
2. **Rotacione** as API keys regularmente
3. **Use HTTPS** em produção
4. **Limite** tentativas de login
5. **Backup** regular do banco de dados
6. **Monitore** acessos suspeitos

### Permissões

- Apenas admins podem acessar `/admin/*`
- Tokens de registro controlam novos cadastros
- Sessões expiram após 30 dias
- Senhas são hasheadas com bcrypt

## 📚 Recursos Adicionais

### Documentação
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Shadcn/ui](https://ui.shadcn.com)

### Suporte
- Issues no GitHub
- Email: support@theflow.com
- Documentação interna

## 🎓 Treinamento de Usuários

### Para Administradores

1. Comece criando conteúdo básico (5-10 exercícios de cada tipo)
2. Configure o TTS antes de criar exercícios de listening
3. Teste cada funcionalidade como usuário antes de lançar
4. Monitore o feedback dos usuários

### Para Professores

1. Use desafios para engajar alunos
2. Crie aulas temáticas (viagens, negócios, etc.)
3. Varie a dificuldade do conteúdo
4. Incentive uso diário para manter streak

## 🚀 Próximos Passos

Após configurar o sistema:

1. ✅ Configure o serviço TTS em `/admin/settings`
2. ✅ Crie tokens de registro em `/admin/tokens`
3. ✅ Adicione conteúdo inicial (aulas, exercícios, vídeos)
4. ✅ Teste todas as funcionalidades com conta de usuário
5. ✅ Configure backups automáticos
6. ✅ Monitore o uso e ajuste conforme necessário

---

**Versão**: 1.0.0  
**Última atualização**: Novembro 2024  
**Desenvolvedor**: The Flow Team

Para suporte técnico, consulte a documentação ou entre em contato com o time de desenvolvimento.
