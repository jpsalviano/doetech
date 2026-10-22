# Programação de Funcionalidades

<!--
Nesta seção, a implementação do sistema descrita por meio dos requisitos funcionais e/ou não funcionais. Nesta seção, é essencial relacionar os requisitos atendidos com os artefatos criados (código fonte) e com o(s) responsável(is) pelo desenvolvimento de cada artefato a cada etapa. Nesta seção também deverão ser apresentadas, se necessário, as instruções para acesso e verificação da **implementação que deve estar funcional no ambiente de hospedagem, OBRIGATORIAMENTE, a partir da Etapa 03**.

**O que DEVE ser utilizado para o desenvolvimento da aplicação:**
- Microsoft Visual Studio (IDE de Codificação)
- HTML e CSS (frontend)
- Javascript (frontend)
- C# (backend)
- MySQL ou SQLServer(Base de Dados)
- Bootstrap (template responsivo para frontend)
- Github (documentação e controle de versão)

**O que NÃO PODE ser utilizado:**
- Template React (e qualquer outro template - exceto o Bootstrap)
- Qualquer outra liguagem de programação diferente de C#

A tabela a seguir é um exemplo de como ela deverá ser preenchida considerando os artefatos desenvolvidos.

-->

## Artefatos produzidos

|ID    | Descrição do Requisito  | Artefatos produzidos | Aluno(a) responsável |
|------|-----------------------------------------|----|----|
|RF-003 | Cadastrar-se como usuário (doador ou receptor)| Backend (C#) e Frontend | - Backend: **Felipe Lunkes** e **João Paulo Salviano** <br> - Frontend: **Diovane Marcelino**, **João Paulo Salviano** e **Verônica Adler** |
|RF-004 | Verificar email após cadastro | Backend (C#) | **Felipe Lunkes** |
|RF-005 | Autenticar-se no sistema | Backend (C#) e Frontend | - Backend: **Felipe Lunkes** e **Jão Paulo Salviano** <br> - Frontend: **Diovane Marcelino**, **João Paulo Salviano** e **Verônica Adler** |
|RF-006 | Recuperar senha | Backend (C#) e Frontend | - Backend: **Felipe Lunkes** <br> - Frontend: **Diovane Marcelino**, **João Paulo Salviano** e **Verônica Adler**|

# Instruções de acesso/utilização

## Instruções para uso local

### Instruções para subir a aplicação localmente

Para subir a aplicação localmente, você precisa das seguintes dependências:

* [**Docker**](https://docs.docker.com/engine/install/) (Linux) ou [**Docker Desktop**](https://docs.docker.com/desktop/setup/install/windows-install/) (Windows, **caso você não esteja usando o Docker no WSL**);
* [**JetBrains Rider**](https://www.jetbrains.com/rider/) (Linux e Windows) ou [**Visual Studio Community 2022**](https://visualstudio.microsoft.com/pt-br/vs/community/) (Windows);
* [**Postman**](https://www.postman.com/downloads/).

Caso tenha todas as dependências satisfeitas, siga os passos à seguir:

* Abra o projeto em `DoeTech/` com sua IDE de escolha;
* Localize o arquivo `docker-compose.yml`. Ele será utilizado para subir um contêiner com uma imagem do MySQL;

Agora, vamos subir as dependências, utilizando, no shell ou terminal de sua escolha:

```shell
docker compose up
```

Após, inicie a aplicação em modo Release/http. Uma janela do seu navegador padrão deve se abrir, mostrando o status da aplicação (`Healthy`, `Unhealthy`). Caso esteja como `Unhealthy`, alguma dependência não foi satisfeita. Verifique o log no console.

> A aplicação será iniciada na porta 8080.

:warning: A aplicação automaticamente irá executar as *migrations*, isto é, criar o *schema* no banco, bem como todas as tabelas. Nenhuma intervenção é necessária.

Importe o arquivo `Postman.json`, disponível dentro do diretório do projeto, no Postman, para acessar a API já implementada.

> Lembre-se! **Vários endpoints requerem autenticação via token**. Veja em cada *request* no Postman ou nos *controllers* da aplicação. Caso alguma requisição não seja autorizada, há grande chance dela exigir um token. Para isso, faça login com um usuário criado por você. O endpoint de criação de usuário não requer autenticação via token. Lembre-se ainda que endpoints `DELETE` exigem que o usuário tenha *role* de administrador. 

### Instruções para finalizar a aplicação

Após encerrar a execução pela IDE, basta, no shell usado para executar o comando anterior, usar a combinação `Ctrl-C`. Caso tenha subido os contêiners com:

```shell
docker compose up -d
``` 

insira, no shell, no mesmo diretório do arquivo `docker-compose.yml`, inserir:

```shell
docker compose down
``` 

## Instruções de uso (aplicação hospedada)

Em breve!

<!--
Não deixe de informar o link onde a aplicação estiver disponível para acesso (por exemplo: https://adota-pet.herokuapp.com/src/index.html).

Se houver usuário de teste, o login e a senha também deverão ser informados aqui (por exemplo: usuário - admin / senha - admin).

O link e o usuário/senha descritos acima são apenas exemplos de como tais informações deverão ser apresentadas.

> **Links Úteis**:
>
> - [Trabalhando com HTML5 Local Storage e JSON](https://www.devmedia.com.br/trabalhando-com-html5-local-storage-e-json/29045)
> - [JSON Tutorial](https://www.w3resource.com/JSON)
> - [JSON Data Set Sample](https://opensource.adobe.com/Spry/samples/data_region/JSONDataSetSample.html)
> - [JSON - Introduction (W3Schools)](https://www.w3schools.com/js/js_json_intro.asp)
> - [JSON Tutorial (TutorialsPoint)](https://www.tutorialspoint.com/json/index.htm)

-->