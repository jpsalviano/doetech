# Registro de Testes de Software

Este documento registra os testes realizados para cada caso de teste disponível [aqui](./08-Plano%20de%20Testes%20de%20Software.md).

<div align="center">

Tabela 1: Caso de teste 1

| **Caso de Teste** | **CT01 – Visualizar landing-page com informações institucionais, FAQs e iniciativas de sucesso** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-001 - Visualizar landing-page com informações institucionais, FAQs e iniciativas de sucesso. |
| Evidência do teste (backend)    | Não há testes |
| Evidência do teste (frontend)   | [Vídeo](video/Teste1_FE.webm) |
| Status                          | Aprovado |

[Teste1_FE.webm](https://github.com/user-attachments/assets/0774d417-a325-4725-b6d9-988c740e14ed)

<div align="justify">

## Resultado dos testes

### Backend

Não há testes para este caso de testes na aplicação web backend.

### Frontend

Foi possível observar mais informações sobre a plataforma.

</div>

<hr>
<br>

Tabela 2: Caso de teste 2

| **Caso de Teste** | **CT02 – Pesquisar e visualizar equipamentos disponíveis para doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-002 - Pesquisar e visualizar equipamentos disponíveis para doação. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 3: Caso de teste 3

| **Caso de Teste** | **CT03 – Cadastrar-se como usuário (doador ou receptor)** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-003 - Cadastrar-se como usuário (doador ou receptor). |
| Evidência do teste (backend)    | [Vídeo](video/Teste3_BE.webm) |
| Evidência do teste (frontend)   | [Vídeo](video/Teste3_FE.mp4) |
| Status                          | Aprovado |

[Teste3_BE.webm](https://github.com/user-attachments/assets/e3cf9eed-9c8f-4c96-9d06-4588176311ba)

[Teste3_FE.mp4](https://github.com/user-attachments/assets/485fc405-2c12-4520-bcf6-6538c32da461)

<div align="justify">

## Resultado dos testes

### Backend

Pode-se observar que foi possível o cadastro de um novo usuário, com seu email e senha, bem como o cadastro de uma nova conta, com todos os seus atributos, via endpoints de criação de usuário (`http://localhost:8080/rest/v1/user`) e conta (`http://localhost:8080/rest/v1/account`). A criação de uma conta na plataforma passa por essas duas etapas, criação de usuário e, após, criação da conta com a referência ao usuário criado anteriormente.

### Frontend

Com a inserção de um e-mail e senha válidos, sendo a senha confirmada em 2 caixas de texto, o formulário se torna válido e o botão Continuar é habilitado para o clique e submissão das informações pelo usuário. O Frontend então transforma essas informações num objeto, e o insere no corpo de uma requisição POST ao endpoint `http://localhost:8080/rest/v1/user` do Backend, para criação do usuário. O Backend responde com sucesso, o id do usuário criado e um segundo formulário, para criação da conta. O usuário insere suas informações e opções, que são validadas, e o botão Finalizar Cadastro se torna habilitado. Por fim, o usuário submete na mesma lógica anterior, e executa uma requisição POST com todas as informações, mais o id de usuário anteriormente criado, ao endpoint `http://localhost:8080/rest/v1/account`, criando-se a conta vinculada a esse usuário. Por fim, redireciona o usuário à página de login.

</div>

<hr>
<br>

Tabela 4: Caso de teste 4

| **Caso de Teste** | **CT04 – Verificar email após cadastro** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-004 - Verificar email após cadastro. |
| Evidência do teste (backend)    | [Vídeo](img/Teste4_BE.webm) |
| Evidência do teste (frontend)   | Não testado (não há tela) |
| Status                          | Aprovado |
 
[Teste4_BE.webm](https://github.com/user-attachments/assets/9ea5f64f-68f6-4a80-8fc6-acdd6a436784)

<div align="justify">

## Resultado dos testes

### Backend

É possível observar que, após a criação da conta, a segunda etapa no fluxo de criação de perfil na plataforma, o usuário recebeu um email de boas vindas em seu email cadastrado na criação do usuário.

### Frontend

Não há testes para este caso de testes na aplicação web frontend.

</div>

<hr>
<br>

Tabela 5: Caso de teste 5

| **Caso de Teste** | **CT05 – Autenticar-se no sistema** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-005 - Autenticar-se no sistema. |
| Evidência do teste (backend)    | [Vídeo](video/Teste5_BE.webm) |
| Evidência do teste (frontend)   | [Vídeo](video/Teste5_FE.mp4) |
| Status                          | Aprovado |

[Teste5_BE.webm](https://github.com/user-attachments/assets/02270172-5c8f-4765-b015-9205d02753ec)

[Teste5_FE.mp4](https://github.com/user-attachments/assets/8fbf2eb9-730a-4a37-a069-531144740367)

<div align="justify">

 ## Resultado dos testes

### Backend

É possível observar que, utilizando o endpoint de login (`http://localhost:8080/rest/v1/user/login`) com as credenciais corretas, a aplicação retorna um token para acesso à endpoints protegidos, bem como os dados do usuário, como seu id e email (excluindo o hash da senha). Isso reduz as chamadas que o *client* (frontend) precisa fazer para recuperar a conta, após o login, com o id do usuário.

### Frontend

O usuário insere seu usuário e senha num formulário, o botão Entrar é habilitado e uma requisição POST é realizada para o endpoint de login (`http://localhost:8080/rest/v1/user/login`). Com o sucesso, a response traz o token de autorização e informações do usuário que são armazenadas na session storage. A partir deste ponto, o Frontend através de um middleware interceptador HTTP vai ler todas as requisições realizadas pela aplicação e adicionar o token de autorização ao seu cabeçalho. Imediatamente uma requisição GET ao endpoint `http://localhost:8080/rest/v1/account/user/:userId` é realizada, obtêm-se as informações da conta, que também são armazenadas na session storage. A partir daqui, o usuário poderá acessar um endpoint privado, como o GET a `http://localhost:8080/rest/v1/account/:accountId`, ao acessar a seção 'Meu Perfil'.

</div>

<hr>
<br>

Tabela 6: Caso de teste 6

| **Caso de Teste** | **CT06 – Recuperar senha** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-006 - Recuperar senha. |
| Evidência do teste (backend)    | [Vídeo](video/Teste6_BE.webm) |
| Evidência do teste (frontend)   | [Vídeo](video/Teste6_FE.webm) |
| Status                          | Aprovado |

[Teste6_BE.webm](https://github.com/user-attachments/assets/7783b407-8e3a-4df9-9cf5-e6cb3980dfe4)

[Teste6_FE.webm](https://github.com/user-attachments/assets/8167ae17-83da-4650-8440-b500060afe16)

<div align="justify">

## Resultado dos testes

### Backend

Ao solicitar a recuperação de senha (`http://localhost:8080/rest/v1/user/recover`), como a senha é salva em hash e não criptografada, a aplicação cria uma senha temporária aleatória e a envia ao email cadastrado do usário, como é possível observar na evidência do teste anexada.

### Frontend

Foi possível solicitar a recuperação de senha. Uma nova senha é enviada por email, enquanto a tela mostra informações sobre como prosseguir com a recuperação após a chegada do email.

</div>

<hr>
<br>

Tabela 7: Caso de teste 7

| **Caso de Teste** | **CT07 – Enviar documentação para validação de cadastro** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-007 - Enviar documentação para validação de cadastro. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 8: Caso de teste 8

| **Caso de Teste** | **CT08 – Editar informações do próprio perfil** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-008 - Editar informações do próprio perfil. |
| Evidência do teste (backend)    | [Vídeo](video/Teste8_BE.webm) |
| Evidência do teste (frontend)   | [Vídeo](video/Teste8_FE.mp4) |
| Status                          | Aprovado |

[Teste8_BE.webm](https://github.com/user-attachments/assets/698e523b-5570-4623-be0e-63258fb745c3)

[Teste8_FE.mp4](https://github.com/user-attachments/assets/73fa1c26-8516-4d91-a4b1-df7518abfb29)

<div align="justify">

## Resultado dos testes

### Backend

É possível observar que a conta foi editada com sucesso (`http://localhost:8080/rest/v1/account/:accountId`). Podemos observar a troca do nome `Felipe Lunkes` para `Felipe Nery` no teste realizado. Ao recuperar a conta pelo seu id (`http://localhost:8080/rest/v1/account/:accountId`), podemos observar que a mudança foi persistida na base de dados.

### Frontend

Na rota '/profile', acessível para usuários logados, apresenta a seção 'Meu Perfil', em que se pode ler as informações de usuário, somente leitura, e as informações de conta, editáveis. Ao realizar uma edição válida, o botão Salvar continua habilitado. Ao clicar, é realizada uma requisição PUT a `http://localhost:8080/rest/v1/account/:accountId` com todas as informações preenchidas, mesmo as não modificadas. O sucesso é obtido na response e o formulário permanece atualizado e disponível para posteriores edições.

</div>

<hr>
<br>

Tabela 9: Caso de teste 9

| **Caso de Teste** | **CT09 – Cadastrar, editar e remover equipamentos para doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-009 - Cadastrar, editar e remover equipamentos para doação. |
| Evidência do teste (backend)    | [Vídeo](videos/Teste9_BE.webm) |
| Evidência do teste (frontend)   | [Vídeo](videos/Teste9_FE.webm) |
| Status                          | Aprovado |

[Teste9_BE.webm](https://github.com/user-attachments/assets/54f3a225-a9f9-4628-a5a6-bedd15a84a39)

[Teste9_FE.webm](https://github.com/user-attachments/assets/7a9fb199-42d7-48d6-938c-996d42d7bcb3)

<div align="justify">

## Resultado dos testes

### Backend

No teste, dois equipamentos foram criados. O primeiro, após a criação, teve seu status de disponibilidade alterado para `cancelado`. Isso torna o equipamento não disponível e inacessível. Neste caso, é feita uma remoção lógica, apenas utilizado uma coluna indicando que o equipamento não está mais disponível. Desta forma, ao tentar encontrar o equipamento pelo id, recebemos um erro 404. No segundo caso, o status permaneceu como `disponível`. Desta forma, foi possível obter o equipamento pelo seu id.

### Frontend

Foi possível cadastrar, editar e remover um equipamento para adição. A remoção do equipamento de forma total só pode ser feita por usuários administradores. Enquanto isso, o usuário pode cancelar o processo de doação de seu equipamento.

</div>

<hr>
<br>

Tabela 10: Caso de teste 10

| **Caso de Teste** | **CT10 – Aceitar solicitações de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-010 - Aceitar solicitações de doação. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Aprovado |

<div align="justify">

## Resultado dos testes

### Backend


### Frontend

</div>

<hr>
<br>

Tabela 11: Caso de teste 11

| **Caso de Teste** | **CT011 – Solicitar doação de equipamentos cadastrados** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-011 - Solicitar doação de equipamentos cadastrados. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Aprovado |

<div align="justify">

## Resultado dos testes

### Backend


### Frontend

</div>

<hr>
<br>

Tabela 12: Caso de teste 12

| **Caso de Teste** | **CT12 – Visualizar e filtrar cadastros de usuários não validados** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-012 - Visualizar e filtrar cadastros de usuários não validados. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 13: Caso de teste 13

| **Caso de Teste** | **CT13 – Visualizar documentos enviados pelos usuários** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-013 - Visualizar documentos enviados pelos usuários. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 14: Caso de teste 14

| **Caso de Teste** | **CT14 – Aprovar ou reprovar validação de cadastros de usuários** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-014 - Aprovar ou reprovar validação de cadastros de usuários. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 15: Caso de teste 15

| **Caso de Teste** | **CT15 – Gerenciar equipamentos cadastrados para doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-015 - Gerenciar equipamentos cadastrados para doação. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 16: Caso de teste 16

| **Caso de Teste** | **CT16 – Gerenciar processos de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-016 - Gerenciar processos de doação. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 17: Caso de teste 17

| **Caso de Teste** | **CT17 – Gerar relatórios de auditoria de doações por período** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-017 - Gerar relatórios de auditoria de doações por período. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 18: Caso de teste 18

| **Caso de Teste** | **CT18 – Gerar relatórios de usuários doadores e equipamentos doados** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-018 - Gerar relatórios de usuários doadores e equipamentos doados. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 19: Caso de teste 19

| **Caso de Teste** | **CT19 – Gerar relatórios de usuários receptores e equipamentos recebidos** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-019 - Gerar relatórios de usuários receptores e equipamentos recebidos. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 20: Caso de teste 20

| **Caso de Teste** | **CT50 – Acompanhar processos de doação através de timeline** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-020 - Acompanhar processos de doação através de timeline. |
| Evidência do teste (backend)    | [Vídeo](video/Teste20_BE.webm) |
| Evidência do teste (frontend)   | Não testado (não há tela) |
| Status                          | Aprovado |

[Teste20_BE.webm](https://github.com/user-attachments/assets/bdf64748-8e73-44d1-abd7-f080d48448fe)

<div align="justify">

## Resultado dos testes

### Backend

Foi possível criar um novo processo de doação e recuperá-lo corretamente.

### Frontend

No momento, não há tela para este recurso nesta iteração do DoeTech.

</div>

<hr>
<br>

Tabela 21: Caso de teste 21

| **Caso de Teste** | **CT21 – Autorizar exibição de doações finalizadas como iniciativas de sucesso** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-021 - Autorizar exibição de doações finalizadas como iniciativas de sucesso. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 22: Caso de teste 22

| **Caso de Teste** | **CT22 – Enviar mensagens no chat do processo de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-022 - Enviar mensagens no chat do processo de doação. |
| Evidência do teste (backend)    | [Vídeo](videos/Teste22_BE.webm) |
| Evidência do teste (frontend)   | Não testado (não há tela) |
| Status                          | Aprovado |

[Teste22_BE.webm](https://github.com/user-attachments/assets/8029fe83-ff2a-429c-b79e-28e505e8b716)

<div align="justify">

## Resultado dos testes

### Backend

Usando os endpoints de criação de chat e criação de mensagens, foi possível criar um novo chat e criar uma nova mensagem.

### Frontend

No momento, não há tela para este recurso nesta iteração do DoeTech.

</div>

<hr>
<br>

Tabela 23: Caso de teste 23

| **Caso de Teste** | **CT23 – Receber notificações sobre atualizações em processos de doação e mensagens** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-023 - Receber notificações sobre atualizações em processos de doação e mensagens. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 24: Caso de teste 24

| **Caso de Teste** | **CT24 – Receber notificações sobre solicitações de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-024 - Receber notificações sobre solicitações de doação. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 25: Caso de teste 25

| **Caso de Teste** | **CT25 – Receber notificações sobre aceitação de solicitações** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-025 - Receber notificações sobre aceitação de solicitações. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

Tabela 26: Caso de teste 26

| **Caso de Teste** | **CT26 – Moderar chats de processos de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-026 - Moderar chats de processos de doação. |
| Evidência do teste (backend)    | Não testado |
| Evidência do teste (frontend)   | Não testado |
| Status                          | Não testado |

<div align="justify">

## Resultado dos testes

### Backend

### Frontend

</div>

<hr>
<br>

<div align="justify">

## Relatório de testes de software

### Resultados obtidos

Neste momento, foram testadas as funcionalidades relacionadas à criação de usuários e contas, bem como autenticação e controle de acesso, com endpoints protegidos que dependem de tokens para serem acessados. Além disso, foi validado o envio de email na criação de uma nova conta e na recuperação de senha do usuário (**RF-003**, **RF-004**, **RF-005**, **RF-006** e **RF-008**).

### Pontos fortes

Como pontos fortes identificados ao testar as funcionalidades já implementadas, temos:

* Facilidade em implementar os CRUDs necesários para a aplicação, tanto pela implementação das classes `Controller` como configurações relativas ao banco de dados utilizado;
* Facilidade na implementação de políticas de segurança e autenticação, como hash de senha e proteção de endpoints nas classes `Controller`, que dependem de um token para serem acessados;
* Possibilidade de integração da aplicação C# com outros serviços, como Brevo, para envio de emails para os usuários;

Com os testes, pode-se perceber que a aplicação C# desenvolvida é robusta e segura. O uso do Entity Framework facilitou a implementação de uma inerface com o banco de dados, tornando a configuração inicial extremamente rápida, bem como a construção das classes `Model`. O ASP.NET Core, bem como outros pacotes, facilitam a implementação de endpoints que necessitam de autenticação nas classes `Controller`.

### Pontos negativos

* Foram encontrados bugs ou falhas de validação em regras de negócio, como possibilidade de criação de mais de uma conta por usuário e apagar um usuário indevidamente quando este já tem uma conta vinculada;

Esse tipo de problema encontrado nos testes poderia ser evitado ao implementar suítes de testes, como testes unitários e de integração.

# Estratégias de melhoria contínua

Para evitar a persistência de *bugs* após a etapa de implementação, temos como estratégia a criação de testes unitários, de integração e ponta a ponta que garantam o comportamento esperado da aplicação. Neste momento, a aplicação não conta com testes unitários, que poderiam detectar problemas que foram identificados nos testes descritos no [plano de testes de software](./08-Plano%20de%20Testes%20de%20Software.md).

<!--

Apresente e discuta detalhadamente os resultados obtidos nos testes realizados, destacando tanto os pontos fortes quanto as fragilidades identificadas na solução. Explique como os aspectos positivos contribuem para o desempenho e a usabilidade do sistema, e como os pontos fracos impactam sua eficácia.

Descreva as principais falhas detectadas durante os testes, fornecendo exemplos concretos e evidências que sustentem essas observações. Explicite os impactos dessas falhas na experiência do usuário, na funcionalidade do sistema e nos objetivos do projeto.


Por fim, apresente e/ou proponha as melhorias a partir dos testes realizados, destacando os ganhos obtidos e como essas alterações contribuem para a evolução do projeto.

> **Links Úteis**:
> - [Ferramentas de Test para Java Script](https://geekflare.com/javascript-unit-testing/)

-->

</div>
