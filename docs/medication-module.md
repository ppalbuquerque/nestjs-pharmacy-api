# Módulo de Medication

## Visão Geral

O módulo `medication` gerencia o catálogo de medicamentos da farmácia. Oferece operações de CRUD completo e busca textual híbrida (full-text search em português + ILIKE + similaridade trigram). Ao criar um medicamento, o serviço também gera e persiste embeddings vetoriais via `AiSearchService` para suportar busca semântica.

---

## Endpoints

| Método | Rota                    | Descrição                                      |
|--------|-------------------------|------------------------------------------------|
| GET    | `/medication`           | Lista medicamentos paginados                   |
| GET    | `/medication/search`    | Busca medicamentos por texto (full-text + ILIKE + trigram) |
| GET    | `/medication/:id`       | Retorna um medicamento pelo ID                 |
| POST   | `/medication`           | Cadastra um novo medicamento                   |
| PUT    | `/medication`           | Atualiza campos de um medicamento existente    |
| DELETE | `/medication/:id`       | Remove um medicamento pelo ID                  |

---

## Fluxo de Listagem (`list`)

```
GET /medication?limit=10&offset=0
  │
  ├─ findAndCount com TAKE limit e SKIP offset
  │
  ├─ Calcula nextPage = offset + limit
  │     └─ Se nextPage >= total → nextPage = null
  │
  └─ Retorna { medications, nextPage }
```

**Query params (todos opcionais):**

| Parâmetro | Tipo   | Padrão | Descrição              |
|-----------|--------|--------|------------------------|
| `limit`   | number | 10     | Itens por página (mín: 1) |
| `offset`  | number | 0      | Deslocamento (mín: 0)  |

**Resposta (200):**

```json
{
  "medications": [
    {
      "id": 1,
      "name": "Paracetamol",
      "chemicalComposition": "Acetaminophen",
      "stockAvailability": 100,
      "shelfLocation": "A1",
      "boxPrice": 1590,
      "unitPrice": 150,
      "usefulness": "Analgésico e antitérmico",
      "samplePhotoUrl": "https://...",
      "dosageInstructions": "Tomar 1 comprimido a cada 6 horas",
      "fullTextSearch": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "nextPage": 10
}
```

> **Nota:** `nextPage` é `null` quando não há mais páginas.

---

## Fluxo de Busca Textual (`search`)

```
GET /medication/search?q=paracetamol
  │
  ├─ Executa query SQL UNION de quatro estratégias:
  │     ├─ full_text_search @@ plainto_tsquery('portuguese', unaccent($1))
  │     ├─ name ILIKE '%query%'
  │     ├─ chemical_composition ILIKE '%query%'
  │     └─ $1 % usefulness  (similaridade trigram via pg_trgm)
  │
  └─ Retorna array de Medication[]
```

**Query params:**

| Parâmetro | Tipo   | Obrigatório | Descrição         |
|-----------|--------|-------------|-------------------|
| `q`       | string | Sim         | Termo de pesquisa |

**Resposta (200):**

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
    "usefulness": "agente antibacteriano indicado no tratamento de infecções urinárias agudas e crônicas",
    "samplePhotoUrl": "BLANK",
    "dosageInstructions": "De 8 em 8 horas",
    "fullTextSearch": null,
    "createdAt": "2025-11-07T18:58:08.394Z",
    "updatedAt": "2025-11-07T18:58:08.394Z"
  }
]
```

> **Nota:** Erros na busca são capturados no controller e apenas logados via `console.log` — a resposta será `undefined` em caso de falha, sem lançar HTTP exception.

---

## Fluxo de Busca por ID (`findOne`)

```
GET /medication/:id
  │
  └─ findOne({ where: { id } })
        └─ Retorna Medication | null
