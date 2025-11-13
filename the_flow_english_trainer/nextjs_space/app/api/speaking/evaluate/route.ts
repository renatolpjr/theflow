
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { userResponse, correctAnswer, exerciseType, context } = body;

    if (!userResponse || !correctAnswer) {
      return NextResponse.json({ error: 'Resposta do usuário e resposta correta são obrigatórias' }, { status: 400 });
    }

    // Prepare the prompt for the LLM
    const systemPrompt = `Você é um professor de inglês americano experiente e especialista em pronúncia. Sua tarefa é avaliar a resposta falada de um aluno e fornecer feedback construtivo.

Analise a resposta do aluno considerando:
1. Correção gramatical
2. Escolha de vocabulário
3. Fluência e naturalidade
4. Pronúncia (baseado no texto transcrito)
5. Diferenças culturais na linguagem

Forneça feedback em português, sendo encorajador mas honesto sobre áreas de melhoria.`;

    const userPrompt = `
Contexto do exercício: ${context || 'Prática de speaking geral'}
Tipo de exercício: ${exerciseType || 'pronúncia'}

Resposta esperada: "${correctAnswer}"
Resposta do aluno: "${userResponse}"

Por favor, avalie a resposta do aluno e forneça:
1. Uma pontuação geral de 0 a 100
2. Análise detalhada da resposta
3. Pontos fortes identificados
4. Áreas que precisam de melhoria
5. Sugestões específicas de como melhorar
6. Erros de pronúncia potenciais (se aplicável)
7. Alternativas de vocabulário ou estrutura de frase (se aplicável)

Forneça o feedback em formato JSON com a seguinte estrutura:
{
  "score": 85,
  "isCorrect": true,
  "analysis": "Sua resposta foi...",
  "strengths": ["Boa estrutura gramatical", "Vocabulário adequado"],
  "improvements": ["Trabalhar na pronúncia de palavras com 'th'"],
  "suggestions": ["Pratique dizendo 'th' colocando a língua entre os dentes"],
  "pronunciationErrors": ["think -> tink", "there -> dere"],
  "vocabularyAlternatives": ["consider usar 'furthermore' em vez de 'also'"]
}

Responda apenas com o JSON, sem formatação adicional ou blocos de código.`;

    // Call the LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LLM API error:', error);
      return NextResponse.json({ error: 'Erro ao processar avaliação' }, { status: 500 });
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error('Error in speaking evaluation:', error);
    return NextResponse.json({ error: 'Erro ao avaliar resposta' }, { status: 500 });
  }
}
