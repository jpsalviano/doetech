
# Metodologia

<div align="justify">

A seguir, detalhes do ambiente de desenvolvimento e estrutura selecionados para o projeto.

## Ambiente de trabalho

Nesta seção, mais informações sobre o ambiente de desenvolvimento local para a aplicação, incluindo IDEs e demais ferramentas.

### Ambiente de desenvolvimento backend

Para o desenvolvimento da aplicação, foram selecionadas as seguintes IDEs (*Integrated Development Environment* - Ambientes de Desenvolvimento Integrado):

* [**Microsoft Visual Studio Community 2022**](https://visualstudio.microsoft.com/pt-br/), para uso no ambiente Windows;
* [**JetBrains Rider**](https://www.jetbrains.com/rider/) (versão 2024.3.5), para uso em ambientes Linux;

Visando proporcionar um ambiente **multiplataforma** para o desenvolvimento, foram selecionadas duas IDEs, permitindo o desenvolvimento em sistemas baseados em Windows e em sistemas Linux.

### Ambiente de desenvolvimento frontend

#### [**Visual Studio Code**](https://visualstudio.microsoft.com/pt-br/#vscode-section)

O Visual Studio Code será utilizado, principalmente, para a edição de configurações, bem como construção de contratos [Swagger](https://swagger.io/). **Será utilizada a última versão estável disponível**.

#### [**Android Studio**](https://developer.android.com/studio?hl=pt-br)

O Android Studio será a IDE utilizada para o desenvolvimento da aplicação, sua execução e depuração, bem como gerar os binários e artefatos necessários para a execução no dispositivo alvo (gerar o arquivo APK de instalação para dispositivos Android). **Será utilizada a última versão estável disponível** (2025.1.3.7).

#### Configuração do ambiente de desenvolvimento frontend

##### Versões de software

- **Node.js:** v22.17.0;
- **React Native CLI:** 20.0.0;
- **Android Studio:** (2025.1.3.7);
- **Visual Studio Code:** (recomendado, versão mais recente).

##### Passos para Instalação

1.  **Instale o Node.js**: Baixe e instale a versão LTS do [Node.js](https://nodejs.org/);
2.  **Instale o Java Development Kit (JDK)**: O React Native requer o JDK. Recomendamos a versão 11. Você pode instalá-lo via [OpenJDK](https://openjdk.java.net/install/) ou usando um gerenciador de pacotes como o Chocolatey (`choco install openjdk11`);
3.  **Instale o Android Studio**:
    - Baixe e instale o [Android Studio](https://developer.android.com/studio);
    - Na instalação, certifique-se de marcar os seguintes itens:
      - Android SDK;
      - Android SDK Platform;
      - Android Virtual Device;
    - Configure a variável de ambiente `ANDROID_HOME` para o caminho do seu SDK do Android (Ex: `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`).
4.  **Instale o React Native CLI:**
    ```bash
    npm install -g react-native-cli
    ```
5.  **Clone o repositório do projeto:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    ```
6.  **Instale as dependências do projeto:**
    ```bash
    cd pmv-ads-2025-2-e3-proj-doetech-t4/DoeTechMobile
    npm install
    ```

##### Comandos básicos do projeto

Dentro da pasta `DoeTech-mobile`:

-   **Para iniciar o Metro Bundler**:
    ```bash
    npx react-native start
    ```
-   **Para executar o app no Android**:
    ```bash
    npx react-native run-android
    ```
-   **Para executar o app no iOS**:
    ```bash
    npx react-native run-ios
    ```
-   **Para executar os testes**:
    ```bash
    npm test
    ```

### Dispositivo Android [**Galaxy M21s**](https://shop.samsung.com.br/galaxy-m21s-/p)

Um dispositivo Android será utilizado para testar, homologar e validar a aplicação. Para isso, foi selecionado um Samsung Galaxy M21s para os testes. Foi escolhido por ser um dispositivo de entrada, que permite validar a performance da aplicação. Para isso, esse dispositivo apresenta:

- Android 12 (One UI 4.1 Core);
- 4 GB de memória RAM;
- 64 GB de armazenamento.

### Docker: virtualizando dependências

Abaixo, como instalar o Docker localmente para executar as dependências da aplicação em ambiente virtualizado. Para ambientes Windows, deve ser instalado o Docker Desktop. Difererentemente da versão para Linux, o Docker Desktop instala, além da engine, uma interface gráfica para gerenciamento dos contêiners. Essa interface gráfica não está disponível para sistemas Linux.

#### Instalando em distribuições Linux

Em ambientes Linux baseados no Debian (como Ubuntu e Pop!_OS), o Docker deve ser instalado seguindo a documentação disponível [aqui](https://docs.docker.com/engine/install/). Além disso, pode ser instalado por meio dos repositórios oficias das distribuições (utilizando o `apt` como gestor de pacotes), utilizando:

```shell
sudo apt update
sudo apt install docker docker-compose
```

Para instalar em distribuições que utilizam o `dnf` como gestor de pacotes, como Fedora, CentOS, OpenSUSE, OpenMandriva, e Oracle Linux, use:

```shell
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### Instalando no Windows

> :warning: Aviso! Ao utilizar o Docker no Windows, fique ciente da penalidade de desempenho observada na execução de contêiners frente à utilização em ambientes Unix-like, como Linux e macOS.

##### Instalar Docker Desktop

Em ambientes Windows, o Docker deve ser instalado seguindo a documentação disponível [aqui](https://docs.docker.com/desktop/). Essa versão inclui a engine do Docker e uma interface gráfica de gerenciamento dos contêiners. Essa interface não está presente em sistemas baseados em Linux.

##### Usar o Docker via Windows Subsystem for Linux (WSL2)

Você também pode instalar o Docker no ambiente WSL2 (Windows Subsystem for Linux 2). Para isso, você precisa seguir o tutorial de ativação e instalação do WSL, disponível [aqui](https://learn.microsoft.com/pt-br/windows/wsl/install). A seguir, acesse a loja do Windows e instale a última versão do `Ubuntu` (recomendação: versão 24.04 LTS). Após a instalação e um reinício, execute a ferramenta `Windows Terminal` e **encontre a opção de acessar o shell WSL da distribuição**. Caso tudo dê certo, você estará em um terminal executando o `bash`. A seguir, execute os passos de instalação do Docker em distribuições baseadas no Debian, como descrito na [seção anterior](#instalando-em-distribuições-linux).

### Base de dados e bucket S3

Para o projeto, o gerenciador de banco de dados selecionado foi o [**PostgreSQL**](https://www.postgresql.org/) versão 14.0.

Além da base de dados gerenciada (PostgreSQL), o **Amazon S3** será utilizado para a **criação de buckets para a persistência de documentos em PDF** recebidos no processo de cadastro de usuários.

A base de dados e o bucket S3 serão utilizados na forma de um contêiner **Docker**, para facilitar testes de integração e desenvolvimento, além de padronizar a base entre os ambientes dos integrantes do projeto. Para tanto, para executar a base de dados e o bucket S3, utilizaremos o `docker-compose.yml` abaixo:

```yaml
version: '3.9'

services:
  
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: doetech
      POSTGRES_PASSWORD: senha-removida
      POSTGRES_DB: doetech
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    
  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: senha-removida
      MYSQL_DATABASE: doetech
      MYSQL_PASSWORD: senha-removida
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  azurite:
    image: mcr.microsoft.com/azure-storage/azurite
    ports:
      - "10000:10000"
      - "10001:10001"
      - "10002:10002"
    volumes:
      - azurite_data:/data
    command: "azurite-blob --blobHost 0.0.0.0 --location /data"
    restart: unless-stopped

volumes:
  mysql_data:
  azurite_data:
  postgres_data:
```

Além disso, é necessário criar o diretório `.docker-compose` no mesmo diretório onde está o arquivo `docker-compose.yml`. Neste diretório iremos adicionar scripts de inicialização do `localstack` para criar o bucket S3 necessário para persistir e recuperar arquivos. Após a criação do diretório, criar um arquivo nomeado `setup-localstack.sh` dentro dele (`.docker-compose`) com o conteúdo abaixo: 

```shell
awslocal s3api create-bucket --bucket doetech-docs
```

> Lembre-se de verificar os nomes de arquivos e diretórios. Erros de ortografia nos nomes vai impedir a configuração do `localstack` ou a execução dos contêiners. Veja que o diretório `.docker-compose` deve ter um ponto (.) antes do nome. Esse ponto indica, em sistemas Unix, que o arquivo ou diretório é oculto. A ausência do ponto inviabiliza a execução.

> Para ver arquivos ocultos (que começam com ponto final) no Linux, macOS, FreeBSD e outros ambientes Unix e Unix-like, utilize o comando `ls -a` no terminal ou configure o gerenciador de arquivos para exibir arquivos ocultos (no macOS isso exige configurações mais complexas via terminal). No Windows, arquivos e diretórios que comecem com . são exibidos normalmente.

Para executar o contêiner, basta acessar o diretório contendo o arquivo com o conteúdo acima e inserir, no terminal:

```shell
docker compose up
```

> No caso do Windows, utilizar o Docker Desktop para iniciar o contêiner, caso instalado.

> Caso instale o Docker em distribuições Linux utilizando o repositório oficial, a depender da versão, o comando de execução deve ser substituído para `docker-compose up`. Teste o comando padrão e, caso não encontrado, execute esta nova versão disponibilizada.

<hr>

## Controle de Versão

A ferramenta de controle de versão adotada no projeto foi o [Git](https://git-scm.com/), sendo que o [Github](https://github.com)
foi utilizado para hospedagem do repositório.

O projeto segue a seguinte convenção para o nome de branches:

- **main** : Branch principal, contém o código de produção (estável).
- **develop**: Branch de desenvolvimento, onde as novas features são integradas.
- **feature/nome-da-feature**: Branches criadas a partir de `develop` para desenvolver novas funcionalidades.

Quanto à gerência de issues, o projeto adota a seguinte convenção para
etiquetas:

- `documentation`: melhorias ou acréscimos à documentação;
- `bug`: uma funcionalidade encontra-se com problemas;
- `enhancement`: uma funcionalidade precisa ser melhorada;
- `feature`: uma nova funcionalidade precisa ser introduzida;

### Fluxo de Trabalho

1.  A partir da branch `develop`, crie uma nova branch de feature:
    ```bash
    git checkout develop
    git pull
    git checkout -b feature/sua-nova-feature
    ```
2.  Faça suas alterações e commits na branch de feature;
3.  Ao concluir, envie sua branch para o repositório remoto:
    ```bash
    git push origin feature/sua-nova-feature
    ```
4.  Abra um **Pull Request (PR)** no GitHub, da sua branch de feature para a `develop`;
5.  Após a revisão e aprovação do PR, ele será mesclado à `develop`;

<hr>

## Gestão de Projeto

A metodologia `Scrum` foi selecionada pois sua gestão de projetos ágil que tem como objetivo aumentar a produtividade e a qualidade do trabalho desenvolvido. Ela é baseada em três pilares: **transparência**, **inspeção** e **adaptação**.

### Cronogramas e marcos

O projeto terá duração aproximada de **12 semanas**, conforme o diagrama de Gantt disponível abaixo (figura 1).

<div align="center">

![Diagrama de Gantt](./img/diagrama-gantt.png)

Figura 1: Diagrama de Gantt.

</div>

Desta forma, foram definidos os seguintes marcos:

* Semana 2: 
  - Setup inicial;
  - Onboarding da equipe;
  - Entrega da documentação inicial;
  - Início da elicitação de requisitos;
* Semana 4:
  - Fim da elicitação de requisitos;
  - Preparação dos documentos pertinentes;
* Semana 8:
  - Entrega do MVP;
* Semana 9:
  - Testes integrados e sua documentação;
  - Aceite e homologação;
  - Retorno e correções (caso necessário);
  - Revisão de requisitos;
* Semana 12:
  - Entrega final;
  - Deploy em ambiente de produção.

### Estimativa de custos

Para a estimativa de custos, foram considerados os seguintes fatores:

* **Equipe de desenvolvimento**: inclui senioridade e tempo de dedicação exclusiva);
* **Infraestrutura**: hospedagem, bancos de dados, CI/CD e plataformas utiizadas pela aplicação, como mensageria;
* **Ferramentas de apoio**: licenças se software e monitoramento (como Datadog) e colaboração, como Microsoft Teams;
* **Contingência**: valor utilizado como margem de segurança para cobrir mudanças no andamento do desenvolvimento do projeto.

### Plano de recursos

Consedere as tabelas abaixo com os dados de estimativa de custos proposta para o andamento do projeto (tabelas 1-5).

<div align="center">

Tabela 1: Matriz de competências (Skills Matrix)

| Recurso (pessoa)                      | Backend | Frontend | UX/UI | DevOps | QA/Aceite | Project Owner | Observações |
|:-------------------------------------:|:-------:|:--------:|:-----:|:------:|:---------:|:-------------:|:-----------:|
| Desenvolvedor 1 (Felipe Lunkes)       |    x    |          |       |    x   |           |               | Desenvolver backend C# com experiência em infraestrutura |
| Desenvolvedor 2 (João Paulo Salviano) |    x    |     x    |       |        |     x     |       x       | Project Owner atuando como desenvolvedor frontend; realiza os aceites |
| Desenvolvedor 3 (Diovane Marcelino)   |         |     x    |   x   |        |           |               | Desenvolvedor frontend; UX/UI |
| Desenvolvedor 4 (Caio Rosa)           |    x    |     x    |       |        |           |               | Desenvolvedor fullstack |                                        

Tabela 2: Alocação por Sprints

| Sprint            | Atividade | Recurso A (desenvolvedor 1) | Recurso B (desenvolvedor 2) | Recurso C (desenvolvedor 3) | Recurso D (desenvolvedor 4) |
|:-----------------:|:---------:|:---------------------------:|:---------------------------:|:---------------------------:|:---------------------------:|
| 1 (semanas 1-2)   | Planejamento e elicitação de requisitos | 40h | 40h | 40h | 40h |
| 2 (semanas 3-4)   | Finalização da elicitação de requisitos | 40h | 40h | 40h | 40h |
| 3 (semanas 5-6)   | Desenvolvimento das aplicações web backend e mobile | 40h | 40h | 40h | 40h |
| 4 (semanas 7-8)   | Desenvolvimento das aplicações web backend e mobile; Entrega do MVP | 40h | 40h | 40h | 40h |
| 5 (semanas 9-10)  | Integração dos demais requisitos; Testes de aceite e homologação; Correções de retorno; Testes unitários e de integração | 40h | 40h | 40h | 40h |
| 6 (semanas 11-12) | Homologação final e deploy no ambiente de produção | 40h | 40h | 40h | 40h |

Tabela 3: Custos estimados para a equipe

| Recurso (pessoa) | Senioridade | Custo mensal (R$) | Custo total (R$) | Total acumulado (R$) |
|:----------------:|:-----------:|:-----------------:|:----------------:|:--------------------:|
| Desenvolvedor 1  | Pleno       | 8.000,00          | 24.000,00        | 24.000,00            |
| Desenvolvedor 2  | Júnior      | 5.000,00          | 15.000,00        | 39.000,00            |
| Desenvolvedor 3  | Júnior      | 5.000,00          | 15.000,00        | 54.000,00            |
| Desenvolvedor 4  | Pleno       | 8.000,00          | 24.000,00        | 78.000,00            |

Tabela 4: Custos estimados para a infraestrutura, serviços e reserva

| Recurso | Custo mensal unitário (USS$) | Custo total (USS$) | Total acumulado (USS$) |
|:-------:|:----------------------------:|:------------------:|:----------------------:|
| Microsoft Azure (ambiente de desenvolvimento) | 250,00   | 1.000,00   | 1.000,00  |
| Microsoft Azure (ambiente de produção)        | 500,00   | 5.000,00   | 6.000     |
| Licença do Microsoft Windows (x4)             | 150,00   | 600,00     | 6.600,00  |
| Reserva                                       | 5.000,00 | 15.000,000 | 21.600,00 |

Tabela 5 : Dependências críticas

Identificador | Atividade | Dependência | Responsáveis | Risco estipulado |
|:-----------:|:----------|:-----------:|:------------:|:----------------:|
| 1 | Setup inicial; onboarding da equipe; elicitação de requisitos | Não há | Project Owner | Afeta todas as sprints |
| 2 | Configuração da infraestrutura e elicitação de requisitos | ID-2 | DevOps | Afeta a sprint atual e próximas |
| 3 | Desenvolvimento da aplicação web backend | ID-2 | Desenvolvedores backend e fullstack | Afeta a sprint atual e próximas |
| 4 | Desenvolvimento da aplicação mobile (React Native) | ID-2; ID-3 | Desenvolvedores frontend, fullstack e UX/UI | Afeta a sprint atual e próximas |
| 5 | Aceites iniciais, homologação e testes de integração | ID-2; ID-3; ID-4 | Todos os desenvolvores e Project Owner | Afeta a sprint atual e próximas |
| 6 | Entrega do MVP | ID-2; ID-3; ID-4; ID-5 | Project Owner | Afeta sprint atual e próximas |
| 7 | Correções solicitadas pelo cliente; homologação final | ID-2; ID-3; ID-4; ID-5; ID-6 | Afeta a entrega final (deploy) |
| 8 | Deploy final da solução em ambiente de produção | ID-1; ID-2; ID3; ID-4; ID-5; ID-6; ID-7 | Afeta e entrega final (deploy) |

</div>

### Análise de riscos

Uma análise inicial de riscos foi conduzida, e será conduzida após cada marco estipulado no cronograma do projeto. Foram incluidos marcadores que devem ser utilizados para indicar possíveis ameaças ao andamento do projeto em seu cronograma e previsão de custos:

* **Riscos técnicos**:
  - Desempenho abaixo do esperado;
  - falha na integração dos requisitos levantados;
  - Escalabilidade abaixo do esperado, o que indica que a plataforma pode não suportar a demanda;
* **Riscos de conorgrama (prazos e marcos**):
  - Atrasos nas entregas;
  - Atrasos na alocação de recursos de infraestrutura;
* **Riscos de equipe**:
  - Baixo rendimento ou afastamento na equipe de desenvolvimento ou afas(ausência, baixa participação, licença, etc);
  - Alta curva de aprendizado para as tecnologias utilizadas (entenda-se linguagens de programação, frameworks, geerenciadores de base de dados e sistemas operacionais, como Linux, Windows ou Android);
* **Planos de mitigação**:
  - Testes contínuos de aceite e mitigação;
  - Reserva de recursos financeiros para cobrir gastos inesperados de infraestrutura ou contratação;

### Divisão de papéis da equipe

A equipe utiliza o Scrum como base para definição do processo de desenvolvimento.

- **Scrum Master**: Felipe Miguel Nery Lunkes;
- **Product Owner**: João Paulo Fernandes Salviano;
- **Arquiteto de software**: Felipe Miguel Nery Lunkes;
- **Equipe de Desenvolvimento**:
  - Caio Augusto de Carvalho Rosa;
  - Diovane Marcelino Azevedo;
  - Felipe Miguel Nery Lunkes;
  - João Paulo Fernandes Salviano.

<hr>

## Processo

O gerenciamento do projeto e do fluxo de desenvolvimento se dará pela ferramenta [**GitHub Projects**](https://github.com/orgs/ICEI-PUC-Minas-PMV-ADS/projects/2317/views/1). No board do GitHub Projects, temos quatro colunas principais (mais o backlog da Sprint), com as funções à seguir:

* `Backlog`: nesta coluna estão as tarefas do backlog do projeto. Elas serão priorizadas e enviadas para a coluna `A fazer` quando puderem ser desenvolvidas;
* `Em andamento` (In Progress): nesta coluna ficam as tarefas que estão em desenvolvimento ativo por algum integrante do time. Caso alguma dúvida surja durante o desenvolvimento ou a tarefa precise ser temporariamente pausada, deve-se criar um comentário informando o motivo do bloqueio;
* `Revisão de código` (In Review): assim que a implementação estiver concluída, mover o card para esta coluna para review do código pelos pares.
* `Fase de testes` (Ready): após o review, as tarefas implementadas devem ser testadas para verificar se atendem aos requisitos propostos. A seguir, o código, documentação ou artefato podem ser incluídos no ramo principal dos componentes do projeto;
* `Concluído` (Done): nesta coluna estão os cards concluídos da Sprint.

<div align="center">

![Visão geral do GitHub Projects](./img/board-projects.png)

Figura 2: Board do DoeTech no GitHub Projects.

</div>

<hr>

## Ferramentas

Para o desenvolvimento do projeto, foram selecionadas as seguintes ferramentas/softwares:

* **IDEs**:
  - Microsoft Visual Studio Community 2022 (Windows);
  - JetBrains Rider (Linux);
  - Android Studio 2025.1.3.7 (multiplataforma);
* **Editor de código**:
  - Visual Studio Code, com extensões de suporte à JavaScript/TypeScript;
* **Base de dados** (gerenciador de banco de dados):
  - PostgreSQL;
* **Ambiente de virtualização**:
  - Docker;
* **Comunicação entre o time**: 
  - Microsoft Teams (comunicação síncrona);
  - Discord (comunicação assíncrona);
  - WhatsApp (comunicação assíncrona);
* **Ferramenta de design de fluxos**:
  - [draw.io](https://draw.io);
  - Figma;
* **Gerenciamento do projeto**:
  * GitHub Projects.

#### Justificativa de escolha das feramentas

* **IDEs**: o **Microsoft Visual Studio Community 2022** foi escolhido por ser a IDE padrão para o desenvolvimento na linguagem C#, além de ter uso gratuito. Entretanto, por ser limitado ao ambiente Windows, a IDE **JetBrains Rider** também foi selecionada, uma vez que é gratuita para uso acadêmico, é totalmente compatível com o Visual Studio (incluindo atalhos) e pode ser utilizada em ambientes Windows, Linux e macOS; O **Android Studio** foi selecionado por permitir desenvolver a aplicação, com suporte total ao React Native, bem como testar, debugar e emular um dispositivo Android. Além disso, permite a construção de pacotes APK redistribuíveis.
* **Editor de código**: O **Visual Studio Code** é gratuito, bastante usado e recomendado por desenvolvedores pela facilidade de uso, suporte à extensões e integração com git, terminal e outras ferramentas que facilitam o desenvolvimento;
* **Base de dados**: o gerenciador de banco de dados relacional, **PostgreSQL**, é estável e muito utilizada em ambiente de produção, além de ser uma das opções disponíveis para uso junto à Azure (o MySQL não está disponível para o plano de estudantes). Além disso, é gratuita e tem fácil virtualização via Docker. O **Amazon S3** foi escolhido por ser uma base de dados (bucket) orientada a arquivos muito útil para armazenar e recuperar arquivos binários como PDFs e imagens. Localmente, a **AWS** fornece o **localstack** para uso do S3 via contêiner Docker.
* **Ambiente de virtualização**: o Docker foi selecionado pois permite a virtualização, em contêiner, de dependências da aplicação, como a base de dados. Isso permite uma padronização nas configurações e ambiente, além de permitir a execução de testes de integração sem afetar o ambiente local;
* **Comunicação entre o time**: O **Microsoft Teams** foi escolhido para os encontros síncronos por permitir gravação, registro e controle de comentários e mensagens. Já o **Discord** e **WhatsApp** foram selecionados para comunicação asssíncrona por permitirem facilidade de uso;
* **Ferramenta de design de fluxos**: O **draw.io** é uma ferramenta poderosa de design de fluxos, bastante usada por desenvolvedores. Já o **Figma** é uma ferramenta padrão para a modelagem de interfaces, sendo fácil e gratuita;
* **Gerenciamento do projeto**: o **GitHub Projects** foi selecionado por ser gratuito e simples de se utilizar, além de ser estar completamente integrado ao GitHub.

</div>