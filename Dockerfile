# syntax=docker/dockerfile:1
# Uma imagem com a API e os dois fronts: o web (Angular) em /doetech/ e o app
# (Expo, versão web) em /doetech/app/, servidos pela própria API.

FROM node:22-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web ./
RUN npx ng build --base-href /doetech/

FROM node:22-alpine AS app
WORKDIR /mobile
COPY mobile/package.json mobile/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY mobile ./
RUN npx expo export --platform web --output-dir dist

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS api
WORKDIR /src
# Só o projeto primeiro: a camada do restore sobrevive a mudanças de código.
COPY api/DoeTech.csproj api/
RUN dotnet restore api/DoeTech.csproj
COPY api api
RUN dotnet publish api/DoeTech.csproj --no-restore -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=api /app .
COPY --from=web /web/dist/doe-tech-frontend/browser wwwroot/doetech
COPY --from=app /mobile/dist wwwroot/doetech/app

ENV ASPNETCORE_URLS=http://+:8080 \
    Files__Root=/data/files
# A imagem alpine não traz fusos horários, e o reset da demonstração é às
# 4h de São Paulo. Uploads ficam num volume; o usuário sem privilégios da
# imagem base é o dono.
RUN apk add --no-cache tzdata \
 && mkdir -p /data/files && chown -R $APP_UID /data
VOLUME /data
USER $APP_UID

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:8080/api/v1/doetech/health >/dev/null || exit 1

ENTRYPOINT ["dotnet", "DoeTech.dll"]
