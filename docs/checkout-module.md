# Módulo de Checkout

## Visão Geral

O módulo `checkout` gerencia o ciclo de vida de sessões de caixa. Cada sessão representa uma abertura de caixa — apenas uma pode estar ativa por vez. Pedidos (`orders`) só podem ser criados enquanto houver um checkout aberto.

---

## Endpoints

| Método | Rota                   | Descrição                          |
|--------|------------------------|------------------------------------|
| POST   | `/checkout`            | Abre uma nova sessão de caixa      |
| GET    | `/checkout/resume`     | Retorna resumo do caixa aberto     |
| POST   | `/checkout/close`      | Fecha a sessão de caixa ativa      |

---

## Fluxo de Abertura de Caixa (`create`)

```
POST /checkout
  │
  ├─ Verifica se existe checkout com isOpen = true
  │     └─ Encontrado → lança CheckoutIsOpen (HTTP 403, code '001')
  │
  ├─ Cria CheckoutEntity com isOpen = true e initialValue
  │
  └─ Persiste via checkoutRepository.save()
        └─ Retorna CheckoutEntity completo
```

**Payload de entrada:**

```json
{
  "initialValue": 500.00
}
```

**Resposta (201):**

```json
{
  "id": "uuid",
  "isOpen": true,
  "initialValue": 500.00,
  "closingValue": null,
  "closedAt": null,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

## Fluxo de Resumo do Caixa (`resume`)

```
GET /checkout/resume
  │
  ├─ Busca checkout com isOpen = true via LEFT JOIN nos pedidos
  │     └─ Não encontrado → lança CheckoutNotOpen (HTTP 404, code '005')
  │
  ├─ Agrega pedidos não cancelados (COUNT + SUM)
  │
  └─ Calcula grandTotal = totalOrdersValue + initialValue
        └─ Retorna objeto de resumo
```

**Resposta (200):**

```json
{
  "openedAt": "2026-01-01T08:00:00.000Z",
  "initialValue": 500.00,
  "totalOrderCount": 3,
  "totalOrdersValue": 300.00,
  "grandTotal": 800.00
}
```

> **Nota:** Pedidos com status `CANCELLED` são excluídos do `totalOrderCount` e do `totalOrdersValue`.

---

## Fluxo de Fechamento de Caixa (`close`)

```
POST /checkout/close
  │
  ├─ Busca checkout por checkoutId
  │     └─ Não encontrado → lança CheckoutNotFound (HTTP 404, code '002')
  │
  ├─ Verifica se checkout está aberto
  │     └─ isOpen = false → lança CheckoutIsClosed (HTTP 403, code '003')
  │
  ├─ Atualiza isOpen = false, closedAt = now(), closingValue
  │
  └─ Persiste via checkoutRepository.save()
        └─ Retorna CheckoutEntity atualizado
