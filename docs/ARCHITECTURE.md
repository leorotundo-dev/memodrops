# Arquitetura Completa do MemoDrops

O MemoDrops é uma plataforma de aprendizado adaptativo baseada em microlições geradas por IA (“Drops”), que transforma editais de concursos e conteúdos educacionais em planos de estudo personalizados.

---

## 1. Visão Geral (Top-Down)

Componentes principais:

- **🕸️ Harvester Layer** – Coleta de dados (editais, matérias, artigos, provas).
- **🧩 Extractor Layer (OpenAI)** – Interpreta e estrutura os editais (Blueprint).
- **⚙️ Processing Layer** – Aplica regras de prioridade, personalização e geração.
- **🧠 Learning Engine (OpenAI + RAG)** – Gera Drops e controla trilhas pedagógicas.
- **📊 Analytics & QA Layer** – Avalia qualidade, custo e performance.
- **🎓 User Layer** – Experiência do aluno, plano diário e progressão adaptativa.

---

## 2. Fluxo de Dados (End-to-End)

1. **Harvest**
   - **Fonte:** Sites de concursos e bancas  
   - **Ferramenta:** Scrapers / Adapters  
   - **Saída:** HTML bruto  
   - **Tabela:** `harvest_items`

2. **Extraction**
   - **Fonte:** Texto do edital  
   - **Ferramenta:** OpenAI (`extractExamStructure`)  
   - **Saída:** JSON estruturado (banca, disciplinas, tópicos, prioridades)  
   - **Tabela:** `exam_blueprints`

3. **Gold Rule**
   - **Fonte:** Blueprint  
   - **Ferramenta:** Motor interno  
   - **Saída:** Pesos e ordem de prioridade por tópico  
   - **Tabelas:** `exam_blueprints`, `drop_cache`

4. **Generation**
   - **Fonte:** Tópicos + RAG Blocks  
   - **Ferramenta:** OpenAI (`drop-generator`)  
   - **Saída:** Drops (microlições)  
   - **Tabela:** `drops`

5. **QA & Review**
   - **Fonte:** Drops gerados  
   - **Ferramenta:** Heurístico + IA  
   - **Saída:** Validação, custo, métricas  
   - **Tabelas:** `qa_reviews`, `metrics_daily`

6. **Personalização**
   - **Fonte:** Histórico do aluno  
   - **Ferramenta:** `user_stats` + `reweightUserPriorities`  
   - **Saída:** Ajuste dinâmico de prioridades  
   - **Tabela:** `user_stats`

7. **Learning Plan**
   - **Fonte:** Dados personalizados  
   - **Ferramenta:** job `daily-plan`  
   - **Saída:** Lista diária de Drops  
   - **Endpoint:** `/admin/plan/daily`

8. **Feedback Loop**
   - **Fonte:** Respostas do aluno  
   - **Ferramenta:** rota `learn/log`  
   - **Saída:** Atualiza acertos, espaçamento, streak  
   - **Tabelas:** `user_stats`, `drops`

---

## 3. Estrutura Técnica (Camadas do Sistema)

### 🕸️ Camada 1 – Harvester Layer

- **Função:** Coletar novos editais e textos educacionais.  
- **Tecnologia:** Node + Cheerio + Axios.  
- **Arquivos:** `src/adapters/*.ts`, `sources.json`.  
- **Banco:** `harvest_items`.  
- **Execução:** via cron (`.github/workflows/harvest_process.yml`).

### 🧩 Camada 2 – Extractor Layer (OpenAI)

- **Função:** Transformar HTML dos editais em um JSON de estudo (Blueprint).  
- **Arquivo:** `ai/extractExamStructure.ts`.  
- **Prompt:** `ai/prompt/extractExamStructure.prompt.txt`.  
- **Modelo:** `gpt-4o-mini`.  
- **Saída:** `exam_blueprints`.

### ⚙️ Camada 3 – Processing / Gold Rule

- **Função:** Aplicar pesos e limites de geração (`PRIORITY_THRESHOLD`, softmax).  
- **Arquivo:** `jobs/drop-generator.ts`.  
- **Controle de cache:** `lib/hash.ts`, tabela `drop_cache`.  
- **Parâmetros:** definidos em `config/goldRule.ts`.

### 🧠 Camada 4 – Learning Engine

- **Função:** Gerar conteúdo didático (“Drops”).  
- **Prompt:** `ai/prompt/drop_batch.prompt.txt`.  
- **Contexto:** consulta `rag_blocks` (banco de blocos RAG).  
- **Saída:** JSON `{ drops: [...] }`.  
- **Modelo:** `gpt-4o-mini`.  
- **Embeddings:** `text-embedding-3-small` (para RAG opcional).

