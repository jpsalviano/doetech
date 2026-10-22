# DoeTech

<div align="center">

![DoeTech](docs/2025-1-web/img/logo.jpeg)

</div>

O **DoeTech** é uma plataforma que visa criar uma interface entre empresas e pessoas físicas, interessadas em doar equipamentos eletrônicos que seriam descartados, e instituições sociais ou pessoas carentes que desejam receber esse tipo de equipamento. A proposta do **DoeTech** é **diminuir a produção de lixo eletrônico enquanto favorece a reutilização de equipamentos eletrônicos por instituições de cunho social e pessoas de baixa renda**.

`Graduação em Análise e Desenvolvimento de Sistemas`
`Pontifícia Universidade Católica de Minas Gerais (PUC Minas)`

## Acesso

- **Web:** [jpsalviano.com.br/doetech](https://jpsalviano.com.br/doetech/)
- **App (versão web):** [jpsalviano.com.br/doetech/app](https://jpsalviano.com.br/doetech/app/)
- **App Android (APK):** na release [`android`](../../releases/tag/android), gerada a cada push em `main`

É uma demonstração: as telas de login mostram contas de exemplo (doador, receptor e admin) com a senha, o cadastro é aberto, e tudo volta ao estado inicial todo dia às 4h (horário de Brasília). O envio de e-mails está desligado, e com ele a recuperação de senha.

## Como funciona

1. O **doador** (empresa ou pessoa física) cadastra os equipamentos que quer doar.
2. O **receptor** (instituição ou pessoa) navega pelos equipamentos disponíveis e pede uma doação.
3. O doador aprova ou recusa o pedido e, aprovado, combina a entrega com o receptor.
4. O **admin** acompanha tudo por relatórios e dashboards.

## Estrutura

| Pasta | O quê | Stack |
|---|---|---|
| `api/` | API REST, em `/api/v1/doetech` | .NET 9, ASP.NET Core, EF Core, PostgreSQL, JWT |
| `web/` | Aplicação web, em `/doetech/` | Angular 19, TypeScript |
| `mobile/` | Aplicativo, em `/doetech/app/` e no APK | React Native 0.81, Expo 54, expo-router, gluestack-ui |
| `tests/` | Testes de integração da API | xUnit, WebApplicationFactory, PostgreSQL |
| `docs/` | Documentação acadêmica de cada edição | |

Uma imagem Docker só (`Dockerfile`) traz a API e os dois fronts, servidos por ela. O CI (`.github/workflows/ci.yml`) roda os testes, compila os fronts, publica a imagem em `ghcr.io/jpsalviano/doetech:<commit>` e gera o APK.

## Execução local

Com Docker, .NET 9 e Node 22:

```bash
# Banco
cd api && docker compose up -d

# API em http://localhost:8080 (aplica as migrations ao subir)
dotnet run --urls http://localhost:8080
# para ligar a demonstração: Demo__Password=uma-senha dotnet run ...

# Web em http://localhost:4200
cd web && npm ci && npx ng serve

# App: Expo Go no celular, ou --web no navegador
cd mobile && npm ci && EXPO_PUBLIC_API_URL=http://<ip-da-máquina>:8080/api/v1/doetech npx expo start
```

Configuração da API (variáveis de ambiente):

| Variável | Para quê |
|---|---|
| `DOETECH_DATABASE_URL` ou `ConnectionStrings__DatabaseConnection` | Banco (URL `postgresql://...` ou connection string do Npgsql) |
| `Jwt__Key` | Chave de assinatura dos tokens, com pelo menos 32 bytes (obrigatória) |
| `Files__Root` | Pasta dos uploads (padrão `/data/files` na imagem) |
| `PublicOrigin` | Origem pública (`https://...`) para os links de arquivos |
| `Demo__Password` | Liga a demonstração com essa senha |
| `EmailSettings__SmtpServer`, `__Port`, `__From`, `__Username`, `__Password` | E-mails (opcional) |

Testes da API (precisam de um PostgreSQL):

```bash
DOETECH_TEST_DB="Host=localhost;Username=postgres;Password=dev" dotnet test tests/DoeTech.Tests
```

## Edições

### 2025/1: aplicação web

`Projeto: Desenvolvimento de uma aplicação interativa`

Integrantes:

* Diovane Marcelino Azevedo (**desenvolvimento**)
* Felipe Miguel Nery Lunkes (**Scrum Master, arquiteto de software**)
* João Paulo Fernandes Salviano (**Project Owner**)
* Verônica Hoffmann Fernandes Adler (**desenvolvimento**)

Orientador: Bernardo Jeunon de Alencar

Documentação: [`docs/2025-1-web`](docs/2025-1-web)

### 2025/2: aplicação móvel

`Projeto: Desenvolvimento de uma Aplicação Móvel em um Ambiente de Negócio`

Integrantes:

* Caio Augusto de Carvalho Rosa (**desenvolvimento**)
* Diovane Marcelino Azevedo (**desenvolvimento**)
* Felipe Miguel Nery Lunkes (**Scrum Master, arquiteto de software, desenvolvimento**)
* João Paulo Fernandes Salviano (**Project Owner, desenvolvimento**)

Orientador: Diego Roberto Gonçalves de Pontes

Documentação: [`docs/2025-2-mobile`](docs/2025-2-mobile)

## Licença

[LICENSE](LICENSE)
