# Movimento — Gestão de fisioterapia

Sistema web (PWA) para uma clínica de fisioterapia: pacientes, tipos de atendimento
com preço, agenda, atendimentos com status e relatórios por tipo com totais e
quantidades. Interface em português, pensada primeiro para o celular.

> 📘 **Manual do usuário:** veja [MANUAL.md](MANUAL.md) para o guia de uso do dia a
> dia (primeiro acesso, cadastros, agenda, relatórios e rotina da clínica).

## O que o sistema faz

- **Pacientes** — cadastro com contato, dados pessoais e observações clínicas;
  histórico completo, faturamento por paciente e desativação sem perder registros.
- **Tipos de atendimento** — procedimento, duração, cor e valor. O preço é copiado
  para cada atendimento no momento do registro, então reajustes não alteram o
  histórico.
- **Agenda** — visão semanal (segunda a domingo), navegação entre semanas e
  criação de atendimentos direto de cada dia.
- **Atendimentos** — registro com paciente, tipo, data/hora, valor e status:
  `Agendado`, `Realizado`, `Faltou` ou `Cancelado`. Filtros por período, paciente,
  tipo e status.
- **Relatórios** — agrupamento por tipo de atendimento com quantidade, valor médio,
  total e participação; resumo por status; exportação em **CSV** e **PDF** e
  impressão.
- **Painel** — agenda do dia, faturamento do mês, faltas, próximos horários e
  distribuição por tipo.
- **Configurações** — dados da clínica, perfil, troca de senha e orientações de
  instalação do PWA.

### Regras importantes

- Os relatórios financeiros consideram, por padrão, apenas atendimentos
  **realizados**. A contagem por status é sempre exibida separadamente.
- Pacientes e tipos de atendimento já usados em algum atendimento não podem ser
  excluídos — apenas desativados, para preservar o histórico.
