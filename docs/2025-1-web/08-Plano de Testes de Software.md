# Plano de Testes de Software

Além dos testes manuais descritos nessa seção, espera-se uma alta cobertura de testes unitários na aplicação backend, garantindo o funcionamento esperado e aplicação das regas de negócio. Assim como testes unitários, testes de integração devem ser desenvolvidos para garantir o funcionamento da aplicação backend de ponta a ponta, incluindo as operações de banco.

## Casos de teste

<div align="center">

Tabela 1: Caso de teste 1

| **Caso de Teste** | **CT01 – Visualizar landing-page com informações institucionais, FAQs e iniciativas de sucesso** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-001 - Visualizar landing-page com informações institucionais, FAQs e iniciativas de sucesso. |
| Objetivo do Teste     | Verificar se o usuário consegue visualizar informações institucionais, FAQs e iniciativas de sucesso. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web. |
| Critério de Êxito     | As informações foram disponibilizadas e estão acessíveis. |

<hr>
<br>

Tabela 2: Caso de teste 2

| **Caso de Teste** | **CT02 – Pesquisar e visualizar equipamentos disponíveis para doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-002 - Pesquisar e visualizar equipamentos disponíveis para doação. |
| Objetivo do Teste     | Verificar se o usuário consegue visualizar uma lista de todos os equipamentos disponíveis. |
| Componente do projeto | Aplicação web frontend e endpoint disponibilizado pelo Backend (via Postman). |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Fazer login; <br> - Clicar no botão de equipamentos disponíveis; <br> - Fazer requisição GET no endpoint de listagem de equipamentos disponíveis. |
| Critério de Êxito     | As informações foram disponibilizadas e estão acessíveis. |

<hr>
<br>

Tabela 3: Caso de teste 3

| **Caso de Teste** | **CT03 – Cadastrar-se como usuário (doador ou receptor)** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-003 - Cadastrar-se como usuário (doador ou receptor). |
| Objetivo do Teste     | Verificar se o usuário consegue de cadastrar na plataforma, como doador ou receptor. |
| Componente do projeto | Aplicação web frontend e endpoint disponibilizado pelo backend (via Postman) |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de cadastro; <br> - Preencher formulário; <br> - Fazer requisição POST no endpoint de registro de usuário. Utilizar o UUID do usuário criado e fazer uma requisição POST de registro de conta. |
| Critério de Êxito     | Foi possível criar uma conta para usuários doadores ou receptores. |

<hr>
<br>


Tabela 4: Caso de teste 4

| **Caso de Teste** | **CT04 – Verificar email após cadastro** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-004 - Verificar email após cadastro. |
| Objetivo do Teste     | Verificar email após cadastro. |
| Componente do projeto | Email da conta cadastrada |
| Passos                | - Verificar se um email de confirmação foi enviado. |
| Critério de Êxito     | Foi possível validar o email. |
 
<hr>
<br>

Tabela 5: Caso de teste 5

| **Caso de Teste** | **CT05 – Autenticar-se no sistema** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-005 - Autenticar-se no sistema. |
| Objetivo do Teste     | Verificar se o usuário consegue se autenticar na plataforma. |
| Componente do projeto | Aplicação web frontend e endpoint disponibilizado pelo backend (via Postman) |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login; <br> - Informar credenciais e confirmar; <br> - Fazer requisição POST no endpoint de login com as credenciais (email e senha). |
| Critério de Êxito     | Foi possível se autenticar via aplicação web e obter retorno de autenticação via endpoint. |

<hr>
<br>

Tabela 6: Caso de teste 6

| **Caso de Teste** | **CT06 – Recuperar senha** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-006 - Recuperar senha. |
| Objetivo do Teste     | Verificar se o usuário consegue recuperar senha. |
| Componente do projeto | Aplicação web frontend e endpoint disponibilizado pelo backend (via Postman) |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login; <br> - Clicar em "Esqueci minha senha" e preecher o formulário; <br> - Fazer requisição POST no endpoint de recuperação de senha para o email. |
| Critério de Êxito     | Foi possível recuperar a senha do usuário. |

<hr>
<br>

Tabela 7: Caso de teste 7

| **Caso de Teste** | **CT07 – Enviar documentação para validação de cadastro** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-007 - Enviar documentação para validação de cadastro. |
| Objetivo do Teste     | Permitir que o usuário envie documentos PDF para a aplicação para validação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de cadastro; <br> - Clicar em "Enviar documentação" e anexar documentos em PDF. |
| Critério de Êxito     | Foi possível anexar documentos em PDF. |

<hr>
<br>

Tabela 8: Caso de teste 8

| **Caso de Teste** | **CT8 – Editar informações do próprio perfil** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-008 - Editar informações do próprio perfil. |
| Objetivo do Teste     | Editar informações do próprio perfil. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login <br> - Acessar perfil. <br> - Selecionar "Editar" |
| Critério de Êxito     | Foi possível editar informações do próprio perfil. |

<hr>
<br>

Tabela 9: Caso de teste 9

