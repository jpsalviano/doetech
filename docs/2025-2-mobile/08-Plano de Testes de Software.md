# Plano de Testes de Software

<div align="justify">

## Introdução

Este documento apresenta o plano de testes de software para a aplicação DoeTech, uma plataforma de doação de equipamentos eletrônicos. O plano foi estruturado conforme a norma NBR 13596 (ISO/IEC 9126-1), focando nas características de qualidade de software essenciais: funcionalidade, confiabilidade, usabilidade e eficiência.

## Objetivos dos Testes

O objetivo principal é verificar se a aplicação DoeTech atende aos requisitos funcionais e não funcionais especificados, garantindo qualidade e confiabilidade do sistema. Os testes abrangem:

- **Funcionalidade**: Verificação de adequação e acurácia dos requisitos implementados;
- **Confiabilidade**: Análise de maturidade e recuperabilidade;
- **Usabilidade**: Avaliação de inteligibilidade e operacionalidade da interface;
- **Eficiência**: Medição de comportamento temporal.

## Estratégia de Testes

### Tipos de Teste
- **Testes Funcionais**: Validação dos principais requisitos funcionais;
- **Testes de Interface**: Verificação de responsividade e usabilidade;
- **Testes de Componentes**: Validação isolada de componentes React Native.

### Ferramentas de Teste
- **Jest**: Framework de testes unitários (padrão React Native);
- **React Native Testing Library**: Para testes de componentes;
- **ESLint/Prettier**: Análise estática de código.

## Casos de Teste Funcionais

### Módulo de Autenticação

<div align="center">

| **Caso de Teste** | **CT01 – Cadastrar usuário doador** |
|:---:|:---:|
| Requisito Associado | RF-003 - Cadastrar-se como usuário (doador ou receptor) |
| Objetivo do Teste | Verificar se um usuário consegue se cadastrar como doador (teste básico de interface). |
| Passos | 1. Abrir aplicação DoeTech<br>2. Tocar em "Criar conta"<br>3. Selecionar perfil "Doador"<br>4. Preencher campos obrigatórios<br>5. Tocar em "Registrar" |
| Critério de Êxito | - Cadastro realizado com sucesso<br>- Redirecionamento para tela de confirmação |
| | |

| **Caso de Teste** | **CT02 – Efetuar login** |
|:---:|:---:|
| Requisito Associado | RF-005 - Autenticar-se no sistema |
| Objetivo do Teste | Verificar se o usuário consegue realizar login (validação básica). |
| Passos | 1. Abrir aplicação DoeTech<br>2. Tocar em "Entrar"<br>3. Preencher email e senha válidos<br>4. Tocar em "Login" |
| Critério de Êxito | - Login realizado com sucesso<br>- Redirecionamento para tela principal |
| | |

</div>

### Módulo de Equipamentos

<div align="center">

| **Caso de Teste** | **CT03 – Cadastrar equipamento** |
|:---:|:---:|
| Requisito Associado | RF-009 - Cadastrar equipamentos para doação |
| Objetivo do Teste | Verificar se o doador consegue cadastrar um equipamento (fluxo principal). |
| Passos | 1. Fazer login como doador<br>2. Navegar para "Meus Equipamentos"<br>3. Tocar em "Novo Equipamento"<br>4. Preencher dados básicos<br>5. Salvar equipamento |
| Critério de Êxito | - Equipamento cadastrado<br>- Equipamento visível na lista |
| | |

| **Caso de Teste** | **CT04 – Pesquisar equipamentos** |
|:---:|:---:|
| Requisito Associado | RF-002 - Pesquisar equipamentos disponíveis |
| Objetivo do Teste | Verificar se a busca de equipamentos funciona adequadamente. |
| Passos | 1. Abrir aplicação<br>2. Navegar para "Equipamentos"<br>3. Utilizar campo de busca<br>4. Aplicar filtro básico |
| Critério de Êxito | - Lista de equipamentos carregada<br>- Filtros funcionando |
| | |

</div>

### Módulo de Doações

<div align="center">

| **Caso de Teste** | **CT05 – Solicitar doação** |
|:---:|:---:|
| Requisito Associado | RF-011 - Solicitar doação de equipamentos cadastrados |
| Objetivo do Teste | Verificar se receptor consegue solicitar equipamento. |
| Passos | 1. Login como receptor aprovado<br>2. Buscar equipamento<br>3. Visualizar detalhes<br>4. Tocar em "Solicitar"<br>5. Preencher justificativa |
| Critério de Êxito | - Solicitação enviada<br>- Doador notificado |
| | |

