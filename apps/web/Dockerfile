FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci || npm install

# Copia código do app
COPY . .

# Permite configurar a URL da API no build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build de produção
RUN npm run build

FROM nginx:alpine AS runtime

# Configuração do Nginx para SPA (fallback para index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build estático
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
