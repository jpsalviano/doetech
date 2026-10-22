# Registro de Testes de Software

<div align="justify">

Este documento registra os testes realizados para cada caso de teste disponível [aqui](./08-Plano%20de%20Testes%20de%20Software.md).

## Casos de teste e resultados

<div align="center">

Tabela 1: Caso de teste 1

| **Caso de Teste** | **CT01 – Cadastrar usuário doador** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-003 - Cadastrar-se como usuário (doador ou receptor). |
| Evidência do teste (aplicação mobile) | [Vídeo](video/Teste1_FE.webm) |
| Status                          | Aprovado |

[Teste1_FE.webm](https://github.com/user-attachments/assets/0d4d8e30-0378-49b3-ab3e-5465ed9dfafe)

</div>

### Resultado dos testes

Foi possível criar um usuário (para autenticação) e conta pela aplicação mobile em React Native.

<hr>
<br>

<div align="center">

Tabela 2: Caso de teste 2

| **Caso de Teste** | **CT02 – Efetuar login** |
|:-----------------:|:---------------------------:|
| Requisito Associado   | RF-005 - Autenticar-se no sistema. |
| Evidência do teste (aplicação mobile) | [Vídeo](video/Teste2_FE.webm) |
| Status                          | Aprovado |

[Teste2_FE.webm](https://github.com/user-attachments/assets/59b168c9-fed8-4a40-9817-4340ef7c62c1)

</div>

### Resultado dos testes

Foi possível realizar o login após o cadastro.

<hr>
<br>

<div align="center">

Tabela 3: Caso de teste 3
 
| **Caso de Teste** | **CT03 – Cadastrar equipamento** |
|:---:|:---:|
| Requisito Associado | RF-009 - Cadastrar equipamentos para doação |
| Objetivo do Teste | Verificar se o doador consegue cadastrar um equipamento (fluxo principal). |
| Evidência do Teste (aplicação mobile) | [Video](video/Teste3_FE.mp4) |
| Critério de Êxito | - Equipamento cadastrado<br>- Equipamento visível na lista |
| Status                          | Aprovado |

[Teste3_FE.webm](https://github.com/user-attachments/assets/6d4ab77b-8862-41af-b0ee-31afcac3210e)

</div>

### Resultado dos testes

Foi possível cadastrar um equipamento pela aplicação mobile em React Native.

<hr>
<br>

<div align="center">

| **Caso de Teste** | **CT04 – Pesquisar equipamentos** |
|:---:|:---:|
| Requisito Associado | RF-002 - Pesquisar equipamentos disponíveis |
| Objetivo do Teste | Verificar se a busca de equipamentos funciona adequadamente. |
| Evidencia do Teste (aplicação mobile) | [Video](video/Teste4_FE.mp4) |
| Critério de Êxito | - Lista de equipamentos carregada<br>- Filtros funcionando |
| Status                          | Aprovado |

[Teste4_FE.webm](https://github.com/user-attachments/assets/482cefe4-1ad8-4b8c-8234-51b8095c805c)

</div>

### Resultado dos testes

Foi possível buscar um equipamento pela aplicação mobile em React Native.

<hr>
<br>

<div align="center">

| **Caso de Teste** | **CT05 – Solicitar doação** |
|:---:|:---:|
| Requisito Associado | RF-011 - Solicitar doação de equipamentos cadastrados |
| Objetivo do Teste | Verificar se receptor consegue solicitar equipamento. |
| Evidencia do Teste (aplicação mobile) | [Video](video/Teste5_FE.webm) |
| Status                          | Aprovado |

[Teste5_FE.webm](https://github.com/user-attachments/assets/514cd082-827e-4d17-85ed-0871ee23188c)

</div>

### Resultado dos testes

Foi possível solicitar uma doação.

<hr>
<br>

<div align="center">

| **Caso de Teste** | **CT06 – Aceitar solicitação** |
|:---:|:---:|
| Requisito Associado | RF-010 - Aceitar solicitações de doação |
| Objetivo do Teste | Verificar se doador consegue aceitar solicitação. |
| Evidencia do Teste (aplicação mobile) | [Video](video/Teste6_FE.webm) |
| Status                          | Aprovado |

[Teste6_FE.webm](https://github.com/user-attachments/assets/cbc10e43-dad0-409f-8ff0-1e90b7a651d1)

</div>

### Resultado dos testes

Foi possível aprovar um processo de doação.

## Resultados obtidos

> O caso de teste 7 não foi aplicado porque a implementação do chat na aplicação não foi executada.

### Pontos fortes

Como pontos fortes identificados ao testar as funcionalidades já implementadas, temos:

* Facilidade em implementar os CRUDs necesários para a aplicação após a padronização da interface e dos componentes utilizados;

Com os testes, pode-se perceber que a aplicação React native atende sos requisitos funcionais determinados para o projeto.

### Pontos negativos

* Foram encontrados bugs nos fluxo, que foram corrigidos pelo time de desenvolvimento. Esse tipo de problema encontrado nos testes poderia ser evitado ao implementar suítes de testes, como testes unitários e de integração.

# Estratégias de melhoria contínua

Para evitar a persistência de *bugs* após a etapa de implementação, temos como estratégia a criação de testes unitários, de integração e ponta a ponta que garantam o comportamento esperado da aplicação. Neste momento, a aplicação não conta com testes unitários, que poderiam detectar problemas que foram identificados nos testes descritos no [plano de testes de software](./08-Plano%20de%20Testes%20de%20Software.mdd).

</div>