### 📚 Camada 5 – RAG Feeder (opcional)

- **Função:** Enriquecer `rag_blocks` com textos resumidos de sites educacionais.  
- **Fontes:** Brasil Escola, Toda Matéria, InfoEscola, Direção Concursos.  
- **Prompt:** `ai/prompt/summarizeRAG.prompt.txt`.  
- **Resultado:** textos curtos categorizados (disciplina/tópico/banca).

### 📊 Camada 6 – QA & Métricas

- **Função:** Checar Drops e custos.  
- **Arquivos:** `qa_metrics/qa.ts`, `routes/qa-metrics.ts`.  
- **Banco:** `qa_reviews`, `metrics_daily`.  
- **Extras:** `QA_SAMPLE_RATE`, `TOKEN_COST_INPUT/OUTPUT`.

### 🎯 Camada 7 – Personalização & Planejamento

- **Função:** Ajustar prioridades por aluno.  
- **Arquivo:** `personalization/engine.ts`.  
- **Banco:** `user_stats`.  
- **Lógica:** erro ↑, hábito ↓, espaçamento adaptativo.  
- **Saída:** plano diário personalizado (`jobs/daily-plan.ts`).

### 🎓 Camada 8 – Pedagogia / UX Layer

- **Função:** Definir a jornada de aprendizado e UX.  
- **Camadas cognitivas:** `remember → understand → apply → analyze`.  
- **Tipos de Drop:** fundamento, regra/exceção, pattern banca, mini-questão, comparativo, revisão.  
- **Banco:** `drops.drop_text` com metadados pedagógicos.  
- **Rotas UX:** `/admin/plan/daily`, `/admin/learn/log`.

---

## 4. Estrutura do Banco (Resumo)

| Tabela          | Finalidade                     | Origem          |
|----------------|---------------------------------|-----------------|
| `harvest_items`| HTMLs coletados                | Harvest Layer   |
| `exam_blueprints` | Estrutura dos editais       | Extractor Layer |
| `drop_cache`   | Cache de versões               | Generator       |
| `drops`        | Drops gerados                  | Generator       |
| `rag_blocks`   | Blocos de conhecimento base    | RAG Feeder      |
| `qa_reviews`   | Validação e métricas           | QA Layer        |
| `metrics_daily`| Estatísticas agregadas         | QA Layer        |
| `user_stats`   | Dados de aprendizagem          | Personalização  |
| `topic_prereqs`| Pré-requisitos entre tópicos   | Pedagogia       |
| `exam_logs` (futuro) | Histórico de tentativas  | UX/Analytics    |

---

## 5. Modelos e APIs Externas

| API             | Função                        | Modelo                 | Custo aproximado              |
|-----------------|-------------------------------|------------------------|--------------------------------|
| OpenAI API      | Extração e geração de conteúdo| `gpt-4o-mini`         | ~US$ 0,15 / 1k drops          |
| Embeddings API  | Criação de vetores RAG        | `text-embedding-3-small` | ~US$ 0,02 / 1k blocos      |
| Supabase / Postgres | Armazenamento de dados    | -                      | incluído no Railway           |
| Railway API     | Deploy / Env vars             | -                      | gratuito                      |
| GitHub Actions  | Agendamento de jobs           | -                      | gratuito                      |

---

## 6. Fluxo Pedagógico Simplificado

```mermaid
graph TD
  A[Edital HTML] -->|Extractor (OpenAI)| B[Blueprint JSON]
  B -->|Gold Rule| C[Tópicos priorizados]
  C -->|Generator (OpenAI)| D[Drops gerados]
  D -->|QA + RAG| E[Publicação segura]
  E -->|Personalização| F[Plano Diário]
  F -->|Aluno interage| G[User Stats + Spaced Repetition]
  G -->|Feedback| C
```

---

## 7. Estratégia de Evolução

| Fase  | Objetivo                      | Entrega                             |
|-------|------------------------------|-------------------------------------|
| Fase 1| Infra e Geração Base         | Harvest + Extractor + Generator     |
| Fase 2| Personalização + QA          | User stats + métrica                |
| Fase 3| RAG Feeder                   | Fontes educacionais externas        |
| Fase 4| UX e Trilhas adaptativas     | Plano diário e gamificação          |
| Fase 5| Analytics e IA Docente       | Dashboard + tutor virtual           |

---

Este documento consolida a visão de arquitetura do MemoDrops para desenvolvedores, produto e pedagogia.
