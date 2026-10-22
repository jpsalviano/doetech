# Considerações finais

<div align="justify">

## Aplicação web backend

Para apoiar a aplicação mobile em React Native, desenvolvemos uma aplicação web backend utilizando a linguagem **C#**, bem como **ASP.NET** e **Entity Framework**. Essa abordagem originou uma aplicação monolítica, porém bastante leve e funcional. Com base na aplicação desenvolvida, concluímos:

* O desenvolvimento de uma aplicação em C# é extremamente fácil, uma vez que o ASP.NET e o Entity Framework fornecem uma base sólida para um desenvolvimento simples e descomplicado;
* A portabilidade de base de dados, como foi necessário no projeto, foi extremamente rápida ao utilizar o Entity Framework. Apenas adicionar as dependências necessárias, configurar corretamente os dados da base e criar as migrações foi suficiente para portar a aplicação como um todo para a nova base. Nenhuma outra linha de código precisou ser alterada.

### Melhorias arquiteturais

Uma aplicação monolítica não permite escalabilidade horizontal em um ambiente que opera sob demanda. Este não é o melhor modelo para esse tipo de cenário. Pensando assim, uma melhoria proposta seria refatorar a aplicação para originar múltiplas aplicações extremamente especializadas, no modelo de microsserviços orientado a eventos. Além de separar os domínios da aplicação, esse modelo permite uma alta escalabilidade horizontal para atender a demanda (e retorno, em momentos de baixa demanda) que permite o atendimento e o controle de custos operacionais. Além disso, caso alguma aplicação caia, o restante continua operante. A orientação a eventos garante o uso de eventos de domínio para assegurar processamento assíncrono, garantindo maior resiliência e performance.

## Aplicação mobile em React Native

A aplicação mobile foi desenvolvida utilizando **React Native** junto ao **Gluestack** e **Expo**. Essa combinação de ferramentas se mostrou bastante útil para o desenvolvimento de uma aplicação completa em um curto período de tempo. Com base na implementação final, concluímos:

* As ferramentas utilizadas possibilitaram o desenvolvimento e debug de uma aplicação em um tempo curto;
* Ela permite a criação de aplicações nativas para Android e iOS;
* É intuitiva e fácil para quem já domina linguagens como JavaScript/TypeScript, mas é mais complicada para quem não está familiarizado com essas linguagens, como quem desenvolve aplicações em linguagem nativa (Java/Kotlin para Android e Objective-C e Swift para iOS);
* O Expo forneceu, em nuvem, uma ferramenta fácil e simples para buildar a aplicação e gerar um pacote APK pronto para a instalação. O Android Studio não foi necessário.

### Melhorias arquiteturais

Como melhorias, pretende-se construir a aplicação para o iOS, bem como implementar testes unitários e de integração que garantam que as funcionaldiade implementadas seguem os requisitos solicitados. Neste momento, a aplicação não possui nenhum teste automarizado.

</div>