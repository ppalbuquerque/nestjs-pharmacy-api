# API Reference — Pharmacy API

> **Destinatários:** equipe de frontend.
> **Base URL:** `http://localhost:3000` (dev) — porta configurável via `PORT`.
> **Formato:** todas as respostas são `application/json`, exceto onde indicado.
> **Erros de domínio** seguem sempre o formato: `{ "message": string, "errorCode": string }`.

---

## Índice

1. [Checkout](#1-checkout)
2. [Orders](#2-orders)
3. [Medication](#3-medication)
4. [Files](#4-files)
5. [AI Search](#5-ai-search)
6. [Tabela de erros](#6-tabela-de-erros)
7. [Relacionamentos entre entidades](#7-relacionamentos-entre-entidades)

---

## 1. Checkout

Gerencia o ciclo de vida da sessão de caixa. Apenas um checkout pode estar aberto por vez. Pedidos só podem ser criados enquanto houver um checkout aberto.

### `POST /checkout` — Abrir caixa

**Request body**
```json
{
  "initialValue": 500.00
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `initialValue` | number | Sim | Valor inicial do caixa |

**Response `201`**
```json
{
  "id": "uuid",
  "isOpen": true,
  "initialValue": 500.00,
  "closingValue": null,
  "closedAt": null,
  "createdAt": "2026-01-01T08:00:00.000Z",
  "updatedAt": "2026-01-01T08:00:00.000Z"
}
```

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 403 | `001` | Já existe um checkout aberto |

---

### `GET /checkout/status` — Status do checkout mais recente

Retorna o checkout mais recente independentemente de estar aberto ou fechado.

**Response `200`**
```json
{
  "id": "uuid",
  "isOpen": true,
  "createdAt": "2026-01-01T08:00:00.000Z",
  "updatedAt": "2026-01-01T08:00:00.000Z",
  "closedAt": null
}
```

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 404 | `006` | Nenhum checkout existe na base |

---

### `GET /checkout/resume` — Resumo do caixa aberto

Agrega pedidos não cancelados vinculados ao checkout aberto.

**Response `200`**
```json
{
  "openedAt": "2026-01-01T08:00:00.000Z",
  "initialValue": 500.00,
  "totalOrderCount": 3,
  "totalOrdersValue": 300.00,
  "grandTotal": 800.00
}
```

> `grandTotal = initialValue + totalOrdersValue`. Pedidos com status `CANCELLED` são excluídos.

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 404 | `005` | Nenhum checkout aberto |

---

### `POST /checkout/close` — Fechar caixa

**Request body**
```json
{
  "checkoutId": "uuid",
  "closingValue": 750.00
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `checkoutId` | string (UUID) | Sim | ID do checkout a fechar |
| `closingValue` | number \| null | Não | Valor físico no caixa ao fechar |

**Response `201`**
```json
{
  "id": "uuid",
  "isOpen": false,
  "initialValue": 500.00,
  "closingValue": 750.00,
  "closedAt": "2026-01-01T18:00:00.000Z",
  "createdAt": "2026-01-01T08:00:00.000Z",
  "updatedAt": "2026-01-01T18:00:00.000Z"
}
```

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 404 | `002` | Checkout não encontrado pelo ID |
| 403 | `003` | Checkout já está fechado |

---

## 2. Orders

Gerencia pedidos dentro de uma sessão de caixa ativa.

### `GET /orders` — Listar pedidos

**Query params**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `limit` | number | `10` | Itens por página (mín. 1) |
| `offset` | number | `0` | Deslocamento (mín. 0) |
| `status` | `COMPLETE` \| `CANCELLED` \| `PROCESSING` | — | Filtro por status |
| `checkoutId` | string (UUID) | — | Filtro por checkout |
| `createdAtFrom` | string (ISO 8601) | — | Data de criação >= |
| `createdAtTo` | string (ISO 8601) | — | Data de criação <= |

**Response `200`**
```json
{
  "orders": [
    {
      "id": "uuid",
      "totalValue": 120.00,
      "status": "COMPLETE",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

---

### `GET /orders/:id` — Buscar pedido por ID

**Path params:** `id` (UUID)

**Response `200`**
```json
{
  "id": "uuid",
  "totalValue": 120.00,
  "paymentValue": 150.00,
  "status": "COMPLETE",
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z",
  "orderItems": [
    {
      "id": "uuid",
      "amount": 2,
      "totalValue": 120.00,
      "boxType": "unit",
      "medication": {
        "id": 1,
        "name": "Dipirona 500mg",
        "unitPrice": 6000,
        "boxPrice": 48000
      }
    }
  ]
}
```

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 404 | `004` | Pedido não encontrado |

---

### `POST /orders` — Criar pedido

Exige checkout aberto. `totalValue` de cada item deve ser calculado pelo frontend.

**Request body**
```json
{
  "paymentValue": 150.00,
  "orderItems": [
    {
      "medicationId": "1",
      "amount": 2,
      "totalValue": 120.00,
      "boxType": "unit"
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `paymentValue` | number | Sim | Valor pago pelo cliente |
| `orderItems` | array | Sim | Mínimo 1 item |
| `orderItems[].medicationId` | string | Sim | ID do medicamento |
| `orderItems[].amount` | number (int) | Sim | Quantidade |
| `orderItems[].totalValue` | number | Sim | Valor total do item |
| `orderItems[].boxType` | `"box"` \| `"unit"` | Não | Padrão: `"unit"` |

**Response `201`** — retorna o pedido completo com `orderItems` populados (mesmo schema de `GET /orders/:id`).

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 403 | `003` | Não há checkout aberto |

---

### `PUT /orders/cancel/:id` — Cancelar pedido

**Path params:** `id` (UUID)

**Response `200`**
```json
{ "message": "Order cancelled with success" }
```

**Erros**
| Status | errorCode | Quando |
|--------|-----------|--------|
| 404 | `004` | Pedido não encontrado ou já cancelado |

---

## 3. Medication

CRUD completo do catálogo de medicamentos com busca por texto.

### `GET /medication` — Listar medicamentos

**Query params**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `limit` | number | `10` | Itens por página |
| `offset` | number | `0` | Deslocamento |

**Response `200`** — array de objetos `Medication` (schema abaixo).

---

### `GET /medication/search?q=:query` — Busca por texto

Utiliza full-text search em português (tsvector) no banco.

**Query params:** `q` (string, obrigatório)

**Response `200`** — array de objetos `Medication`.

```json
[
  {
    "id": 11,
    "name": "Macrodantina",
    "chemicalComposition": "Nitrofuratoína",
    "stockAvailability": 10,
    "shelfLocation": "3F",
    "boxPrice": 1000,
    "unitPrice": 1000,
    "usefulness": "agente antibacteriano...",
    "samplePhotoUrl": "BLANK",
    "dosageInstructions": "De 8 em 8 horas",
    "fullTextSearch": null,
    "createdAt": "2025-11-07T18:58:08.394Z",
    "updatedAt": "2025-11-07T18:58:08.394Z"
  }
]
```

---

### `GET /medication/:id` — Buscar por ID

**Path params:** `id` (integer)

**Response `200`** — objeto `Medication` completo.

**Erros**
| Status | Quando |
|--------|--------|
| 404 | Medicamento não encontrado |

---

### `POST /medication` — Criar medicamento

**Request body**
```json
{
  "name": "Dipirona 500mg",
  "chemicalComposition": "Metamizol sódico",
  "stockAvailability": 200,
  "shelfLocation": "A-12",
  "boxPrice": 4800,
  "unitPrice": 600,
  "usefulness": "Analgésico e antitérmico",
  "dosageInstructions": "1 comprimido a cada 6 horas",
  "samplePhotoUrl": "https://..."
}
```

Todos os campos são obrigatórios.

**Response `201`** — objeto `Medication` com `id`, `createdAt` e `updatedAt` gerados.

---

### `PUT /medication` — Atualizar medicamento

**Request body** — mesmo schema do POST, com `id` (obrigatório) e demais campos opcionais.

**Response `204`** — sem corpo.

**Erros**
| Status | Quando |
|--------|--------|
| 404 | Medicamento não encontrado |

---

### `DELETE /medication/:id` — Remover medicamento

**Path params:** `id` (integer)

**Response `200`** — sem corpo.

**Erros**
| Status | Quando |
|--------|--------|
| 404 | Medicamento não encontrado |

---

### Schema: Medication

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | PK auto-increment |
| `name` | string | Nome comercial |
| `chemicalComposition` | string | Composição química / princípio ativo |
| `stockAvailability` | integer | Quantidade em estoque |
| `shelfLocation` | string | Localização na prateleira |
| `boxPrice` | integer | Preço por caixa em centavos (ex: 4800 = R$ 48,00) |
| `unitPrice` | integer | Preço por unidade em centavos (ex: 600 = R$ 6,00) |
| `usefulness` | string | Indicação terapêutica |
| `dosageInstructions` | string | Posologia |
| `samplePhotoUrl` | string | URL da foto do produto |
| `createdAt` | ISO 8601 | Data de criação |
| `updatedAt` | ISO 8601 | Data da última atualização |

---

## 4. Files

Upload de arquivos para AWS S3.

### `POST /files` — Upload de arquivo

**Content-Type:** `multipart/form-data`

**Form field:** `file` — arquivo único.

**Response `201`**
```json
{
  "id": 1,
  "fileName": "uuid-original.png",
  "contentLength": 204800,
  "contentType": "image/png",
  "url": "https://s3.amazonaws.com/bucket/uuid-original.png"
}
```

> O nome do arquivo armazenado é gerado via UUID. A URL retornada é de acesso público.

---

## 5. AI Search

Busca semântica de medicamentos via OpenAI (embeddings + tool-call loop).

### `GET /ai-search` — Health check

**Response `200`**
```json
{
  "status": "ok",
  "message": "API is running",
  "version": "0.1"
}
```

---

### `POST /ai-search` — Busca com IA (streaming)

**Request body**
```json
{
  "prompt": "medicamento para dor de cabeça sem sonolência"
}
```

**Response `200` — streaming**

A resposta é transmitida como stream de texto (`text/event-stream`). O frontend deve consumir o stream incrementalmente.

> Internamente, o modelo (`gpt-4.1-nano`) executa até 5 iterações de tool-call chamando `getMedications` antes de gerar a resposta final.

---

## 6. Tabela de erros

Todos os erros de domínio retornam:
```json
{ "message": "...", "errorCode": "..." }
```

| errorCode | HTTP | Mensagem | Módulo |
|-----------|------|----------|--------|
| `001` | 403 | Has a open checkout | checkout |
| `002` | 404 | Checkout has not been found | checkout |
| `003` | 403 | The checkout is already closed | checkout, orders |
| `004` | 404 | Order has not been found | orders |
| `005` | 404 | There is no open checkout | checkout |
| `006` | 404 | There are no checkouts | checkout |

Erros de validação de DTO retornam HTTP `400` com o formato padrão do NestJS (`message[]`, `error`, `statusCode`).

---

## 7. Relacionamentos entre entidades

```
CheckoutEntity ──(1:N)──► OrderEntity ──(1:N)──► OrderItemEntity ──(N:1)──► Medication

FileEntity   (standalone)
```

**Fluxo típico de uso no frontend:**

```
1. GET  /checkout/status        → verificar se há caixa aberto
2. POST /checkout               → abrir caixa (se não houver)
3. GET  /medication?limit=...   → carregar catálogo
4. POST /orders                 → registrar venda
5. GET  /checkout/resume        → exibir totais do turno
6. POST /checkout/close         → fechar caixa
```