```

> **Nota:** Não lança exceção quando o medicamento não é encontrado — retorna `null` diretamente.

---

## Fluxo de Criação (`create`)

```
POST /medication
  │
  ├─ Cria MedicationEntity a partir do DTO
  │
  ├─ Chama aiSearchService.saveMedicationEmbedding() (fire-and-forget)
  │     └─ Salva embedding vetorial para busca semântica
  │
  ├─ Persiste via medicationRepository.save()
  │
  └─ MedicationSubscriber dispara afterInsert:
        └─ Atualiza full_text_search (tsvector) com usefulness(A), name(B), chemical_composition(C)
```

**Payload de entrada:**

```json
{
  "name": "Paracetamol",
  "chemicalComposition": "Acetaminophen",
  "stockAvailability": 100,
  "shelfLocation": "A1",
  "boxPrice": 1590,
  "unitPrice": 150,
  "usefulness": "Analgésico e antitérmico",
  "dosageInstructions": "Tomar 1 comprimido a cada 6 horas",
  "samplePhotoUrl": "https://..."
}
```

**Resposta (201):** `MedicationEntity` completo persistido.

---

## Fluxo de Atualização (`updateOne`)

```
PUT /medication
  │
  ├─ Executa medicationRepository.update({ id }, { ...dto })
  │
  ├─ MedicationSubscriber dispara afterUpdate:
  │     └─ Re-indexa full_text_search
  │
  └─ Se não encontrado → controller lança NotFoundException
```

**Payload de entrada (todos os campos exceto `id` são opcionais):**

```json
{
  "id": 1,
  "name": "Paracetamol 500mg",
  "stockAvailability": 200,
  "boxPrice": 1800
}
```

**Resposta:** HTTP 204 (sem body).

---

## Fluxo de Remoção (`delete`)

```
DELETE /medication/:id
  │
  ├─ Executa medicationRepository.delete({ id })
  │
  └─ Se lançar erro → controller converte para NotFoundException
