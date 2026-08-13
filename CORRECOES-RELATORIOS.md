# Correções desta rodada — Relatórios

## 1. Rolagem horizontal na tabela "Resumo de Investimentos"

O critério que decide entre cartão e tabela nas duas listas de dados de Relatórios estava em
600px (`isMobile`, `theme.breakpoints.down('sm')`) — o mesmo usado para os ajustes finos dos
gráficos da página. Criei uma variável separada, `isTableMobile`, em 900px
(`theme.breakpoints.down('md')`), e passei a usá-la só nessas duas tabelas — o mesmo critério já
usado em Investimentos e Transações. Isso garante cartões em qualquer largura real de celular,
com uma margem de segurança bem maior que os ajustes de gráfico (que continuam em 600px, sem
mudança de comportamento).

## 2. Ordem das seções

"Resumo de Investimentos" agora aparece antes de "Resumo de Transações" — tanto na tela quanto
no PDF exportado (troquei também a ordem das páginas geradas, renumerando os comentários
`PÁGINA 5/6` no código para refletir a nova ordem).

## Arquivos alterados

- `frontend/src/pages/Reports.jsx` — nova variável `isTableMobile`, ordem das duas seções
  invertida (tela e PDF).

## Um lembrete rápido

Ao clonar o repositório pra testar essa correção, o `backend/.env` real (com a senha do Mongo)
ainda estava commitado — o `.gitignore` tem `.env*`, mas isso só impede um arquivo NOVO de ser
rastreado; um arquivo que já estava no histórico do Git continua sendo versionado a cada `git add
.`, mesmo com o `.gitignore` certo. Pra parar de vez, roda uma vez:

```
git rm --cached backend/.env
git commit -m "para de versionar o .env"
```

(mantém o arquivo no seu disco, só remove do controle de versão daqui pra frente). Se ainda não
trocou a senha do Atlas desde a primeira vez que isso apareceu, vale fazer isso também.
