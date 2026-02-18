# QuizLab

**QuizLab** é uma plataforma interativa de quizzes educacionais desenvolvida como projeto de Hackathon para a pós-graduação em **Desenvolvimento Full-Stack** da **FIAP**.

A aplicação permite que professores criem e gerenciem quizzes para suas turmas, enquanto alunos respondem questões em tempo real e acompanham o ranking dos melhores desempenhos.

---

## 🚀 Tecnologias

### Frontend
| Tecnologia | Versão |
|---|---|
| [Angular](https://angular.dev) | 21.x |
| [Angular Material](https://material.angular.io) | 21.x |
| [Angular SSR](https://angular.dev/guide/ssr) | 21.x |
| TypeScript | 5.9.x |
| RxJS | 7.8.x |
| ngx-toastr | 20.x |

### Backend
O backend é uma API REST desenvolvida em **Node.js**. Repositório:

> 🔗 https://github.com/MelqSantos/QuizLab---Nodejs.git

---

## 📋 Pré-requisitos

Certifique-se de ter instalado na sua máquina:

- [Node.js](https://nodejs.org) `>= 20.x`
- [npm](https://www.npmjs.com) `>= 10.x`
- [Angular CLI](https://angular.dev/tools/cli) `>= 21.x`

```bash
npm install -g @angular/cli
```

---

## ⚙️ Como rodar o projeto

### 1. Clone o repositório

```bash
# Frontend
git clone <url-deste-repositório>
cd QuizLab

# Backend
git clone https://github.com/MelqSantos/QuizLab---Nodejs.git
cd QuizLab---Nodejs
```

### 2. Configure e inicie o backend

Siga as instruções do repositório do backend para instalar dependências e configurar variáveis de ambiente, depois inicie o servidor:

```bash
npm install
npm start
```

O backend deve estar rodando em `http://localhost:8080`.

### 3. Instale as dependências do frontend

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
ng serve
# ou
npm start
```

Acesse `http://localhost:4200` no navegador.

---

## 🏗️ Build para produção

```bash
ng build
```

Os artefatos serão gerados na pasta `dist/`.

### SSR (Server-Side Rendering)

```bash
npm run serve:ssr:QuizLab
```

---

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/   # Interceptor de autenticação
│   │   └── services/       # AuthService, QuizService
│   ├── pages/
│   │   ├── dashboard/      # Tela principal do professor/aluno
│   │   ├── login/          # Login e cadastro
│   │   ├── quiz/           # Gerenciamento e execução de quizzes
│   │   └── ranking/        # Ranking dos alunos por quiz
│   └── shared/
│       ├── components/     # Toolbar
│       └── services/       # ToasterService
└── assets/
```

---

## 👥 Funcionalidades

- **Professor**: criar quizzes, adicionar questões com alternativas, ativar/desativar quizzes e visualizar rankings
- **Aluno**: participar de quizzes, responder questões da e acompanhar o ranking

---

*Projeto desenvolvido para o Hackathon FIAP — Pós-Graduação Desenvolvimento Full-Stack.*
