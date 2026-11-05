# Docker Compose - FPH Mobile E2E

## Diferenças entre FPHmobile e ybera

### ybera (Backend .NET)
- **Arquitetura**: Aplicação backend completa com múltiplos serviços
- **Infraestrutura**: PostgreSQL, Dragonfly (Redis), RabbitMQ, Azurite
- **Propósito**: Executar APIs e serviços em ambiente containerizado
- **Docker Compose**: Necessário para orquestrar todos os serviços dependentes

### FPHmobile (Testes E2E Mobile)
- **Arquitetura**: Suite de testes WebdriverIO + Appium
- **Infraestrutura**: Android Emulator, Appium Server, APK do app
- **Propósito**: Automatizar testes em aplicativo Android
- **Docker Compose**: Apenas para ambiente de suporte (Node.js + dependências)

## Limitações Importantes

**Android Emulator não roda bem em Docker** devido a:
- Requisitos de virtualização de hardware (KVM/QEMU)
- Suporte limitado em containers
- Performance degradada

Por isso, o docker-compose do FPHmobile é diferente:
- **Não inclui Android Emulator** (deve rodar no host)
- **Apenas suporta execução de testes** (o container acessa ADB do host via `network_mode: host`)
- **Simplificado**: Apenas Node.js + Appium + dependências

## Como Usar

### Pré-requisitos (no host)
1. Docker Desktop instalado
2. Android Emulator rodando OU dispositivo Android conectado via USB
3. ADB configurado: `adb devices`

### Rodar com Docker Compose

```bash
# 1. Iniciar o emulador Android no host (se ainda não estiver rodando)
# Via Android Studio ou linha de comando

# 2. Verificar dispositivo conectado
adb devices

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Rodar os testes via Docker
docker-compose up e2e-tests

# 5. Para limpar
docker-compose down
```

### Rodar sem Docker (Recomendado para desenvolvimento)

Para desenvolvimento local, **recomendamos rodar diretamente no host**:

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar com suas credenciais

# 3. Iniciar emulador Android

# 4. Rodar testes
npm run t
```

## Arquitetura de Arquivos

- `docker-compose.yml`: Configuração do container de testes
- `Dockerfile`: Imagem base Node.js com Java
- `.dockerignore`: Arquivos excluídos do build

## Azure DevOps vs Docker

- **Azure DevOps**: Ideal para CI/CD automático (já configurado)
- **Docker Compose**: Útil para testes isolados, mas limitado sem Android

## Próximos Passos

Se você precisa de infraestrutura completa como o ybera (banco de dados, filas, etc.) para testar o FPHmobile, considere:
1. Adicionar um backend de teste real (API mock ou sandbox)
2. Usar o docker-compose do ybera como referência para serviços de suporte
3. Atualmente, o FPHmobile apenas testa o app mobile diretamente
