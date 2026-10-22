# Plano de Testes de Usabilidade

<div align="justify">

## Introdução

Os testes de usabilidade são fundamentais para avaliar a qualidade da interface com o usuário da aplicação DoeTech. Este plano foi estruturado conforme as diretrizes da NBR 13596 para usabilidade, focando em inteligibilidade, apreensibilidade e operacionalidade da interface móvel.

## Definição dos Objetivos

O objetivo principal é avaliar a experiência do usuário na plataforma DoeTech, identificando problemas de usabilidade e oportunidades de melhoria.

### Objetivos Principais

- Validar fluxos principais da interface implementada;
- Identificar problemas de navegação e interação;
- Aplicar técnicas de coleta de dados qualitativos e quantitativos;
- Produzir relatório com achados e recomendações;

### Objetivos Secundários

- Aplicar técnicas de observação de usuários;
- Usar questionários pós-teste;
- Exercitar análise de dados de usabilidade;
- Desenvolver documentação de testes.

## Seleção dos Participantes

### Critérios de Seleção

**Perfil Doadores (2 participantes):**

- Representantes de empresas ou pessoas físicas;
- Experiência variada com tecnologia;
- Disponibilidade para teste de 30 minutos.

**Perfil Receptores (2 participantes):**

- Estudantes universitários ou pessoas interessadas;
- Usuários de dispositivos móveis;
- Interessados em tecnologia sustentável.

### Quantidade e Recrutamento

- **Total**: 4-5 participantes;
- **Recrutamento**: Rede de contatos e indicações;
- **Compensação**: Não aplicável.

## Cenários de Teste

### Cenário 1 - Cadastro Básico (doador)

**Objetivo:** Avaliar facilidade do processo de cadastro.

**Contexto:** Maria precisa se cadastrar como doadora na aplicação.

**Tarefas:**

- Abrir a aplicação DoeTech;
- Criar conta como doadora;
- Preencher informações básicas;
- Completar cadastro.

**Critérios de Sucesso:**

- Cadastro realizado sem assistência;
- Máximo 2 dúvidas durante o processo;
- Usuário compreende próximos passos.

### Cenário 2 - Busca de Equipamento (Receptor)

**Objetivo:** Testar funcionalidade de busca e navegação.

**Contexto:** João busca um computador disponível para doação.

**Tarefas:**

- Fazer login na aplicação;
- Buscar por "computador";
- Visualizar resultados;
- Acessar detalhes de um equipamento.

**Critérios de Sucesso:**

- Equipamento encontrado em menos de 3 minutos;
- Interface compreensível;
- Navegação intuitiva.

### Cenário 3 - Interface Administrativa

**Objetivo:** Validar clareza da interface admin.

**Contexto:** Admin precisa acessar lista de validações.

**Tarefas:**

- Fazer login como administrador;
- Navegar para área administrativa;
- Localizar funcionalidades principais.

**Critérios de Sucesso:**

- Área administrativa identificada facilmente;
- Funcionalidades visíveis e organizadas.

## Seleção dos Participantes

### Critérios de Seleção

**Perfil Doadores (4 participantes):**

- Representantes de empresas ou pessoas físicas com equipamentos para doar;
- Faixa etária: 25-55 anos;
- Experiência variada com tecnologia (iniciante a avançado);
- Diferentes setores empresariais (tecnologia, educação, serviços).

**Perfil Receptores (4 participantes):**

- Estudantes universitários ou profissionais em transição de carreira;
- Representantes de instituições sem fins lucrativos;
- Faixa etária: 18-45 anos;
- Níveis socioeconômicos variados;
- Experiência com dispositivos móveis.

**Perfil Administradores (2 participantes):**

- Profissionais com experiência em gestão de plataformas;
- Conhecimento em processos de validação e auditoria;
- Familiaridade com ferramentas administrativas.

### Critérios de Exclusão

- Participantes que trabalham diretamente com desenvolvimento de software;
- Pessoas com deficiências visuais severas (para esta fase inicial);
- Participantes menores de 18 anos.

### Quantidade e Recrutamento

- **Total**: 10 participantes (conforme recomendação Nielsen para testes qualitativos);
- **Recrutamento**: Através de universidades, empresas parceiras e ONGs;
- **Compensação**: Vale-presente de R$ 50 por participação.

## Definição de Cenários de Teste

### Cenário 1 - Cadastro e Primeira Doação (Doador)

**Objetivo:** Avaliar a facilidade do processo de cadastro e primeira doação de equipamento.

**Contexto:** Maria é gestora de TI de uma empresa de marketing e precisa descartar 5 computadores que serão substituídos. Ela ouviu falar do DoeTech e quer doar os equipamentos ao invés de descartá-los.

**Tarefa(s):**

- Baixar e abrir a aplicação DoeTech;
- Criar conta como doadora empresarial;
- Verificar email e completar cadastro;
- Cadastrar o primeiro equipamento para doação;
- Adicionar fotos e especificações técnicas;
- Publicar a doação.

**Critério(s) de Sucesso:**

- Cadastro completo realizado em menos de 8 minutos;
- Equipamento cadastrado com todas as informações obrigatórias;
- Usuário consegue navegar sem assistência;
- Máximo 2 erros ou confusões durante o processo;
- Satisfação geral superior a 4/5 na escala Likert.

### Cenário 2 - Busca e solicitação de equipamento (receptor)

**Objetivo:** Avaliar a eficácia do sistema de busca e processo de solicitação.

**Contexto:** João é estudante de programação e precisa de um computador para estudos. Ele tem renda limitada e se qualifica para receber doações através do DoeTech.