```

**Payload de entrada:**

```json
{
  "checkoutId": "uuid",
  "closingValue": 750.00
}
```

**Resposta (201):**

```json
{
  "id": "uuid",
  "isOpen": false,
  "initialValue": 500.00,
  "closingValue": 750.00,
  "closedAt": "2026-01-01T18:00:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T18:00:00.000Z"
}
```

> **Nota:** `closingValue` pode ser `null`. Não há validação de que o valor informado é coerente com o total do caixa.

---

## Modelo de Dados

### `CheckoutEntity`

| Campo          | Tipo            | Padrão | Descrição                                              |
|----------------|-----------------|--------|--------------------------------------------------------|
| `id`           | UUID            | —      | Identificador único (gerado automaticamente)           |
| `isOpen`       | boolean         | `true` | Indica se a sessão está aberta                         |
| `orders`       | OrderEntity[]   | —      | Pedidos vinculados (OneToMany)                         |
| `initialValue` | decimal(10,2)   | `0`    | Valor inicial do caixa                                 |
| `closingValue` | decimal(10,2)   | `null` | Valor do caixa no momento do fechamento (nullable)     |
| `closedAt`     | date (nullable) | `null` | Data/hora de fechamento (preenchido ao fechar)         |
| `createdAt`    | timestamp       | —      | Data de criação (auto)                                 |
| `updatedAt`    | timestamp       | —      | Data da última atualização (auto)                      |

> **Atenção:** O nome da coluna no banco para `initialValue` é `intial_value` (typo) — mantido para compatibilidade com dados existentes.

---

## Relacionamentos

```
CheckoutEntity (1) ──── (N) OrderEntity
```

- Um checkout pode ter vários pedidos associados via `@OneToMany`
- A relação não define cascade — pedidos persistem mesmo após o fechamento do checkout

---

## Exceções

| Exceção             | HTTP | Code  | Mensagem                       | Quando                                              |
|---------------------|------|-------|--------------------------------|-----------------------------------------------------|
| `CheckoutIsOpen`    | 403  | '001' | Has a open checkout            | Tentativa de abrir checkout com outro já aberto     |
| `CheckoutNotFound`  | 404  | '002' | Checkout has not been found    | Checkout não encontrado pelo ID ao fechar           |
| `CheckoutIsClosed`  | 403  | '003' | The checkout is already closed | Tentativa de fechar um checkout já encerrado        |
| `CheckoutNotOpen`   | 404  | '005' | There is no open checkout      | Consulta de resumo sem checkout aberto              |

---

## Regras de Negócio

1. **Sessão única ativa:** Apenas um checkout pode ter `isOpen = true` ao mesmo tempo. Qualquer tentativa de abrir um segundo checkout é bloqueada.
2. **initialValue obrigatório:** O caixa deve ser aberto com um valor inicial (pode ser `0`).
3. **Fechamento irreversível:** Após fechado (`isOpen = false`), o checkout não pode ser reaberto — não existe endpoint para isso.
4. **closedAt preenchido no fechamento:** Ao fechar o checkout, o campo `closedAt` é populado com o timestamp atual.
5. **closingValue registra o valor físico do caixa:** Recebido como parâmetro no fechamento; não é validado contra o total de pedidos.
6. **Resumo exige checkout aberto:** `GET /checkout/resume` lança `CheckoutNotOpen` se não houver caixa aberto.
7. **Pedidos cancelados excluídos do resumo:** `totalOrderCount` e `totalOrdersValue` consideram apenas pedidos com status diferente de `CANCELLED`.
8. **Checkout como pré-requisito de pedidos:** O módulo `orders` consulta internamente o checkout aberto antes de criar pedidos.

---

## Dependências do Módulo

O `CheckoutModule` importa e injeta:

- `CheckoutEntity` — repositório principal da sessão de caixa

---

## Cobertura de Testes

| Cenário                                                                          | Status |
|----------------------------------------------------------------------------------|--------|
| `create()` → lança `CheckoutIsOpen` quando já existe checkout aberto             | ✅     |
| `create()` → cria checkout com sucesso quando não há checkout aberto             | ✅     |
| `close()` → lança `CheckoutNotFound` para id inexistente                         | ✅     |
| `close()` → lança `CheckoutIsClosed` para checkout já fechado                    | ✅     |
| `close()` → salva com `isOpen=false`, `closedAt` e `closingValue`                | ✅     |
| `resume()` → lança `CheckoutNotOpen` quando não há checkout aberto               | ✅     |
| `resume()` → retorna resumo correto com pedidos (count, soma, grandTotal)        | ✅     |
| `resume()` → retorna grandTotal = initialValue quando não há pedidos             | ✅     |
| Controller → `createCheckout` delega para `service.create` com `initialValue`   | ✅     |
| Controller → `closeCheckout` delega para `service.close` com id e closingValue  | ✅     |
| Controller → `getCheckoutResume` delega para `service.resume`                   | ✅     |
| Controller → `getCheckoutResume` propaga `CheckoutNotOpen` do serviço            | ✅     |

---

## Pontos de Atenção para Novas Features

- **Sem paginação ou listagem:** Não há endpoint para listar histórico de checkouts encerrados.
- **closingValue não validado:** Não há verificação se o valor informado é coerente com o saldo esperado do caixa.
