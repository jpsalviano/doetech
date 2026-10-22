# DoeTech Mobile

O DoeTech Mobile é uma aplicação desenvolvida em **React Native** com [Expo](https://expo.dev).

## Como começar

> :warning: A etapa 1 é necessária a cada nova iteração da aplicação, para garantir que todas as dependências estejam satisfeitas!

1. Instale as dependências da aplicação localmente, inserindo, no terminal:

   ```shell
   npm install
   ```

2. Inicie a aplicação, inserindo, no terminal:

   ```shell
   npx expo start
   ```

> Você pode testar a aplicação pelo navegador web ou utilizar o [Expo Go](https://expo.dev/go) para executar a aplicação em seu dispositivo **Android**.

## Criar APK

Para criar um pacote APK com o DoeTech, utilize, no terminal:

'''shell
eas build -p android --profile preview
'''

Você precisa ter credenciais válidas no Expo. Acompanhe o terminal para mais informações sobre o processo de build.