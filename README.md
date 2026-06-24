# 💰 KLING KLANG - Financial Dashboard

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)

## 📊 Sobre o Projeto

O **KLING KLANG - Financial Dashboard** é uma aplicação web completa para gestão financeira pessoal, desenvolvida com as mais modernas tecnologias do mercado. Inspirada em planilhas de controle financeiro, a aplicação oferece uma experiência visual rica e interativa para acompanhamento de patrimônio, investimentos e despesas.

### 🎯 Principais Funcionalidades

- **📈 Dashboard Interativo** - Visualize seus indicadores financeiros em gráficos dinâmicos
- **📊 Evolução Patrimonial** - Acompanhe a evolução do seu patrimônio mês a mês
- **💼 Gestão de Investimentos** - Controle todos os seus ativos em um só lugar
- **📋 Transações Detalhadas** - Registre e categorize suas movimentações financeiras
- **📑 Relatórios Completos** - Gere relatórios profissionais em PDF
- **📤 Importação de Planilhas** - Importe dados diretamente de arquivos Excel
- **🌓 Dark/Light Mode** - Escolha o tema que melhor se adapta à sua preferência

### 🚀 Tecnologias Utilizadas

#### Backend
- **Node.js** + **Express** - API RESTful robusta
- **MongoDB Atlas** - Banco de dados cloud escalável
- **JWT** - Autenticação segura
- **Multer** + **XLSX** - Processamento de arquivos Excel

#### Frontend
- **React 18** + **Vite** - Interface moderna e performática
- **Material-UI (MUI)** - Componentes elegantes e responsivos
- **Recharts** - Gráficos interativos e dinâmicos
- **React Router DOM** - Navegação fluida entre páginas
- **jsPDF** + **html2canvas** - Exportação de relatórios em PDF

#### Deploy
- **Vercel** - Hospedagem moderna e escalável

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+
- MongoDB Atlas (ou local)
- Git

### Passos para rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/brucewerk/financial-dashboard.git
cd financial-dashboard

# 2. Instale as dependências do backend
cd backend
npm install

# 3. Instale as dependências do frontend
cd ../frontend
npm install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env na pasta backend com:
# MONGODB_URI=sua_uri_do_mongodb
# JWT_SECRET=sua_chave_secreta

# 5. Execute o seed para popular o banco com dados iniciais
cd ../backend
npm run create-user

# 6. Inicie o backend
npm run dev

# 7. Em outro terminal, inicie o frontend
cd ../frontend
npm run dev

# 8. Acesse http://localhost:5173
