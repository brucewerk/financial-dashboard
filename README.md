# Correções aplicadas — Financial Dashboard

## 1. O que estava causando os erros 500 em tudo

No log que você mandou, **toda** rota que toca o banco falha com 500 — `/api/finance/stats`,
`/api/finance/balances`, `/api/finance/investments`, `/api/finance/transactions` e
`POST /api/import/excel`. A rota `/api/test` (que não usa o banco) não aparece falhando.
Isso é a assinatura clássica de **conexão com o MongoDB Atlas quebrada**, não um bug de
lógica em cada endpoint separadamente.

Em `backend/server.js`, a conexão era aberta assim:

```js
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(...)
  .catch(...);
// as rotas já ficavam registradas, sem esperar a Promise acima resolver
```

Isso funciona num servidor tradicional (que fica de pé o tempo todo), mas em uma função
serverless da Vercel cada invocação pode não ter garantia de que essa conexão já terminou
de abrir. Com `bufferCommands` no padrão (`true`), o Mongoose "empilha" a query esperando a
conexão — e se a conexão nunca se estabelece (URI errada, IP da Vercel bloqueado no Atlas,
cluster pausado etc.), a requisição fica pendurada até estourar o timeout e todo mundo recebe
um 500 genérico, sem pista nenhuma do motivo real.

**Correção:** criei `backend/config/db.js`, que guarda a conexão em cache entre invocações e,
principalmente, é **aguardada antes de qualquer rota rodar** (novo middleware em `server.js`).
Se a conexão falhar, a resposta agora é um 503 com uma mensagem explicando exatamente o que
checar, em vez de um 500 mudo. Também adicionei `GET /api/health`, que só testa a conexão —
use-o primeiro depois do deploy para confirmar se o banco está OK.

### Depois de subir esta versão, faça isto primeiro:
Acesse `https://<seu-backend>.vercel.app/api/health`. Se dinner der `status: "degraded"`, o
campo `error` vai dizer exatamente qual das três coisas abaixo está errada:

1. **`MONGODB_URI` não está configurada** no projeto do backend na Vercel
   (Project Settings → Environment Variables — confirme que está no ambiente *Production*).
2. **Atlas bloqueando a Vercel** — em Atlas → Network Access, a Vercel usa IPs dinâmicos, então
   precisa liberar `0.0.0.0/0` (Allow access from anywhere).
3. **Cluster pausado** (planos gratuitos M0 pausam sozinhos após inatividade) — reative em Atlas.

Eu não tenho acesso às suas variáveis de ambiente nem ao painel do Atlas, então não dá pra
confirmar qual das três é de aqui — mas com o `/api/health` você descobre em segundos.

## 2. Bug real na importação: um ativo inteiro nunca era salvo

Comparei a lógica de `importController.js` linha a linha com o `FINANCAS_-_BruCe.xlsx` que
você mandou. As abas de ano (`2025`, `2026`) têm esta estrutura na coluna A:

```
BRUNO GOMES              <- cabeçalho
APARTAMENTO VILA EMA     <- 1º ativo
CARRO CIVIC 2016         <- 2º ativo
...
```

O código calculava `ativosStartRow = i + 2` (pulando 2 linhas após o cabeçalho), quando o
correto é `i + 1`. Isso fazia o **APARTAMENTO VILA EMA** (R$ 430.000) nunca virar um lançamento
de transação — o valor ficava de fora de qualquer gráfico ou relatório que liste ativos por
transação (o total geral batia porque vem de outra célula, mas o detalhamento por item, não).
Corrigido: agora a lista de ativos importados inclui o apartamento. Testei rodando a lógica
corrigida contra o seu arquivo real antes de te entregar — os 8 ativos e os 11 passivos de cada
ano batem certinho, e o total dos 17 investimentos da aba CARTEIRA soma exatamente
R$ 3.569.671,26, que é o mesmo valor da linha "TODAS AS CONTAS" da planilha.

Também endureci a leitura da aba CARTEIRA: o código antigo comparava o rótulo de fechamento da
seção "TODAS AS CONTAS" só com a coluna A, mas esse rótulo está na coluna B — na prática não
causava problema no seu arquivo atual (as linhas abaixo estão vazias), mas se um dia aquela
seção vier preenchida, o código antigo teria contado cada investimento em dobro. Agora ele
confere as duas colunas.

## 3. Robustez geral da importação

Antes, um erro em **qualquer** aba de ano derrubava a importação inteira com 500 e nada era
salvo — nem os anos que tinham processado certinho antes do erro. Agora cada aba de ano roda em
seu próprio `try/catch`: se uma aba tiver um problema, ela entra em `results.errors` e as demais
abas continuam sendo importadas. O mesmo vale para um arquivo `.xlsx` corrompido ou que não seja
Excel de verdade — agora retorna 400 com uma mensagem clara em vez de um 500 sem explicação.

## 4. `vercel.json` da raiz estava desatualizado

O `vercel.json` na raiz do repositório apontava para uma configuração antiga de deploy único
(`backend/server.js` + `frontend/dist` num projeto só), mas você já usa dois projetos Vercel
separados (`financial-backend-beta` e o do frontend) com a pasta `api/` fazendo o papel de
função serverless do backend. Troquei por uma versão mínima que só define o tempo máximo de
execução da função (`maxDuration: 30`, contra o padrão de 10s do plano Hobby) — útil se um dia
a planilha crescer bastante. Confirme no painel do projeto do **backend** que o "Root Directory"
está configurado como a raiz do repositório (vazio), e no do **frontend** que está como
`frontend`.

## Arquivos alterados

- `backend/config/db.js` — **novo**: conexão com cache, falha rápido, mensagens claras.
- `backend/server.js` — aguarda a conexão antes das rotas, adiciona `GET /api/health` e um
  handler de erro genérico.
- `backend/controllers/importController.js` — corrige o offset dos ativos, isola erros por aba,
  valida o arquivo antes de processar.
- `backend/.env.example` — **novo**: documenta as variáveis exigidas.
- `vercel.json` (raiz) — simplificado para o modelo atual de dois projetos.

## Como aplicar

1. Copie estes arquivos para o mesmo caminho no seu repositório local
   (`brucewerk/financial-dashboard`).
2. Confirme/ajuste `MONGODB_URI` e `JWT_SECRET` nas Environment Variables do projeto do
   **backend** na Vercel (veja `backend/.env.example`).
3. Confirme em Atlas → Network Access que `0.0.0.0/0` está liberado.
4. Commit + push — a Vercel faz o redeploy automaticamente.
5. Teste `GET https://<seu-backend>.vercel.app/api/health` primeiro.
6. Se `/api/health` estiver OK, teste o login e depois a importação do
   `FINANCAS_-_BruCe.xlsx` pelo dashboard.
