# 💻 LogiTrack SOAP Client

Interface web para consumo de um serviço SOAP de gerenciamento de remessas.

Este projeto foi desenvolvido como parte de um desafio técnico e demonstra a integração entre um frontend moderno (Next.js) e um backend SOAP.

---

## 🧠 Tecnologias Utilizadas

* Next.js
* React
* TypeScript
* Fetch API
* API Routes (Next.js)
* XML parsing

---

## 🚀 Como executar o projeto

```bash
npm install
npm run dev
```

Acesse no navegador:

http://localhost:3000

---

## 🔗 Integração com SOAP

A comunicação com o backend SOAP é feita através de uma API Route:

```
/api/soap
```

---

## ⚙️ Arquitetura da comunicação

```
Frontend → API Route → SOAP Server → API Route → Frontend
```

### 🎯 Por que usar API Route?

* Evita problemas de CORS
* Centraliza a comunicação SOAP
* Mantém o frontend desacoplado do backend
* Facilita manutenção e evolução futura

---

## 📦 Funcionalidades

---

### 🟢 Criar Remessa

* Formulário com validação
* Envio de XML SOAP
* Exibição da resposta
* Exibição do XML enviado e recebido

---

### 🔵 Consultar Remessa

* Busca por ID
* Exibição completa dos dados
* Exibição do histórico de status
* Tratamento de erros (SOAP Fault)

---

### 🟡 Atualizar Status

* Alteração de status da remessa
* Atualização automática do histórico
* Feedback visual de sucesso/erro

---

### 🟣 Listar Remessas

* Paginação
* Filtro por status
* Atualização de status diretamente na listagem
* Exibição do total de registros

---

## 🔍 Debug XML (Diferencial)

A aplicação exibe:

### 📤 Request XML

```xml
<soap:Envelope>...</soap:Envelope>
```

### 📥 Response XML

```xml
<soap:Envelope>...</soap:Envelope>
```

👉 Isso permite visualizar exatamente como a comunicação SOAP está acontecendo.

---

## 🧱 Estrutura do Projeto

```
client/
├── app/
│   ├── page.tsx
│   └── api/
│       └── soap/
│           └── route.ts
│
├── components/
│   ├── shipment-form.tsx
│   ├── shipment-search.tsx
│   ├── shipment-list.tsx
│   └── xml-debug.tsx
│
├── lib/
│   ├── soap.ts
│   └── xml.ts
```

---

## ⚠️ Tratamento de Erros

A aplicação trata:

* SOAP Faults (ex: remessa não encontrada)
* Status inválido
* Erros de validação
* Falhas de rede
* XML inválido

---

## 🧠 Decisões Técnicas

* Uso de API Route como proxy para chamadas SOAP
* Separação de responsabilidades (components / lib)
* Tipagem forte com TypeScript
* UI simples focada em funcionalidade
* Debug XML visível (requisito do desafio)

---

## 📌 Observações

* Interface propositalmente simples
* Foco principal na integração SOAP
* Projeto preparado para evolução futura

---

## 🚀 Possíveis melhorias

* Melhorias de UI (Tailwind, design system)
* Autenticação de usuários
* Persistência de dados no frontend
* Cache de requisições
* Testes automatizados (Jest / Cypress)

---

## 🎯 Conclusão

Este projeto demonstra:

* Integração completa com serviços SOAP
* Manipulação de XML no frontend
* Arquitetura limpa e organizada
* Tratamento de erros e validações

👉 Atende todos os requisitos do desafio técnico.
