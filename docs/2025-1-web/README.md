<div align="justify">

# DoeTech

<div align="center">

![DoeTech](docs/img/logo.jpeg)

</div>

O **DoeTech** é uma plataforma que visa criar uma interface entre empresas e pessoas físicas, interessadas em doar equipamentos eletrônicos que seriam descartados, e instituições sociais ou pessoas carentes que desejam receber esse tipo de equipamento. A proposta do **DoeTech** é **diminuir a produção de lixo eletrônico enquanto favorece a reutilização de equipamentos eletrônicos por instituições de cunho social e pessoas de baixa renda**.

<hr>

`Graduação em Análise e Desenvolvimento de Sistemas`

`Pontifícia Universidade Católica de Minas Gerais (PUC Minas)`

`Projeto: Desenvolvimento de uma aplicação interativa`

`1º semestre de 2025 (2025/2)`

<hr>

## Integrantes

* Diovane Marcelino Azevedo (**desenvolvimento**)
* Felipe Miguel Nery Lunkes (**Scrum Master, arquiteto de software**)
* João Paulo Fernandes Salviano (**Project Owner**)
* Verônica Hoffmann Fernandes Adler (**desenvolvimento**)

<hr>

## Orientador

* Bernardo Jeunon de Alencar


<hr>

## Instruções de utilização

### Execução remota (DoeTech hospedado)

O DoeTech está hospedado no serviço [Azure](https://azure.microsoft.com/pt-br/), da Microsoft.

##### Acessar o DoeTech

Para acessar o DoeTech, clique [aqui](https://ambitious-desert-0ad52340f.6.azurestaticapps.net).

##### Acesso direto ao backend

O backend pode ser acessado diretamente, via Postman, utilizando a seguinte rota: `https://doetech-hybhf6b8abf3bjds.brazilsouth-01.azurewebsites.net`. Para isso, utilize o contrato disponível ao importar, no Postman, [este](src/DoeTech/Postman.json) arquivo (`src/DoeTech/Postman.json`).

### Execução local

#### Executar a aplicação backend localmente

Para executar a aplicação localmente, você precisa das seguintes dependências:

* [**Docker**](https://docs.docker.com/engine/install/) (Linux) ou [**Docker Desktop**](https://docs.docker.com/desktop/setup/install/windows-install/) (Windows, **caso você não esteja usando o Docker no WSL**);
* [**JetBrains Rider**](https://www.jetbrains.com/rider/) (Linux e Windows) ou [**Visual Studio Community 2022**](https://visualstudio.microsoft.com/pt-br/vs/community/) (Windows);
* [**Postman**](https://www.postman.com/downloads/).

Caso tenha todas as dependências satisfeitas, siga os passos à seguir:

* Abra o projeto em `src/DoeTech/` com sua IDE de escolha;
* Localize o arquivo `docker-compose.yml`. Ele será utilizado para subir um contêiner com uma imagem do MySQL e qualquer outra dependência necessária;

Agora, vamos subir as dependências, utilizando, no shell ou terminal de sua escolha:

```shell
docker compose up
```

Após, inicie a aplicação em modo Release/http. Uma janela do seu navegador padrão deve se abrir, mostrando o status da aplicação (`Healthy`, `Unhealthy`). Caso esteja como `Unhealthy`, alguma dependência não foi satisfeita. Verifique o log no console.

> A aplicação será iniciada na porta 8080.

:warning: A aplicação automaticamente irá executar as *migrations*, isto é, criar o *schema* no banco, bem como todas as tabelas. Nenhuma intervenção é necessária.

Importe o arquivo `Postman.json`, disponível dentro do diretório do projeto (`src/DoeTech/Postman.json`), no Postman, para acessar a API já implementada.

> Lembre-se! **Vários endpoints requerem autenticação via token**. Veja em cada *request* no Postman ou nos *controllers* da aplicação. Caso alguma requisição não seja autorizada, há grande chance dela exigir um token. Para isso, faça login com um usuário criado por você. O endpoint de criação de usuário não requer autenticação via token. Lembre-se ainda que endpoints `DELETE` exigem que o usuário tenha *role* de administrador. 

##### Instruções para finalizar a aplicação backend

Após encerrar a execução pela IDE, basta, no shell usado para executar o comando anterior, usar a combinação `Ctrl-C`. Caso tenha subido os contêiners com:

```shell
docker compose up -d
``` 

insira, no shell, no mesmo diretório do arquivo `docker-compose.yml`, inserir:

```shell
docker compose down
``` 

#### Executar a aplicação frontend localmente

Para executar o frontend, você precisa ter as seguintes dependências:

* Aplicação backend sendo executada;
* [npm](https://www.npmjs.com/). Veja, na página do projeto, como instalar o `npm` em cada sistema operacional suportado;
* [ng](https://angular.dev/). Veja, na página do projeto, como instalar o `ng` em cada sistema operacional suportado.

Após ter as dependências necessárias instaladas, navegue, no terminal, até `src/DoeTech-frontend`. À seguir, execute, no terminal:

```shell
npm i
ng serve
```

O comando `npm i` irá instalar todas as dependências necessárias para a execução da aplicação. Já o comando `ng serve` irá iniciar a execução da aplicação frontend desenvolvida em *Angular*.

O `ng` irá fornecer o endereço local para acesso à aplicação.

##### Instruções para finalizar a aplicação frontend

No terminal aberto com a execução do comando `ng serve`, pressione a combinação `Ctrl-C`.

<hr>

## Documentação

<ol>
<li><a href="docs/01-Documentação de Contexto.md"> Documentação de Contexto</a></li>
<li><a href="docs/02-Especificação do Projeto.md"> Especificação do Projeto</a></li>
<li><a href="docs/03-Metodologia.md"> Metodologia</a></li>
<li><a href="docs/04-Projeto de Interface.md"> Projeto de Interface</a></li>
<li><a href="docs/05-Arquitetura da Solução.md"> Arquitetura da Solução</a></li>
<li><a href="docs/06-Template Padrão da Aplicação.md"> Template Padrão da Aplicação</a></li>
<li><a href="docs/07-Programação de Funcionalidades.md"> Programação de Funcionalidades</a></li>
<li><a href="docs/08-Plano de Testes de Software.md"> Plano de Testes de Software</a></li>
<li><a href="docs/09-Registro de Testes de Software.md"> Registro de Testes de Software</a></li>
<li><a href="docs/10-Plano de Testes de Usabilidade.md"> Plano de Testes de Usabilidade</a></li>
<li><a href="docs/11-Registro de Testes de Usabilidade.md"> Registro de Testes de Usabilidade</a></li>
<li><a href="docs/12-Apresentação do Projeto.md"> Apresentação do Projeto</a></li>
<li><a href="docs/13-Referências.md"> Referências</a></li>
</ol>

<hr>

## Código

<li><a href="src/README.md"> Código Fonte</a></li>

<hr>

## Apresentação

<li><a href="presentation/README.md"> Apresentação da solução</a></li>

</div>