| **Caso de Teste** | **CT09 – Cadastrar, editar e remover equipamentos para doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-009 - Cadastrar, editar e remover equipamentos para doação. |
| Objetivo do Teste     | Permitir que o usuário cadastre e gerencie equipamentos. |
| Componente do projeto | Aplicação web frontend e e endpoint disponibilizado pelo backend (via Postman)|
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login; <br> - Clicar em "Meus equipamentos" e alterar dados; <br> - clicar em "Salvar"; <br> - Fazer requisições aos endpoints do backend. |
| Critério de Êxito     | Foi possível gerenciar os equipamentos. |

<hr>
<br>


Tabela 10: Caso de teste 10

| **Caso de Teste** | **CT10 – Aceitar solicitações de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-0100 - Aceitar solicitações de doação. |
| Objetivo do Teste     | Permitir aceitar o processo de doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login e se registrar como usuário administrador; <br> - Clicar em "Ver linha do tempo de doações". |
| Critério de Êxito     | Foi possível aceitar um processo de doação. |

<hr>
<br>

Tabela 11: Caso de teste 11

| **Caso de Teste** | **CT11 – Solicitar doação de equipamentos cadastrados** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-011 - Solicitar doação de equipamentos cadastrados. |
| Objetivo do Teste     | Permitir solicitar uma doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Selecioanr um equipamento disponível na tela de equipamentos disponíveis e iniciar uma nova requisição de doação. |
| Critério de Êxito     | Foi possível iniciar uma nova requisição. |

<hr>
<br>

Tabela 12: Caso de teste 12

| **Caso de Teste** | **CT12 – Visualizar e filtrar cadastros de usuários não validados** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-012 - Visualizar e filtrar cadastros de usuários não validados. |
| Objetivo do Teste     | Visualizar usuários com documentação não validada. |
| Componente do projeto | Aplicação web frontend e e endpoint disponibilizado pelo backend (via Postman) |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de validação de usuário e selecionar os usuários não validados. <br> - Fazer requisição GET ao endpoint de contas com filtro de usuários não validados. |
| Critério de Êxito     | Foi possível visualizar apenas os usuários não validados. |

<hr>
<br>

Tabela 13: Caso de teste 13

| **Caso de Teste** | **CT13 – Visualizar documentos enviados pelos usuários** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-013 - Visualizar documentos enviados pelos usuários. |
| Objetivo do Teste     | Visualizar documentos enviados pelos usuários. |
| Componente do projeto | Aplicação web frontend e e endpoint disponibilizado pelo backend (via Postman) |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de validação de usuário e selecionar os usuários não validados. <br> - Acessar usuário <br> - Selecionar opção de ver documentação enviada <br> - Fazer requisição GET ao endpoint de obtenção de binário no S3 utilizando o id da conta no path. |
| Critério de Êxito     | Foi possível visualizar o documento de um usuário cadastrado. |

<hr>
<br>

Tabela 14: Caso de teste 14

| **Caso de Teste** | **CT14 – Aprovar ou reprovar validação de cadastros de usuários** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-014 - Aprovar ou reprovar validação de cadastros de usuários. |
| Objetivo do Teste     | Aprovar ou reprovar validação de cadastros de usuários. |
| Componente do projeto | Aplicação web frontend e e endpoint disponibilizado pelo backend (via Postman) |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de validação de usuário e selecionar os usuários não validados. <br> - Acessar usuário <br> - Selecionar opção de ver documentação enviada <br> - Selecionar se o usuário está ou não validao <br> - Fazer requisição POST ao endpoint de validação de usuário utilizando o id da conta no path (/valid ou /invalid). |
| Critério de Êxito     | Foi possível registrar se um usuário é ou não válido. |

<hr>
<br>

Tabela 15: Caso de teste 15

| **Caso de Teste** | **CT15 – Gerenciar equipamentos cadastrados para doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-015 - Gerenciar equipamentos cadastrados para doação. |
| Objetivo do Teste     | Gerenciar equipamentos cadastrados para doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de equipamentos cadastrados. <br> - Acessar equipamento <br> - Clicar em "Editar" para poder editar um equipamento |
| Critério de Êxito     | Foi possível visualizar e editar um equipamento. |

<hr>
<br>

Tabela 16: Caso de teste 16

| **Caso de Teste** | **CT16 – Gerenciar processos de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-016 - Gerenciar processos de doação. |
| Objetivo do Teste     | Gerenciar processos de doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de Processos de doação. <br> - Acessar um processo <br> - Clicar em "Editar" para poder editar um equipamento |
| Critério de Êxito     | Foi possível visualizar e editar um processo de doação. |

<hr>
<br>

Tabela 17: Caso de teste 17

| **Caso de Teste** | **CT17 – Gerar relatórios de auditoria de doações por período** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-017 - Gerar relatórios de auditoria de doações por período. |
| Objetivo do Teste     | Gerar relatórios de auditoria de doações por período. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de Relatórios. <br> - Solicitar um relatório de doações por período |
| Critério de Êxito     | Foi possível obter um relatório de doações em um período determinado. |

