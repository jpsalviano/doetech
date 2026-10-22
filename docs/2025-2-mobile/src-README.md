# Instruções de utilização

## Execução remota (DoeTech hospedado)

O DoeTech está hospedado no serviço [Azure](https://azure.microsoft.com/pt-br/), da Microsoft.

### Acessar o Doetech (aplicativo mobile)

Você pode utilizar o DoeTech o instalando em seu dispositivo Android, utilizando o APK disponível [aqui](../src/artefatos/Android/doetech-mobile.apk).

## Execução local

### Executar a aplicação backend localmente

> Aviso! A aplicação web backend está hospedada na Azure e é acessível em: https://doetech-hybhf6b8abf3bjds.brazilsouth-01.azurewebsites.net/rest/v1.

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

#### Instruções para finalizar a aplicação backend

Após encerrar a execução pela IDE, basta, no shell usado para executar o comando anterior, usar a combinação `Ctrl-C`. Caso tenha subido os contêiners com:

```shell
docker compose up -d
``` 

insira, no shell, no mesmo diretório do arquivo `docker-compose.yml`, inserir:

```shell
docker compose down
``` 

### Executar a aplicação mobile localmente (Android)

> A aplicação mobile já está configurada para se integrar à aplicação web backend hospedada na Azure em: https://doetech-hybhf6b8abf3bjds.brazilsouth-01.azurewebsites.net/rest/v1. Não é necessário executar a aplicação web backend para testar a aplicação mobile.

#### Executar APK

Você pode instalar o APK disponibilizado [aqui](./artefatos/Android/doetech-mobile.apk) em um celular Android e executar a aplicação diretamente por ali.

#### Executar localmente - computador

Para executar a aplicação mobile localmente, você precisa:

1. Atualizar suas dependências, utilizando:

    ```shell
    npm install
    ```
2. Executar a aplicação, utilizando, no terminal:

    ```shell
    npx expo start
    ```
3. Executar a aplicação localmente em `http://localhost:8081` ou utilizar o [Expo Go](https://expo.dev/go) para executar a aplicação em seu dispositivo **Android**.

<hr>