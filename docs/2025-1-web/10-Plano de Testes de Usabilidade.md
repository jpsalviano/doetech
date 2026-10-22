# Plano de Testes de Usabilidade

## Definição dos objetivos

* Verificar a navegabilidade da interface inicial;
* Avaliar a eficiência dos processos de cadastro e autenticação;
* Testar a funcionalidade de cadastro de equipamentos pelos doadores;
* Avaliar a usabilidade da busca e solicitação de doações;
* Verificar a eficácia do sistema de comunicação entre usuários;
* Verificar se os usuários conseguem concluir tarefas essenciais sem dificuldades;
* Identificar barreiras na navegação e interação com o sistema;
* Avaliar a eficiência global e satisfação do usuário;
* Testar a acessibilidade para diferentes perfis de usuários;

<hr>

## Seleção dos participantes

Abaixo, selecionamos os perfis e público-alvo para os testes de usuabilidade da aplicação.

**Critérios para selecionar participantes:**

* Diversidade etária (foco em jovens e adultos);
* Diferentes níveis de familiaridade com tecnologia;
* Inclusão de pessoas com necessidades especiais;

**Quantidade recomendada:**

* Mínimo: 5 participantes.
* Ideal: Entre 8 e 12 para maior diversidade.

<hr>

## Privacidade e Lei Geral de Proteção de Dados (LGPD)

Todos os usuários devem ser informados que a coleta de dados será anonimizada e protegida nos termos da Lei Geral de Proteção de dados (LGPD). Isso significa que nenhum *feedback* será fornecido com dados pessoais aos participantes, e os dados da pesquisa não serão utilizados para outros fins, inclusive na própria plataforma.

<hr>

## Definição de cenários de teste

Os cenários de teste seguem o seguinte formato:

* **Objetivo**: O que será avaliado;
* **Contexto**: A situação que leva o usuário a interagir com o sistema;
* **Tarefa**: A ação que o usuário deve realizar;
* **Critério de sucesso**: Como determinar se a tarefa foi concluída corretamente;

<hr>

## Cenários de teste

### Cenário de teste 1: Navegação inicial

**Objetivo:** Avaliar a navegação na tela inicial, identificando as principais áreas de interação.

**Contexto:** Usuário busca informações sobre a plataforma DoeTech.

**Tarefas:**

* Acessar o site;
* Identificar a área de **"Sobre"** do DoeTech;
* Acessar informações sobre os objetivos da plataforma
* Localizar a seção de **casos de sucesso**.

**Critério de sucesso:**

* Conclusão em menos de 5 minutos sem assistência.

### Cenário de teste 2: Cadastro e autenticação

**Objetivo:** Avaliar a eficiência do processo de cadastro e login.

**Contexto:** Novo usuário deseja se registrar na plataforma.

**Tarefas:**

* Localizar e acessar a área de cadastro;
* Preencher formulário e finalizar registro;
* Realizar login com as credenciais criadas.

**Critérios de sucesso:**

* Conclusão em menos de 10 minutos sem assistência.

### Cenário de teste 3: Cadastro de equipamento para doação

**Objetivo:** Avaliar o processo de cadastro de item para doação.

**Contexto:** Usuário doador deseja disponibilizar um equipamento eletrônico.

**Tarefas:**

* Acessar área de cadastro de equipamentos após autenticação;
* Preencher formulário com informações do equipamento;
* Finalizar o registro do item.

**Critérios de sucesso:**

* Conclusão em menos de 15 minutos sem assistência.

### Cenário de teste 4: Busca de equipamentos disponíveis

**Objetivo:** Avaliar a funcionalidade de busca de equipamentos.

**Contexto:** Usuário receptor busca equipamentos disponíveis.

**Tarefas:**

* Localizar a seção de equipamentos disponíveis;
* Filtrar ou navegar pela listagem.

**Critérios de sucesso:**

* Localização de itens em menos de 5 minutos sem assistência.

### Cenário de teste 5: Solicitação de doação

**Objetivo:** Avaliar o processo de solicitação de equipamento.

**Contexto:** Usuário receptor identificou item de interesse.

**Tarefas:**

* Selecionar equipamento de interesse;
* Completar o processo de solicitação.

**Critérios de sucesso:**

* Conclusão da solicitação em menos de 5 minutos sem assistência.

### Cenário de teste 6: Comunicação entre usuários

**Objetivo:** Avaliar a funcionalidade de chat.

**Contexto:** Usuário precisa tirar dúvidas sobre equipamento/processo.

**Tarefas:**

* Localizar a área de **processos de doação**;
* Selecionar um processo de doação ativo;
* Iniciar conversa com a outra parte.

**Critérios de sucesso:**

* Envio de mensagem em menos de 5 minutos sem assistência.

### Cenário de teste 7: Sistema de notificações

**Objetivo:** Avaliar a acessibilidade e clareza das notificações.

**Contexto:** Usuário verifica atualizações no sistema.

**Tarefas:**

* Encontrar área de notificações;
* Interagir com uma notificação;
* Ser redirecionamento para o evento notificado.

**Critérios de sucesso:**

* Localização, interação e redirecionamento em menos de 5 minutos sem assistência.

<hr>

## Métodos de coleta de dados

O método de coleta de dados para o cenário de testes se baseia nas seguintes métricas:

* Quantidade de minutos gastos para executar as tarefas propostas;
* Quantidade de vezes em que uma assistência foi solicitada;
* Avaliação, de 0 a 5, para a facilidade na navegação da interface;
  - 0 para interface pouco intuitiva, 5 para interfacce intuitiva e fácil de compreender;
* Questões abertas, dissertativas, sobre a opinião do usuário sobre a experiência e sugestões para que sua nota na avaliação de usuabilidade chegue a 5, caso a nota seja menor. A experiência do usuário também diz respeito sobre problemas de acessibilidade encontrados durante a navegação ou na execução das tarefas propostas.

<!--
Os dados coletados devem ajudar a entender a experiência dos usuários e os dados podem ser coletados por observação direta incluindo métricas quantitativas (quantidade de cliques, número de erros, tempo gasto para cada tarefa etc.), métricas qualitativas (dificuldades, comentários etc.) e questionários pós-teste (A interface foi fácil de entender? Você encontrou dificuldades em alguma etapa? O que poderia ser melhorado?)

Para cada voluntário do teste, é fundamental coletar e apresentar todos os dados/métricas previamente definidos, mas não se esqueça: atendendo à LGPD (Lei Geral de Proteção de Dados), nenhum dado sensível, que permita identificar o voluntário, deverá ser apresentado).

As referências abaixo irão auxiliá-lo na geração do artefato "Plano de Testes de Usabilidade".

> **Links Úteis**:
> - [Teste De Usabilidade: O Que É e Como Fazer Passo a Passo (neilpatel.com)](https://neilpatel.com/br/blog/teste-de-usabilidade/)
> - [Teste de usabilidade: tudo o que você precisa saber! | by Jon Vieira | Aela.io | Medium](https://medium.com/aela/teste-de-usabilidade-o-que-voc%C3%AA-precisa-saber-39a36343d9a6/)
> - [Planejando testes de usabilidade: o que (e o que não) fazer | iMasters](https://imasters.com.br/design-ux/planejando-testes-de-usabilidade-o-que-e-o-que-nao-fazer/)
> - [Ferramentas de Testes de Usabilidade](https://www.usability.gov/how-to-and-tools/resources/templates.html)
-->