```

**Resposta:** HTTP 200 (sem body significativo).

---

## Modelo de Dados

### `Medication` (tabela: `medication`)

| Campo                | Tipo            | Coluna               | Descrição                                              |
|----------------------|-----------------|----------------------|--------------------------------------------------------|
| `id`                 | int             | `id`                 | Identificador único (auto-incremento)                  |
| `name`               | varchar         | `name`               | Nome comercial do medicamento                          |
| `chemicalComposition`| varchar         | `chemical_composition` | Composição química                                   |
| `stockAvailability`  | int             | `stock_availability` | Quantidade em estoque                                  |
| `shelfLocation`      | varchar         | `shelf_location`     | Localização na prateleira                              |
| `boxPrice`           | integer (centavos) | `box_price`       | Preço por caixa em centavos (ex: 1590 = R$ 15,90)      |
| `unitPrice`          | integer (centavos) | `unit_price`      | Preço por unidade em centavos (ex: 150 = R$ 1,50)      |
| `usefulness`         | varchar         | `usefulness`         | Indicação terapêutica (usada no trigram e full-text)   |
| `samplePhotoUrl`     | varchar         | `sample_photo_url`   | URL da foto do medicamento                             |
| `dosageInstructions` | text            | `dosage_instructions`| Instruções de posologia                                |
| `fullTextSearch`     | tsvector        | `full_text_search`   | Índice para busca full-text (atualizado pelo subscriber) |
| `createdAt`          | timestamp       | `created_at`         | Data de criação (auto)                                 |
| `updatedAt`          | timestamp       | `updated_at`         | Data da última atualização (auto)                      |

---

## Subscriber: `MedicationSubscriber`

O `MedicationSubscriber` é um TypeORM Event Subscriber que atualiza automaticamente a coluna `full_text_search` após cada insert ou update.

**Pesos configurados:**

| Peso | Campo               | Significado           |
|------|---------------------|-----------------------|
| A    | `usefulness`        | Maior relevância      |
| B    | `name`              | Relevância média      |
| C    | `chemical_composition` | Menor relevância   |

**Configuração de idioma:** `ptbr` (custom text search configuration em português).

---

## Integração com AI Search

Ao criar um medicamento (`create`), o serviço chama `aiSearchService.saveMedicationEmbedding()` com os seguintes dados:

```typescript
{
  chemicalComposition: dto.chemicalComposition,
  medicationName: dto.name,
  medicationUsefulness: dto.usefulness,
  stock: dto.stockAvailability,
  usage: dto.usefulness,
}
```

> **Nota:** A chamada é feita sem `await` — é fire-and-forget. Falhas no embedding não bloqueiam a criação do medicamento.

---

## Exceções

| Situação                             | HTTP | Exceção             | Quando                                       |
|--------------------------------------|------|---------------------|----------------------------------------------|
| Medicamento não encontrado no update | 404  | `NotFoundException` | `updateOne` lança erro — controller converte |
| Medicamento não encontrado no delete | 404  | `NotFoundException` | `delete` lança erro — controller converte    |

> **Nota:** O módulo não possui exceções de domínio próprias (como `CheckoutNotFound`). Usa diretamente `NotFoundException` do NestJS no controller.

---

## Regras de Negócio

1. **Full-text search automático:** O `MedicationSubscriber` mantém `fullTextSearch` sempre sincronizado após insert/update.
2. **Embedding gerado na criação:** Todo medicamento criado gera embedding vetorial para suporte à busca semântica (módulo `ai-search`).
3. **Busca híbrida:** `GET /medication/search` combina quatro estratégias — full-text, ILIKE no nome, ILIKE na composição, e trigram na indicação.
4. **Paginação com nextPage:** A listagem retorna `nextPage` como offset da próxima página ou `null` quando não há mais resultados.
5. **Atualização parcial:** `PUT /medication` aceita apenas os campos que devem ser atualizados — todos exceto `id` são opcionais.
6. **Sem validação de unicidade:** Não há controle de medicamentos duplicados por nome ou composição.

---

## Dependências do Módulo

O `MedicationModule` injeta:

- `Medication` — repositório principal de medicamentos
- `AiSearchService` — geração de embeddings vetoriais (importado via `AiSearchModule`)

---

## Cobertura de Testes

**Cenários cobertos:**

| Cenário                                                                 | Status |
|-------------------------------------------------------------------------|--------|
| `search()` → mapeia resultado SQL raw para camelCase                    | ✅     |
| `search()` → não expõe propriedades snake_case no resultado             | ✅     |
| `search()` → retorna array vazio quando nenhum resultado é encontrado   | ✅     |
| `search()` → preserva `id`, `name` e `usefulness` sem transformação     | ✅     |

**Lacunas identificadas (cenários a cobrir):**

| Cenário                                                                 | Status |
|-------------------------------------------------------------------------|--------|
| `list()` → retorna medicamentos com paginação correta                   | ❌     |
| `list()` → `nextPage` é `null` na última página                         | ❌     |
| `findOne()` → retorna medicamento existente                             | ❌     |
| `findOne()` → retorna `null` para ID inexistente                        | ❌     |
| `create()` → persiste medicamento e chama `saveMedicationEmbedding`     | ❌     |
| `updateOne()` → atualiza campos parcialmente                            | ❌     |
| `delete()` → remove medicamento existente                               | ❌     |
| Controller `delete` → lança `NotFoundException` quando serviço falha    | ❌     |
| Controller `updateOneMedication` → lança `NotFoundException` quando serviço falha | ❌ |

---

## Pontos de Atenção para Novas Features

- **`GET /medication/:id` não lança exceção:** Retorna `null` em vez de 404 quando o medicamento não existe — inconsistente com o padrão dos outros módulos.
- **Erros de busca silenciados:** O controller captura erros em `search` apenas com `console.log`, respondendo `undefined` ao cliente.
- **Sem validação de estoque:** Nenhuma regra impede criação de medicamento com `stockAvailability = 0` ou negativo.
- **Sem cobertura de testes:** Todo o módulo carece de testes unitários.