| **Caso de Teste** | **CT06 – Aceitar solicitação** |
|:---:|:---:|
| Requisito Associado | RF-010 - Aceitar solicitações de doação |
| Objetivo do Teste | Verificar se doador consegue aceitar solicitação. |
| Passos | 1. Login como doador<br>2. Acessar "Solicitações"<br>3. Revisar solicitação<br>4. Aceitar solicitação |
| Critério de Êxito | - Solicitação aceita<br>- Receptor notificado<br>- Chat iniciado |
| | |

| **Caso de Teste** | **CT07 – Chat entre usuários** |
|:---:|:---:|
| Requisito Associado | RF-022 - Enviar mensagens no chat |
| Objetivo do Teste | Verificar comunicação entre doador e receptor. |
| Passos | 1. Acessar chat da doação<br>2. Digitar mensagem<br>3. Enviar mensagem<br>4. Verificar recebimento |
| Critério de Êxito | - Mensagens enviadas<br>- Chat funcionando em tempo real |
| | |

</div>

### Módulo Administrativo

<div align="center">

| **Caso de Teste** | **CT08 – Validar cadastro receptor** |
|:---:|:---:|
| Requisito Associado | RF-014 - Aprovar ou reprovar cadastros |
| Objetivo do Teste | Verificar validação de documentação de receptores. |
| Passos | 1. Login como admin<br>2. Acessar "Validações Pendentes"<br>3. Revisar documentação<br>4. Aprovar/reprovar |
| Critério de Êxito | - Decisão registrada<br>- Receptor notificado |
| | |

| **Caso de Teste** | **CT09 – Gerenciar equipamentos** |
|:---:|:---:|
| Requisito Associado | RF-015 - Gerenciar equipamentos cadastrados |
| Objetivo do Teste | Verificar gestão administrativa de equipamentos. |
| Passos | 1. Login como admin<br>2. Listar todos equipamentos<br>3. Editar equipamento<br>4. Remover equipamento inválido |
| Critério de Êxito | - Lista carregada<br>- Edição/remoção funcionando |
| | |

</div>

## Testes Não Funcionais

### Performance

<div align="center">

| **Caso de Teste** | **CT10 – Tempo de carregamento** |
|:---:|:---:|
| Requisito Associado | RNF-001 - A aplicação deve ser performática |
| Objetivo do Teste | Verificar se a aplicação carrega em tempo aceitável. |
| Métrica | Carregamento inicial < 5 segundos |
| Como Testar | Cronometrar tempo de abertura da aplicação |
| | |

</div>

### Responsividade

<div align="center">

| **Caso de Teste** | **CT11 – Adaptação de tela** |
|:---:|:---:|
| Requisito Associado | RNF-008 - A aplicação deve ser responsiva |
| Objetivo do Teste | Verificar se a interface se adapta a diferentes tamanhos de tela. |
| Como Testar | Testar em dispositivos de tamanhos diferentes |
| Critério de Êxito | Interface funcional em smartphones e tablets |
| | |

</div>

## Critérios de Aceitação

### Critérios de Qualidade (NBR 13596)

#### Funcionalidade

- Principais requisitos funcionais implementados e testados;
- Integração entre módulos principais;
- Segurança para dados de login.

#### Confiabilidade

- Aplicação estável sem crashes frequentes;
- Recuperação de erros implementada.

#### Usabilidade

- Interface seguindo padrões do Material Design;
- Navegação intuitiva entre telas principais;
- Tempo de aprendizado aceitável para usuários.

#### Eficiência

- Tempo de resposta aceitável para operações principais;
- Performance adequada em dispositivos móveis.

## Ambiente de Teste

### Configuração Técnica

- **Dispositivos**: Smartphones Android/iOS;
- **Emuladores**: Android Studio AVD, iOS Simulator;
- **Rede**: WiFi estável;
- **Banco de Dados**: SQL Server (ambiente de desenvolvimento).

### Dados de Teste

- Base de usuários fictícios para testes;
- Catálogo de equipamentos;
- Cenários de teste definidos.

## Cronograma de Execução

| Fase | Duração | Responsável |
|------|---------|-------------|
| Implementação dos Testes | 1 semana | Equipe Desenvolvimento |
| Execução dos Testes | 3 dias | Equipe QA |
| Documentação dos Resultados | 2 dias | Product Owner |

## Limitações do Escopo

### O que SERÁ testado

- Fluxos principais da aplicação;
- Interface e navegação;
- Funcionalidades core implementadas;
- Responsividade.

### O que NÃO será testado

- Testes de carga e stress;
- Segurança avançada;
- Integração com APIs externas complexas;
- Performance em escala de produção.

</div>