<hr>
<br>

Tabela 18: Caso de teste 18

| **Caso de Teste** | **CT18 – Gerar relatórios de usuários doadores e equipamentos doados** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-018 - Gerar relatórios de usuários doadores e equipamentos doados. |
| Objetivo do Teste     | Gerar relatórios de usuários doadores e equipamentos doados. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de Relatórios. <br> - Solicitar um relatório de usuários doadores e equipamentos doados |
| Critério de Êxito     | Foi possível obter um relatório de usuários doadores e equipamentos doados, por período. |

<hr>
<br>

Tabela 19: Caso de teste 19

| **Caso de Teste** | **CT19 – Gerar relatórios de usuários receptores e equipamentos recebidos** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-019 - Gerar relatórios de usuários receptores e equipamentos recebidos. |
| Objetivo do Teste     | Gerar relatórios de usuários receptores e equipamentos recebidos. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Encontrar sessão de Relatórios. <br> - Solicitar um relatório de usuários receptores e equipamentos recebidos |
| Critério de Êxito     | Foi possível obter um relatório de usuários receptores e equipamentos recebidos, por período. |

<hr>
<br>

Tabela 20: Caso de teste 20

| **Caso de Teste** | **CT20 – Acompanhar processos de doação através de timeline** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-020 - Acompanhar processos de doação através de timeline. |
| Objetivo do Teste     | Acompanhar processos de doação através de timeline. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de login <br> - Fazer login como usuário administrador <br> - Acessar timeline de doações. |
| Critério de Êxito     | Foi possível acompanhar processos de doação pela timeline. |

<hr>
<br>

Tabela 21: Caso de teste 21

| **Caso de Teste** | **CT21 – Autorizar exibição de doações finalizadas como iniciativas de sucesso** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-021 - Autorizar exibição de doações finalizadas como iniciativas de sucesso. |
| Objetivo do Teste     | Autorizar exibição de doações finalizadas como iniciativas de sucesso. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Clicar no botão de Cadastro <br> - Preecher os dados como usuário doador <br> - Selecionar se deseja ou não compartilhar dados para fins de publicidade do DoeTech. |
| Critério de Êxito     | Foi possível autorizar ou não o uso de dados para fins publicitários. |

<hr>
<br>

Tabela 22: Caso de teste 22

| **Caso de Teste** | **CT22 – Enviar mensagens no chat do processo de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-022 - Enviar mensagens no chat do processo de doação. |
| Objetivo do Teste     | Enviar mensagens no chat do processo de doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Fazer login <br> - Acessar seus processos de doação em aberto OU acessar a lista de equipamentos, selecioanr um e clicar em "Chat com doador" <br> - Enviar uma mensagem. |
| Critério de Êxito     | Foi possível enviar mensagem em chat para outro usuário. |

<hr>
<br>

Tabela 23: Caso de teste 23

| **Caso de Teste** | **CT23 – Receber notificações sobre atualizações em processos de doação e mensagens** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-023 - Receber notificações sobre atualizações em processos de doação e mensagens. |
| Objetivo do Teste     | Receber notificações sobre atualizações em processos de doação e mensagens. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Fazer login <br> - Acessar suas notificações <br> - Verificar se existem notificações não lidas após o início do processo de doação. |
| Critério de Êxito     | Foi possível receber notificações. |

<hr>
<br>

Tabela 24: Caso de teste 24

| **Caso de Teste** | **CT24 – Receber notificações sobre solicitações de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-024 - Receber notificações sobre solicitações de doação. |
| Objetivo do Teste     | Receber notificações sobre solicitações de doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Fazer login como usuário doador <br> - Acessar suas notificações <br> - Verificar se existem notificações não lidas após o início do processo de doação por um usuário receptor. |
| Critério de Êxito     | Foi possível receber notificações. |

<hr>
<br>

Tabela 25: Caso de teste 25

| **Caso de Teste** | **CT25 – Receber notificações sobre aceitação de solicitações** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-025 - Receber notificações sobre aceitação de solicitações. |
| Objetivo do Teste     | Receber notificações sobre aceitação de solicitações. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Fazer login como usuário receptor <br> - Acessar suas notificações <br> - Verificar se existem notificações não lidas após o o aceite do início do processo de doação. |
| Critério de Êxito     | Foi possível receber notificações. |

<hr>
<br>

Tabela 26: Caso de teste 26

| **Caso de Teste** | **CT26 – Moderar chats de processos de doação** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-026 - Moderar chats de processos de doação. |
| Objetivo do Teste     | Moderar chats de processos de doação. |
| Componente do projeto | Aplicação web frontend |
| Passos                | - Acessar a página inicial da aplicação web; <br> - Fazer login como usuário administrador <br> - Acessar sessão de moderação <br> - Acessar a listagem de chats entre contas. <br> - Selecionar um chat. <br> - Apagar uma mensagem |
| Critério de Êxito     | Foi possível moderar um chat. |

<hr>
<br>

</div>