- Login único, com sessão de 8 horas em cookie `httpOnly` e limite de tentativas.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4 e um kit de componentes próprio
- [Drizzle ORM](https://orm.drizzle.team) com Postgres
- **Neon** (`@neondatabase/serverless`) ou **Postgres padrão** (`postgres.js`) em
  produção e **PGlite** embutido no desenvolvimento — o mesmo schema, sem precisar
  instalar Postgres localmente
- Autenticação própria com JWT (`jose`) + `bcryptjs`
- `pdf-lib` para o PDF e geração manual de CSV

## Rodando localmente

Requisitos: **Node.js 20 ou superior** (recomendado 22/24).

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. Na primeira execução, o banco local é criado
automaticamente em `.pglite/`, junto com o usuário administrador e cinco tipos de
atendimento padrão.

### Acesso inicial

```
E-mail: fisio@movimento.app
Senha:  movimento123
```

Esses valores vêm de `ADMIN_EMAIL` e `ADMIN_PASSWORD` (arquivo `.env.local`).
**Troque a senha em Configurações** depois do primeiro acesso. A senha só é usada
para criar o usuário — mudanças posteriores no `.env` não alteram a senha já
salva.

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

| Variável          | Obrigatória | Descrição                                                       |
| ----------------- | ----------- | --------------------------------------------------------------- |
| `AUTH_SECRET`     | sim         | Segredo que assina a sessão. Use 32+ bytes aleatórios.           |
| `ADMIN_EMAIL`     | não         | E-mail do usuário criado no primeiro acesso.                     |
| `ADMIN_PASSWORD`  | não         | Senha do usuário criado no primeiro acesso.                      |
| `ADMIN_NAME`      | não         | Nome exibido do usuário inicial.                                 |
| `DATABASE_URL`    | produção    | Connection string do Postgres. Vazio = PGlite local.             |
| `DATABASE_URL_POOLED` | não     | Endpoint com pool, usado em produção quando existir.             |
| `PGLITE_DIR`      | não         | Pasta do banco local. Padrão: `.pglite`.                         |

O banco de produção pode ser Neon (`postgresql://...@ep-xxx.neon.tech/...`) ou
qualquer Postgres padrão, como o **Prisma Postgres** do Vercel Marketplace
(`postgres://...@db.prisma.io:5432/postgres?sslmode=require`). URLs do Neon usam
o driver HTTP; as demais usam conexão TCP via `postgres.js`.

Gerar um segredo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Scripts

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run start        # serve o build
npm run typecheck    # verifica os tipos
npm run db:seed      # dados de demonstração (só se não houver pacientes)
npm run db:seed -- --force  # adiciona os exemplos novamente
npm run db:reset     # apaga o banco local PGlite
node scripts/make-icons.mjs # regenera os ícones do PWA
```

Os dados de demonstração incluem 8 pacientes e cerca de 40 atendimentos
distribuídos entre as últimas semanas e os próximos dias, com todos os status.
O seed não roda automaticamente: é preciso chamá-lo.

## Publicando na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Importe o repositório na [Vercel](https://vercel.com). O framework é detectado
   automaticamente.
3. Provisione um Postgres:
   - **Prisma Postgres** (Marketplace, plano gratuito): em **Storage → Create
     Database → Prisma Postgres**, conecte ao projeto. As variáveis
     `DATABASE_URL` e `DATABASE_URL_POOLED` são injetadas automaticamente.
   - **Neon**: crie um projeto em [neon.tech](https://neon.tech), copie a
     connection string (com `?sslmode=require`) e defina `DATABASE_URL`.
4. Em **Settings → Environment Variables**, configure:
   - `DATABASE_URL` — connection string do Postgres
   - `AUTH_SECRET` — segredo forte
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — acesso inicial (opcional)
5. Faça o deploy. No primeiro acesso, as tabelas são criadas automaticamente e o
   usuário administrador é cadastrado.

Não é necessário rodar migrações: o schema é idempotente e criado na primeira
requisição. Para gerar os dados de demonstração em produção, rode o seed local
apontando `DATABASE_URL` para o banco:

```bash
# PowerShell
$env:DATABASE_URL="postgresql://..."
npm run db:seed
```

> Use os planos gratuitos para começar. O banco é acessado apenas pelo servidor,
> nunca direto pelo navegador.

## PWA

- `app/manifest.ts` define nome, cores, ícones e modo `standalone`.
- `public/sw.js` faz cache dos arquivos estáticos e de uma página offline. Não há
  escrita offline: salvar exige conexão.
- O service worker só é registrado em produção (`npm run build && npm run start`).
- Para instalar no celular, abra o site no navegador e use **Adicionar à tela de
  início** (Android) ou **Compartilhar → Adicionar à Tela de Início** (iOS).

## Estrutura

```
app/
  (app)/                # área autenticada (painel, agenda, atendimentos, ...)
  actions/              # server actions (auth, pacientes, tipos, atendimentos, config)
  api/relatorios/       # exportação CSV e PDF
  login/                # tela de acesso
  manifest.ts           # manifest do PWA
components/
  forms/                # formulários com useActionState
  layout/               # sidebar e navegação mobile
  report/               # botão de impressão
  ui/                   # kit de componentes
db/
  ddl.ts                # schema SQL idempotente
  schema.ts             # schema Drizzle
lib/
  auth.ts               # sessão JWT e controle de tentativas
  db.ts                 # conexão PGlite/Postgres e bootstrap
  queries.ts            # consultas de leitura
  report.ts             # agregação dos relatórios
  csv.ts / pdf.ts       # exportações
  time.ts               # fuso America/Sao_Paulo
scripts/                # seed, reset e geração de ícones
```

## Decisões técnicas

- **Valores em centavos** (`integer`) para evitar erro de arredondamento.
- **Snapshot de preço** em cada atendimento: o relatório reflete o que foi
  cobrado, não a tabela atual.
- **Fuso fixo** `America/Sao_Paulo` para agendamentos e datas de relatório.
- **Sem ORM no cliente**: todas as consultas passam pelo servidor.
- **PDF no servidor** com fontes padrão (Helvetica), independente de navegador.
- **CSV com BOM e `;`** para abrir corretamente no Excel em português.
