# 🚚 LogiTrack SOAP Server

Implementação de um serviço SOAP para gerenciamento de remessas, desenvolvido como parte de um desafio técnico.

---

## 🧠 Tecnologias Utilizadas

* Node.js
* NestJS
* TypeScript
* node-soap (implementação SOAP)
* HTTP (native Node)

---

## 🚀 Como executar o projeto

```bash
npm install
npm run start:dev
```

---

## 🌐 Endpoints

### 🔗 SOAP Endpoint

http://localhost:3001/shipment

### 📄 WSDL

http://localhost:3001/shipment?wsdl

---

## 🧪 Como testar (Insomnia / Postman)

* Método: **POST**
* URL: `http://localhost:3001/shipment`
* Header:

  ```
  Content-Type: text/xml
  ```

---

# 📦 Operações SOAP

---

## 🟢 Criar Remessa

### Request

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <criarRemessa>
      <clienteId>CLI-001</clienteId>
      <origem>São Paulo</origem>
      <destino>Recife</destino>
      <pesoKg>10</pesoKg>
      <descricao>Produtos eletrônicos</descricao>
    </criarRemessa>
  </soap:Body>
</soap:Envelope>
```

### Response

```xml
<criarRemessaResponse>
  <remessaId>REM-123456</remessaId>
  <status>AGUARDANDO</status>
  <criadoEm>2026-01-01T00:00:00.000Z</criadoEm>
</criarRemessaResponse>
```

---

## 🔵 Consultar Remessa

### Request

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <consultarRemessa>
      <remessaId>REM-123456</remessaId>
    </consultarRemessa>
  </soap:Body>
</soap:Envelope>
```

### Response

```xml
<consultarRemessaResponse>
  <remessaId>REM-123456</remessaId>
  <clienteId>CLI-001</clienteId>
  <origem>São Paulo</origem>
  <destino>Recife</destino>
  <pesoKg>10</pesoKg>
  <descricao>Produtos eletrônicos</descricao>
  <status>EM_TRANSITO</status>
  <criadoEm>2026-01-01T00:00:00.000Z</criadoEm>
  <historico>
    <item>
      <status>AGUARDANDO</status>
      <data>2026-01-01T00:00:00.000Z</data>
    </item>
    <item>
      <status>EM_TRANSITO</status>
      <data>2026-01-01T00:10:00.000Z</data>
    </item>
  </historico>
</consultarRemessaResponse>
```

---

## 🟡 Atualizar Status

### Request

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <atualizarStatus>
      <remessaId>REM-123456</remessaId>
      <status>ENTREGUE</status>
    </atualizarStatus>
  </soap:Body>
</soap:Envelope>
```

### Response

```xml
<atualizarStatusResponse>
  <remessaId>REM-123456</remessaId>
  <status>ENTREGUE</status>
  <atualizadoEm>2026-01-01T00:20:00.000Z</atualizadoEm>
</atualizarStatusResponse>
```

---

## 🟣 Listar Remessas

### Request

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <listarRemessas>
      <status>EM_TRANSITO</status>
      <pagina>1</pagina>
      <tamanhoPagina>10</tamanhoPagina>
    </listarRemessas>
  </soap:Body>
</soap:Envelope>
```

### Response

```xml
<listarRemessasResponse>
  <pagina>1</pagina>
  <tamanhoPagina>10</tamanhoPagina>
  <total>1</total>
  <remessas>
    <item>
      <remessaId>REM-123456</remessaId>
      <clienteId>CLI-001</clienteId>
      <origem>São Paulo</origem>
      <destino>Recife</destino>
      <pesoKg>10</pesoKg>
      <descricao>Produtos eletrônicos</descricao>
      <status>EM_TRANSITO</status>
      <criadoEm>2026-01-01T00:00:00.000Z</criadoEm>
    </item>
  </remessas>
</listarRemessasResponse>
```

---

# ⚠️ Faults (Erros de Negócio)

---

## ❌ Remessa não encontrada

```xml
<soap:Fault>
  <soap:Reason>
    <soap:Text>Remessa não encontrada</soap:Text>
  </soap:Reason>
  <soap:Detail>
    <faultName>RemessaNaoEncontradaFault</faultName>
  </soap:Detail>
</soap:Fault>
```

---

## ❌ Status inválido

```xml
<soap:Fault>
  <soap:Reason>
    <soap:Text>status inválido</soap:Text>
  </soap:Reason>
</soap:Fault>
```

---

## ❌ Validação de campos

* Campos obrigatórios ausentes
* Peso inválido (`pesoKg <= 0`)
* Paginação inválida

---

# 🧱 Estrutura do Projeto

```
server/
├── shipment.wsdl
└── src/
    ├── main.ts
    └── shipment/
        ├── shipment.service.ts
        ├── shipment.types.ts
```

---

# 🧠 Decisões Técnicas

* Persistência em memória utilizando `Map`
* Implementação SOAP via `node-soap`
* Validação manual para controle total dos SOAP Faults
* Arquitetura organizada com NestJS
* Separação clara entre regras de negócio e transporte

---

# 📌 Observações

* Projeto focado em simplicidade e aderência ao desafio
* Não utiliza banco de dados propositalmente
* Fácil evolução para persistência real (PostgreSQL, MongoDB, etc.)
* Comunicação SOAP totalmente funcional e testável via ferramentas externas
