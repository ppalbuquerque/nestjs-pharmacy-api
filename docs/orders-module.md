# Módulo de Orders

## Visão Geral

O módulo `orders` gerencia a criação e cancelamento de pedidos dentro de uma sessão de caixa (checkout) aberta. Cada pedido agrupa um ou mais itens de medicamentos e está sempre vinculado a um checkout ativo.

---

## Endpoints

| Método | Rota                  | Descrição                  |
|--------|-----------------------|----------------------------|
| POST   | `/orders`             | Cria um novo pedido        |
| PUT    | `/orders/cancel/:id`  | Cancela um pedido existente |

---

## Modelo de Dados

### `OrderEntity`

| Campo          | Tipo          | Descrição                                          |
|----------------|---------------|----------------------------------------------------|
| `id`           | UUID          | Identificador único (gerado automaticamente)       |
| `orderItems`   | OrderItemEntity[] | Itens do pedido (cascade insert)              |
| `checkout`     | CheckoutEntity | Checkout ao qual o pedido pertence (ManyToOne)    |
| `totalValue`   | decimal       | Soma dos `totalValue` de cada item                |
| `paymentValue` | decimal       | Valor recebido como pagamento                     |
| `status`       | enum          | Status do pedido: `COMPLETE`, `CANCELLED`, `PROCESSING` |
| `createdAt`    | timestamp     | Data de criação                                   |
| `updatedAt`    | timestamp     | Data da última atualização                        |

> **Nota:** O status padrão definido na entidade é `PROCESSING`, mas o serviço persiste novos pedidos diretamente como `COMPLETE`.

### `OrderItemEntity`

| Campo        | Tipo       | Descrição                                        |
|--------------|------------|--------------------------------------------------|
| `id`         | UUID       | Identificador único                              |
| `order`      | OrderEntity | Pedido pai (ManyToOne)                          |
| `medication` | Medication | Medicamento referenciado por ID (ManyToOne)     |
| `amount`     | int        | Quantidade do medicamento                        |
| `totalValue` | decimal    | Valor total desse item                           |
| `boxType`    | enum       | Tipo de embalagem: `box` (caixa) ou `unit` (unidade) |
| `createdAt`  | timestamp  | Data de criação                                  |
| `updatedAt`  | timestamp  | Data da última atualização                       |

### Enums

```typescript
enum OrderStatus { COMPLETE = 'COMPLETE', CANCELLED = 'CANCELLED', PROCESSING = 'PROCESSING' }
enum BoxType     { BOX = 'box', UNIT = 'unit' }
```

---

## Relacionamentos

```
CheckoutEntity (1) ──── (N) OrderEntity (1) ──── (N) OrderItemEntity
                                                            │
                                                            └──── (N→1) Medication
```

- `CheckoutEntity` → `OrderEntity`: um checkout pode ter vários pedidos
- `OrderEntity` → `OrderItemEntity`: um pedido pode ter vários itens (cascade insert)
- `OrderItemEntity` → `Medication`: cada item referencia um medicamento pelo ID inteiro

---

## Fluxo de Criação de Pedido (`create`)

```
POST /orders
  │
  ├─ Busca checkout com isOpen = true
  │     └─ Não encontrado → lança CheckoutIsClosed (HTTP 403, code '003')
  │
  ├─ Mapeia orderItems do DTO → OrderItemEntity[]
  │     └─ medicationId (string) é convertido para int via parseInt(10)
  │
  ├─ Calcula totalValue = soma dos totalValue dos itens
  │
  ├─ Cria OrderEntity com status = COMPLETE
  │
  └─ Persiste via ordersRepository.save() (cascade insere os itens)
```

**Payload de entrada:**

```json
{
  "paymentValue": 150.50,
  "orderItems": [
    {
      "medicationId": "123",
      "amount": 2,
      "totalValue": 75.25,
      "boxType": "unit"
    }
  ]
}
```

---

## Fluxo de Cancelamento de Pedido (`cancel`)

```
PUT /orders/cancel/:id
  │
  ├─ Busca order por id
  │     └─ Não encontrado → lança OrderNotFound (HTTP 404, code '004')
  │
  ├─ Verifica status
  │     └─ Já CANCELLED → lança OrderNotFound (HTTP 404, code '004')
  │
  └─ Atualiza status para CANCELLED via update()
        └─ Retorna { message: 'Order cancelled with success' }
```

---

## Regras de Negócio

1. **Checkout obrigatório:** Só é possível criar pedidos se existir um checkout com `isOpen = true`. Não há endpoint para buscar o checkout ativo — o serviço faz a busca internamente.
2. **totalValue calculado no backend:** O cliente informa o `totalValue` por item; o `totalValue` do pedido é recalculado somando os itens no servidor.
3. **Status inicial é COMPLETE:** Pedidos são criados já finalizados. O status `PROCESSING` existe na entidade mas não é utilizado pelo fluxo atual.
4. **Cancelamento por status:** Pedidos já cancelados são tratados como "não encontrados" (`OrderNotFound`), impedindo duplo cancelamento.
5. **Cascade insert:** Ao salvar um `OrderEntity`, os `OrderItemEntity` são persistidos automaticamente — não há endpoint separado para criar itens.
6. **medicationId como string no DTO:** O DTO recebe `medicationId` como string e a conversão para inteiro (`parseInt`) ocorre no serviço, não no DTO.

---

## Exceções

| Exceção            | HTTP | Code  | Mensagem                       | Quando                                        |
|--------------------|------|-------|--------------------------------|-----------------------------------------------|
| `CheckoutIsClosed` | 403  | '003' | The checkout is already closed | Não há checkout aberto ao criar pedido        |
| `OrderNotFound`    | 404  | '004' | Order has not been found       | Pedido não existe ou já está cancelado        |

---

## Dependências do Módulo

O `OrdersModule` importa e injeta três repositórios:

- `OrderEntity` — repositório principal de pedidos
- `OrderItemEntity` — repositório de itens (usado apenas para `create`)
- `CheckoutEntity` — repositório do checkout (consultado para validar sessão aberta)

---

## Cobertura de Testes Atual

Arquivo: `src/orders/orders.service.spec.ts`

| Cenário                                              | Status |
|------------------------------------------------------|--------|
| `create()` → lança `CheckoutIsClosed` sem checkout aberto | ✅ |
| `cancel()` → lança `OrderNotFound` para id inexistente    | ✅ |

**Lacunas identificadas:**

- `create()` com checkout aberto → sucesso (happy path)
- `cancel()` com pedido já cancelado → deve lançar `OrderNotFound`
- `cancel()` com pedido válido → deve retornar mensagem de sucesso
- Cálculo correto do `totalValue` agregado
- `create()` com múltiplos itens

---

## Pontos de Atenção para Novas Features

- **Nenhuma validação de estoque:** O módulo não verifica disponibilidade de medicamentos.
- **paymentValue não é validado:** Não há checagem se `paymentValue >= totalValue`.
- **Sem listagem de pedidos:** Não existe endpoint para listar pedidos de um checkout.
- **Status PROCESSING não utilizado:** Pode ser ponto de extensão para fluxos assíncronos (ex: integração com gateway de pagamento).
- **medicationId como string:** A conversão `parseInt` no serviço pode falhar silenciosamente se o ID não for numérico — considerar validação no DTO.
