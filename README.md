# Desafio_Shopper

## Introdução

O Water-Gas-Meter é uma API RESTful desenvolvida para gerenciar e registrar medições de água e gás para clientes. A API permite o upload de imagens, extração automática dos valores das medições a partir das imagens usando uma integração com o Google Gemini API, além de permitir a confirmação das medições e a listagem das medições registradas.

## Requisitos

Para executar este projeto, você precisará das seguintes ferramentas:

- Node.js (versão 18.x ou superior)
- Docker e Docker Compose
- PostgreSQL (se não utilizar Docker)

## Instalação

Para começar, siga os passos abaixo:

Clone o repositório:
```
git clone https://github.com/seu-usuario/water-gas-meter.git
cd water-gas-meter
```

### Configuração do Ambiente

Antes de executar o projeto, crie um arquivo .env na raiz do projeto com a seguinte configuração:

```
NODE_ENV=development
PORT=3000

POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=db

GEMINI_API_KEY=

DATABASE_URL="postgresql://admin:admin@localhost:5432/db"
```

- NODE_ENV: Define o ambiente de execução (development ou production).
- PORT: Porta em que a aplicação será executada.
- POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB: Credenciais para o banco de dados PostgreSQL.
- GEMINI_API_KEY: Chave da API do Google Gemini (deve ser obtida e preenchida antes da execução).
- DATABASE_URL: URL de conexão com o banco de dados.

A chave da api pode ser criada seguindo as instruções desse link:

https://ai.google.dev/gemini-api/docs/api-key

## Executando o Projeto

Você pode rodar o projeto usando o Docker ou diretamente no Node.js.

Suba os containers:

```
docker-compose up --build
```

A aplicação estará disponível em: http://localhost:3000

## Endpoints da API

1. Upload de Medição

Rota: POST /upload

Descrição: Faz o upload de uma imagem e extrai a medição de água ou gás a partir dela.

```
{
  "image": "data:image/jpeg;base64,...",
  "customer_code": "CUST12345",
  "measure_datetime": "2024-08-27T15:00:00Z",
  "measure_type": "WATER"
}
```

### Respostas Possíveis

- 200 OK:

```
{
  "image_url": "https://example.com/path/to/image.jpg",
  "measure_value": 123.45,
  "measure_uuid": "c12d5e5b-35ad-44ff-bb8a-b8e3b5f5a8f7"
}
```

- 400 Bad Request:

```
{
  "error_code": "INVALID_DATA",
  "error_description": "Detalhes do erro..."
}
```

- 409 Conflict
```
{
  "error_code": "DOUBLE_REPORT",
  "error_description": "Leitura do mês já realizada"
}
```

2. Confirmação de Medição

Rota: PATCH /confirm

Descrição: Confirma uma medição existente.

```
{
  "measure_uuid": "c12d5e5b-35ad-44ff-bb8a-b8e3b5f5a8f7",
  "confirmed_value": 123
}
```

### Respostas Possíveis

- 200 OK:

```
{
"success": true
}
```

- 404 Not Found:

```
{
  "error_code": "MEASURE_NOT_FOUND",
  "error_description": "Leitura não encontrada"
}
```

- 409 Conflict

```
{
  "error_code": "CONFIRMATION_DUPLICATE",
  "error_description": "Leitura já confirmada"
}
```

3. Listagem de Medições

Rota: GET /:customerCode/list

Descrição: Lista as medições de um cliente específico.

```
GET /CUST12345/list?measure_type=WATER
```

### Respostas Possíveis

- 200 OK:

```
{
  "customer_code": "CUST12345",
  "measures": [
    {
      "id": "c12d5e5b-35ad-44ff-bb8a-b8e3b5f5a8f7",
      "measureDatetime": "2024-08-27T15:00:00Z",
      "measureType": "WATER",
      "imageUrl": "https://example.com/path/to/image.jpg",
      "measureValue": 123.45,
      "hasConfirmed": true
    }
  ]
}
```

- 404 Not Found:

```
{
  "error_code": "MEASURES_NOT_FOUND",
  "error_description": "Nenhuma leitura encontrada"
}
```