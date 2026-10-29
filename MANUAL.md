# Manual de utilização — Movimento

Guia prático do sistema de gestão da clínica de fisioterapia. Escrito para quem usa
o sistema no dia a dia, não para quem programa.

> **Resumo em uma frase:** cadastre os tipos de atendimento, cadastre os pacientes,
> marque as sessões e mantenha o status de cada uma em dia — o faturamento e os
> relatórios saem prontos a partir disso.

---

## Sumário

1. [Primeiro acesso](#1-primeiro-acesso)
2. [Como navegar](#2-como-navegar)
3. [Painel](#3-painel)
4. [Tipos de atendimento](#4-tipos-de-atendimento)
5. [Pacientes](#5-pacientes)
6. [Atendimentos](#6-atendimentos)
7. [Agenda](#7-agenda)
8. [Relatórios](#8-relatórios)
9. [Configurações](#9-configurações)
10. [Instalar no celular](#10-instalar-no-celular)
11. [Regras que evitam erro no faturamento](#11-regras-que-evitam-erro-no-faturamento)
12. [Rotina sugerida](#12-rotina-sugerida)
13. [Problemas comuns](#13-problemas-comuns)

---

## 1. Primeiro acesso

1. Abra o endereço do sistema no navegador.
2. Informe **e-mail** e **senha** e clique em **Entrar**.
3. A sessão dura **8 horas**. Depois disso é preciso entrar novamente.

### Se ainda não existe nenhum usuário

Na primeira vez que o sistema é aberto sem nenhum usuário cadastrado, ele leva
automaticamente para a tela **Criar conta**, onde você define nome, e-mail e senha.
Depois desse primeiro cadastro, essa tela deixa de aparecer e todos entram por
**Entrar**.

### Trocar a senha

Vá em **Configurações → Senha de acesso**. Informe a senha atual, a nova senha
(mínimo 8 caracteres) e a confirmação.

> Troque a senha inicial no primeiro dia de uso. Não compartilhe o acesso: cada
> pessoa deve ter o seu.

### Esqueceu a senha?

Não existe recuperação automática por e-mail. Quem administra o sistema precisa
redefinir o acesso direto no banco de dados. Anote a senha em um gerenciador de
senhas da clínica.

---

## 2. Como navegar

**No computador** o menu fica na coluna escura à esquerda:

| Item | Para que serve |
| --- | --- |
| **Painel** | Resumo do dia e do mês |
| **Agenda** | Semana de segunda a domingo |
| **Atendimentos** | Todos os registros, com filtros |
| **Pacientes** | Cadastro e ficha de cada pessoa |
| **Tipos de atendimento** | Procedimentos, duração e preços |
| **Relatórios** | Faturamento por tipo, exportação |
| **Configurações** | Clínica, perfil, senha |

O botão **Novo atendimento**, no topo do menu, está sempre disponível — é o atalho
mais usado.

**No celular** o menu vira uma barra na parte de baixo da tela, com os mesmos itens.

O sistema é responsivo: as tabelas viram listas no celular, com as mesmas
informações.

---

## 3. Painel

É a primeira tela depois do login. Mostra:

- **Hoje** — quantos atendimentos estão marcados para o dia e quantos já foram
  realizados.
- **Realizados no mês** — total de sessões concluídas no mês corrente.
- **Faturamento no mês** — soma dos atendimentos **realizados** e o ticket médio.
- **Faltas no mês** — faltas e cancelamentos.
- **Agenda de hoje** — lista em ordem de horário. Em cada linha:
  - **Marcar como realizado** (✓) conclui a sessão em um clique;
  - o nome do paciente abre a ficha.
- **Próximos** — agendamentos a partir de amanhã.
- **Distribuição por tipo** — participação de cada procedimento no mês.

> O painel sempre mostra o **mês corrente**. Para outros períodos, use
> **Relatórios**.

---

## 4. Tipos de atendimento

Aqui ficam os procedimentos da clínica. O sistema já vem com cinco exemplos
(Avaliação inicial, Sessão de fisioterapia, Pilates clínico, RPG e Liberação
miofascial) — ajuste os valores e nomes conforme a sua realidade.

### Cadastrar um tipo

**Tipos de atendimento → Novo tipo**:

| Campo | O que preencher |
| --- | --- |
| **Nome do atendimento** | Ex.: Sessão de fisioterapia |
| **Valor por atendimento** | Preço em reais, ex.: `160,00` |
| **Duração** | Em minutos, entre 5 e 480 |
| **Descrição** | Opcional, aparece só no cadastro |
| **Cor de identificação** | Usada nos gráficos e na agenda |
| **Disponível para novos atendimentos** | Desmarque para esconder das novas marcações |

### Editar, desativar e excluir

- **Editar** — abre o formulário do tipo.
- **Desativar** — o tipo sai das opções de **novos** atendimentos, mas continua
  aparecendo no histórico e nos relatórios. É o caminho certo quando você para de
  oferecer um procedimento.
- **Excluir** — só aparece quando o tipo **nunca** foi usado. Se já houver
  atendimento vinculado, o sistema bloqueia e pede para desativar.

### O preço é copiado, não vinculado

Cada atendimento guarda o valor cobrado **na hora do registro**. Se você reajustar
a tabela depois, os relatórios antigos continuam com o valor da época. Isso é
intencional: o relatório reflete o que foi cobrado, não o preço atual.

---

## 5. Pacientes

### Cadastrar

**Pacientes → Novo paciente**:

| Campo | Obrigatório | Observação |
| --- | --- | --- |
| **Nome completo** | sim | mínimo 3 caracteres |
| **Telefone / WhatsApp** | sim | mínimo 8 dígitos |
| **E-mail** | não | validado quando preenchido |
| **Data de nascimento** | não | a idade aparece na ficha |
| **CPF** | não | |
| **Endereço** | não | |
| **Observações clínicas** | não | alergias, condições, preferências de horário |

### Encontrar um paciente

Na lista de pacientes, use a busca por **nome ou telefone** e o filtro de
**situação** (Todos / Ativos / Inativos). A lista mostra quantidade de atendimentos,
data do último realizado e situação.

### Ficha do paciente

Clicando no nome, você abre a ficha com:

- **Indicadores** — atendimentos realizados, total faturado no histórico, data do
  último realizado e quantos estão agendados.
- **Histórico de atendimentos** — todos os registros, com status e valor.
- **Ficha** — contato, nascimento, CPF, endereço e observações.
- **Por tipo de atendimento** — quantas sessões de cada tipo e quanto somaram
  (apenas realizados).
- **Cadastro** — desativar/reativar e excluir.

Atalhos úteis: **Novo atendimento** já abre o formulário com este paciente
selecionado.

### Desativar em vez de excluir

Pacientes com histórico **não podem ser excluídos**. Use **Desativar cadastro**:

- sai das listas de novos agendamentos;
- mantém todo o histórico, valores e relatórios;
- pode ser reativado a qualquer momento.

A exclusão definitiva só aparece para pacientes sem nenhum atendimento.

---

## 6. Atendimentos

É o coração do sistema. Cada sessão marcada é um **atendimento**.

### Registrar um novo atendimento

**Novo atendimento** (menu lateral, painel ou ficha do paciente):

| Campo | Como preencher |
| --- | --- |
| **Paciente** | escolha na lista; inativos aparecem marcados |
| **Tipo de atendimento** | ao escolher, o **valor** é preenchido automaticamente |
| **Valor** | pode ser alterado só neste atendimento (desconto, acréscimo) |
| **Data e horário** | o sistema sugere o próximo horário livre; mostra a hora de término |
| **Status** | Agendado, Realizado, Faltou ou Cancelado |
| **Observações** | evolução, orientações, forma de pagamento |

Clique em **Registrar atendimento**.

> Alterar o valor aqui **não** muda o preço de tabela do tipo de atendimento.

### Os quatro status

| Status | Quando usar | Entra no faturamento? |
| --- | --- | --- |
| **Agendado** | sessão futura, ainda vai acontecer | não |
| **Realizado** | o paciente compareceu e foi atendido | **sim** |
| **Faltou** | não compareceu e não avisou | não |
| **Cancelado** | avisou antes ou foi desmarcado | não |

Manter o status correto é o que garante um relatório confiável. Uma sessão que
ficou como *Agendado* depois do dia não entra em nenhum total.

### Concluir em um clique

Nas listas (painel, agenda, atendimentos) há o botão **Concluir** /
**Marcar como realizado** nas sessões agendadas. Use no fim do dia, com a lista de
hoje na tela.

### Filtrar a lista

No topo de **Atendimentos**:

- **De / Até** — período (o padrão é o mês corrente);
- **Status** — um status específico ou todos;
- **Paciente** — histórico individual;
- **Tipo** — todas as sessões de um procedimento.

O rodapé do filtro mostra quantos registros existem, quantos foram realizados e
quanto isso soma em reais.

### Editar e excluir

O ícone de lápis abre o atendimento. Lá é possível mudar qualquer campo ou usar
**Excluir atendimento** — a exclusão remove o registro dos relatórios e não pode ser
desfeita. Para desmarcar sem perder o histórico, prefira mudar o status para
**Cancelado**.

---

## 7. Agenda

Visão semanal, de **segunda a domingo**.

- **◀ / ▶** navegam entre semanas; **Hoje** volta para a semana atual.
- O dia de hoje aparece destacado.
- Cada cartão mostra horário, paciente e tipo, com um ponto colorido do status.
- Clicar em qualquer atendimento abre a edição.

No computador você vê as sete colunas lado a lado; no celular, um bloco por dia.

> A agenda não bloqueia horários: dois atendimentos no mesmo horário são permitidos.
> O controle de conflito é visual.

---

## 8. Relatórios

**Relatórios** responde à pergunta “quanto faturei e de onde veio esse valor”.

### Filtros

| Filtro | Padrão |
| --- | --- |
| **De / Até** | primeiro e último dia do mês atual |
| **Paciente** | todos |
| **Tipo** | todos |
| **Status** | **Realizado** |

O link **Mês atual** restaura o período padrão.

> O filtro de status muda os valores. Com **Realizado** (padrão), você vê o
> faturamento efetivo. Com **Todos os status**, os totais incluem sessões que não
> geraram receita.

### Indicadores

- **Atendimentos no filtro** — quantidade e status considerado.
- **Total faturado** — soma dos valores do filtro.
- **Valor médio por sessão**.
- **Faltas no período** — faltas e cancelamentos.

### Tabela por tipo de atendimento

Para cada tipo: **quantidade**, **valor médio**, **total** e **participação (%)**
no faturamento, com uma linha de **total geral**.

Abaixo aparecem:

- **Distribuição por faturamento** — barras comparando os tipos;
- **Atendimentos por status** — quantos agendados, realizados, faltas e
  cancelamentos no período (independente do filtro de status).

### Exportar

- **CSV** — abre no Excel (separador `;` e acentuação correta).
- **PDF** — documento pronto para enviar ou arquivar.
- **Imprimir** — usa a impressão do navegador; o layout é limpo, sem menus.

A exportação respeita exatamente os filtros aplicados na tela.

---

## 9. Configurações

### Dados da clínica

**Nome da clínica**, **nome do profissional**, **telefone** e **endereço**. O nome
da clínica aparece no menu e nos relatórios exportados.

### Seu perfil

Nome exibido no sistema e e-mail de acesso. Ao trocar o e-mail, use o novo no
próximo login.

### Senha de acesso

Já descrito no [primeiro acesso](#trocar-a-senha).

### Sessão

Mostra o usuário conectado e o botão **Sair do sistema**.

---

## 10. Instalar no celular

O sistema é um PWA: pode ser instalado na tela de início e abre em tela cheia, como
um aplicativo.

- **Android (Chrome):** menu ⋮ → **Adicionar à tela de início**.
- **iPhone (Safari):** botão **Compartilhar** → **Adicionar à Tela de Início**.

Depois de instalado, o ícone **Movimento** aparece junto aos outros apps.

**Sobre internet:** as telas já carregadas continuam visíveis sem conexão, mas
**salvar exige internet**. Não há registro offline.

---

## 11. Regras que evitam erro no faturamento

1. **Só “Realizado” fatura.** Sessões agendadas, faltas e cancelamentos não entram
   nos totais financeiros.
2. **Feche o dia.** No fim do expediente, marque cada sessão de hoje como
   Realizado, Faltou ou Cancelado. É o que mantém o painel e os relatórios corretos.
3. **Não exclua, desative.** Pacientes e tipos com histórico não podem ser
   excluídos — e nem devem. Desativar preserva os números do passado.
4. **O preço é histórico.** Reajustar a tabela não altera atendimentos antigos.
5. **Desconto é no atendimento.** Se o valor cobrado for diferente da tabela,
   ajuste no campo **Valor** do atendimento, não no cadastro do tipo.
6. **Confira o período.** Antes de exportar, verifique **De / Até** e **Status** —
   é o erro mais comum em relatório.

---

## 12. Rotina sugerida

**Todo dia**

- Abrir o **Painel** e conferir a agenda de hoje.
- Ao fim de cada sessão (ou no fim do dia), marcar o status correto.
- Registrar as observações clínicas relevantes no atendimento.

**Toda semana**

- Revisar a **Agenda** da semana seguinte e confirmar horários.
- Cadastrar novos pacientes que chegaram por indicação.
- Verificar se algum atendimento passado ficou como **Agendado**.

**Todo mês**

- Abrir **Relatórios**, conferir o mês fechado com status **Realizado**.
- Exportar **PDF** para arquivo e **CSV** para a planilha financeira.
- Revisar os **Tipos de atendimento** e ajustar preços para o mês seguinte.
- Trocar a senha periodicamente.

---

## 13. Problemas comuns

**“E-mail ou senha não conferem.”**
Confira maiúsculas/minúsculas da senha. O e-mail não diferencia maiúsculas.
Após **5 tentativas erradas** o acesso fica bloqueado por 15 minutos.

**“Este tipo já foi usado em atendimentos e não pode ser excluído.”**
Correto: use **Desativar**. O histórico precisa da referência ao tipo.

**“Não é possível excluir: este paciente já possui atendimentos.”**
Use **Desativar cadastro**. Para excluir de fato, seria preciso apagar todo o
histórico — o que normalmente não é desejado.

**O total do relatório não bate com o esperado.**
Verifique, nesta ordem: o período (**De / Até**), o **Status** (provavelmente está em
*Realizado*) e os filtros de paciente e tipo.

**O valor de um atendimento antigo está diferente da tabela.**
É o comportamento esperado: o valor foi copiado no momento do registro.

**A sessão não aparece no faturamento do mês.**
Provavelmente está como **Agendado**, **Faltou** ou **Cancelado**, ou a data está
fora do mês. Abra o atendimento e ajuste.

**O app instalado mostra uma tela antiga.**
Feche e abra novamente. Em último caso, desinstale e instale de novo pela tela de
início.

**Não consigo salvar e a internet parece ok.**
Teste recarregar a página. Se o erro continuar, avise quem administra o sistema: pode
ser indisponibilidade do banco de dados.