**Tarefa(s):**
- Abrir aplicação já instalada;
- Fazer login com conta pré-criada;
- Buscar por "computador" na região de Belo Horizonte;
- Aplicar filtros (estado de conservação, especificações);
- Visualizar detalhes de um equipamento específico;
- Solicitar a doação justificando a necessidade;
- Verificar status da solicitação.

**Critério(s) de Sucesso:**
- Equipamento desejado encontrado em menos de 3 minutos;
- Filtros aplicados corretamente;
- Solicitação enviada com justificativa adequada;
- Usuário compreende o processo de aprovação;
- Interface responsiva em diferentes tamanhos de tela.

### Cenário 3 - Comunicação e coordenação de entrega

**Objetivo:** Testar a funcionalidade de chat e coordenação entre doador e receptor.

**Contexto:** Carlos (doador) recebeu uma solicitação para seu tablet e quer se comunicar com Ana (receptora) para combinar os detalhes da entrega.

**Tarefa(s):**
- Acessar notificação de nova solicitação;
- Revisar perfil da solicitante;
- Aceitar a solicitação;
- Iniciar conversa no chat integrado;
- Combinar local e horário de entrega;
- Confirmar entrega realizada.

**Critério(s) de Sucesso:**
- Chat carregado e funcionando em tempo real;
- Troca de mensagens clara e eficiente;
- Processo de coordenação intuitivo;
- Confirmação de entrega registrada corretamente;
- Histórico da conversa preservado.

### Cenário 4 - Validação de Documentação (Administrador)

**Objetivo:** Avaliar a interface administrativa para validação de usuários receptores.

**Contexto:** Michele é administradora do DoeTech e precisa validar documentações pendentes de novos receptores para garantir elegibilidade.

**Tarefa(s):**
- Fazer login no painel administrativo;
- Acessar lista de validações pendentes;
- Revisar documentação de um receptor;
- Analisar comprovantes de renda enviados;
- Tomar decisão (aprovar/reprovar) com justificativa;
- Enviar feedback para o usuário.

**Critério(s) de Sucesso:**
- Documentos carregados e visualizados claramente;
- Interface administrativa intuitiva;
- Processo de decisão claro e bem documentado;
- Feedback enviado adequadamente;
- Histórico de validações acessível.

### Cenário 5 - Visualização de Impacto e Relatórios

**Objetivo:** Testar a compreensão das métricas de impacto social da plataforma.

**Contexto:** Ricardo é gestor de uma empresa doadora e quer acompanhar o impacto das doações realizadas através do DoeTech para relatórios de responsabilidade social.

**Tarefa(s):**
- Acessar dashboard de doações realizadas;
- Visualizar timeline de doações concluídas;
- Acessar relatórios de impacto social;
- Filtrar dados por período específico;
- Exportar relatório em PDF;
- Compartilhar caso de sucesso.

**Critério(s) de Sucesso:**
- Dashboard carregado com dados precisos;
- Métricas apresentadas de forma clara e visual;
- Relatórios gerados sem erros;
- Processo de compartilhamento funcional;
- Informações relevantes para tomada de decisão.

## Métodos de Coleta de Dados

### Métricas Quantitativas

**Eficiência:**

- Tempo para completar cada tarefa;
- Número de cliques/toques necessários;
- Taxa de conclusão de tarefas;
- Número de erros cometidos.

**Eficácia:**

- Percentual de tarefas completadas com sucesso;
- Número de assistências solicitadas.

### Métricas Qualitativas

**Observação:**

- Hesitações e momentos de confusão;
- Comentários espontâneos durante execução;
- Expressões de frustração ou satisfação.

**Feedback Direto:**

- Questionário pós-teste simples (escala 1-5);
- Entrevista breve (5-10 minutos);
- Identificação de pontos positivos e negativos.

### Questionário Pós-Teste

**Escala de Satisfação (1-5):**

1. A interface foi fácil de entender?
2. Você encontrou dificuldades em alguma etapa?
3. O design é atrativo?
4. Você usaria esta aplicação?

**Perguntas Abertas:**

- O que mais gostou na aplicação?
- O que mais dificultou durante o uso?
- Que melhorias sugeriria?

## Protocolo de Execução

### Preparação (10 minutos)

- Boas-vindas e explicação do teste;
- Consentimento verbal para observação;
- Configuração do dispositivo;
- Explicação do "pensar alto".

### Execução (20-30 minutos)

- Execução dos 3 cenários principais;
- Observação e anotação de comportamentos;
- Intervenção mínima (apenas se travado).

### Encerramento (10 minutos)

- Questionário de satisfação;
- Feedback verbal sobre a experiência;
- Agradecimentos.

## Ambiente de Teste

### Configuração

- **Local**: Laboratório ou ambiente silencioso;
- **Dispositivos**: Smartphones disponíveis na equipe;
- **Registro**: Anotações manuais + observação direta;
- **Ferramentas**: Cronômetro, papel, caneta.

### Limitações do Escopo

**O que SERÁ avaliado:**

- Navegação da interface;
- Compreensão dos fluxos principais;
- Problemas evidentes de usabilidade;
- Satisfação geral dos usuários.

**O que NÃO será avaliado:**

- Eye-tracking ou métricas avançadas;
- Testes com grande número de participantes;
- Análise estatística complexa;
- Laboratório de usabilidade profissional;
- Gravação em vídeo profissional.

## Entregáveis

- Relatório executivo com principais descobertas (2-3 páginas);
- Lista de problemas identificados;
- Recomendações de melhoria;
- Reflexão sobre aplicação da metodologia.

</div>