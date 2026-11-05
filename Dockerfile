FROM node:18-bullseye

# Instalar dependências básicas
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Configurar JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Criar diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar arquivos do projeto
COPY . .

# Expor porta (se necessário para Appium inspector)
EXPOSE 4723

# Ponto de entrada padrão
CMD ["sh", "-c", "npm run t"]
