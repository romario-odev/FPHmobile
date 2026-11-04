# Configuração de Testes E2E

## Pré-requisitos

1. Node.js instalado
2. Appium instalado globalmente: `npm install -g appium`
3. Emulador Android ou dispositivo conectado (Pixel 7a configurado)
4. APK do app em `./app/app-release.apk`

## Configuração de Credenciais

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais:
   ```
   USER_EMAIL=seu.email@gmail.com
   USER_PASSWORD=sua_senha
   ```

**IMPORTANTE**: O arquivo `.env` já está no `.gitignore`, então suas credenciais não serão commitadas.

## Executar Testes

### Todos os testes
```bash
npm run t
```

### Testes com modo headed (ver Appium UI)
```bash
npm run t:headed
```

### Appium Inspector
```bash
npm run inspector
```

## Estrutura do Projeto

- `test/specs/` - Arquivos de teste (Mocha/WebdriverIO)
- `test/pageobjects/` - Page Objects (Padrão Page Object)
- `utils/` - Utilitários (reports, helpers)
- `wdio.conf.js` - Configuração do WebdriverIO
- `.env` - Variáveis de ambiente (NÃO commitar)

## Solução de Problemas

### Dispositivo não encontrado
Verifique se o emulador está rodando:
```bash
adb devices
```

### APK não encontrado
Certifique-se que o arquivo `./app/app-release.apk` existe.

### Erro de permissão
O arquivo `.apk` está no `.gitignore`, mas você precisa colocar o APK manualmente na pasta `app/`.
