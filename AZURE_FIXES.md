# Correções Azure DevOps - FPH Mobile

## Problema Original
Os testes não rodavam no Azure DevOps e você não visualizava o gráfico de pizza (resultados).

## Causas Identificadas

### 1. Appium Duplicado
- **Problema**: O `wdio.conf.js` iniciava Appium automaticamente, mas o pipeline também tentava iniciar manualmente
- **Resultado**: Conflito de portas e falha de conexão
- **Solução**: Detectar ambiente CI (`TF_BUILD`) e desabilitar serviço Appium no wdio.conf.js quando no Azure DevOps

### 2. Emulador Android não boots completamente
- **Problema**: Timeout fixo de 60s pode não ser suficiente
- **Solução**: Implementar loop para verificar se `bootanim` está parado (indica boot completo)

### 3. Variáveis de ambiente não validadas
- **Problema**: Pipeline falhava silenciosamente se `USER_EMAIL` ou `USER_PASSWORD` não estivessem definidos
- **Solução**: Adicionar verificação explícita e falhar com erro claro

### 4. Java não configurado corretamente
- **Problema**: Caminho hardcoded pode não existir no Azure DevOps agent
- **Solução**: Tentar múltiplos caminhos comuns e detectar automaticamente

### 5. Falta de logs de depuração
- **Problema**: Difícil diagnosticar falhas sem logs detalhados
- **Solução**: Adicionar logs de emulador, Appium e verificação de dispositivo

## Mudanças Realizadas

### 1. azure-pipelines.yml

#### Configurações Gerais
- ✅ Adicionado `timeoutInMinutes: 30` no job (emulador pode demorar)
- ✅ Melhorado step "Setup Environment" com validações
- ✅ Separado criação do emulador em step próprio
- ✅ Adicionado step para listar imagens Android disponíveis
- ✅ Melhorado boot do emulador com verificação de `bootanim`
- ✅ Adicionado step específico para iniciar Appium
- ✅ Adicionado coleta de logs do emulador (logcat)

#### Detalhes Importantes

**Setup Environment:**
```yaml
- Valida se USER_EMAIL e USER_PASSWORD estão definidos
- Verifica se APK existe antes de rodar
- Lista paths de Android SDK
```

**List Android System Images:**
```yaml
- Lista imagens disponíveis para debugging
- Ajuda a identificar se android-33 existe
```

**Create Android Emulator:**
```yaml
- Verifica se já existe (evita erro)
- Usa --force para recriar se necessário
```

**Start Android Emulator:**
```yaml
- Usa -gpu swiftshader_indirect (melhor performance em CI)
- Loop para verificar bootanim (aguarda boot completo)
- Timeout adicional de 30s após boot
- Verifica versão Android e dispositivo conectado
```

**Start Appium Server:**
```yaml
- Inicia em background com logging
- Aguarda 15s para Appium estar pronto
- Exibe log para debugging
```

**Collect Emulator Logs:**
```yaml
- Coleta logcat do emulador
- Salva em results/emulator.log
- Executa sempre (condition: always())
```

### 2. wdio.conf.js

#### Detecção de Ambiente CI
```javascript
const isCI = process.env.TF_BUILD === 'true';
```

#### Configuração Dinâmica de Appium
```javascript
// No CI: Appium iniciado manualmente pelo pipeline
// Local: Appium iniciado automaticamente pelo wdio service
services: isCI ? [] : [['appium', { command: 'appium', args: { allowCors: true } }]]
```

#### Detecção Automática de Java
```javascript
const possibleJavaPaths = [
    'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.8.101-hotspot',
    'C:\\Program Files\\Amazon Corretto\\jdk17.0.21_0',
    'C:\\Program Files\\Java\\jdk-17'
];
```

#### Melhorias de Logging
- Log se está rodando em CI
- Log do JAVA_HOME configurado
- Log das capabilities antes de iniciar sessão
- Tratamento de erro ao tirar screenshot

### 3. utils/reports.js (Mantido)
- ✅ Gera JUnit XML para Azure DevOps
- ✅ Gera HTML dashboard para visualização local
- ✅ Gera JSON para uso interno

### 4. start-appium.js (NOVO)
Script opcional para iniciar Appium manualmente (útil para desenvolvimento local)

### 5. package.json
- ✅ Adicionado script `start:appium`
- ✅ Adicionado script `test:ci`

## Como Visualizar o Gráfico de Pizza no Azure DevOps

Após rodar o pipeline:

1. **Vá para a run do pipeline** no Azure DevOps
2. **Clique na aba "Tests"** (deve aparecer automaticamente)
3. **Você verá:**
   - 📊 Gráfico de pizza com pass/fail
   - Lista de testes executados
   - Detalhes de cada teste (erros, duração)
   - Tendência de testes ao longo do tempo

Se a aba "Tests" não aparecer:
- Verifique se o arquivo `junit.xml` foi gerado (no artifact `test-results`)
- Verifique se o task `PublishTestResults@2` rodou com sucesso
- Confirme que há pelo menos 1 teste no arquivo XML

## Pré-requisitos no Azure DevOps

### 1. Variable Group: e2e-test-credentials
Você precisa criar um variable group no Azure DevOps com:
- `USER_EMAIL`: Email para login no app
- `USER_PASSWORD`: Senha para login no app

**Como criar:**
1. Acesse: Pipelines → Library
2. Clique em + Variable group
3. Nome: `e2e-test-credentials`
4. Adicione as variáveis acima
5. Marque como "Secret" para `USER_PASSWORD`

### 2. Self-hosted Agent (Opcional)
Se o `windows-latest` não tiver Android SDK configurado corretamente, considere usar um self-hosted agent com:
- Android Studio/SDK instalado
- Java 17 instalado
- Habilite virtualização

## Solução de Problemas

### "Test Results não aparecem"
- Verifique o log do task `PublishTestResults@2`
- Baixe o artifact `test-results` e confirme se `junit.xml` existe
- Abra o `junit.xml` e veja se tem formato válido

### "Appium não inicia"
- Verifique o log `appium.log` nos artifacts
- Aumente o timeout de espera para Appium (atualmente 15s)
- Verifique se Java está instalado no agent
- Verifique se há conflito de porta 4723

### "Emulador não inicia"
- Verifique o step "List Android System Images" para ver se android-33 existe
- Se não existir, mude para uma versão disponível (android-34, android-35)
- Verifique logs do emulador em `results/emulator.log`
- Considere aumentar o timeout do job (atualmente 30 minutos)

### "APK não encontrado"
- O APK está em `app/app-release.apk` (123MB)
- Verifique se está commitado no repo
- O pipeline verifica isso antes de rodar os testes

### "Connection timeout ao conectar Appium"
- Verifique se Appium iniciou corretamente (log `appium.log`)
- Aumente `connectionRetryTimeout` no wdio.conf.js (atualmente 120000ms)
- Verifique se emulador está respondendo: `adb devices`

### "Java não encontrado"
- O wdio.conf.js tenta múltiplos caminhos
- Adicione o caminho correto no pipeline se necessário
- Use o Java pré-instalado no Azure DevOps agent

## Comandos Úteis

### Rodar Pipeline
```bash
git add .
git commit -m "fix(ci): configurar pipeline para Azure DevOps"
git push azure main
```

### Rodar Localmente
```bash
# Com emulador rodando
npm run t

# Com Appium manual
npm run start:appium
# Em outro terminal
npm run t
```

## Recursos Adicionais

- Documentação PublishTestResults: https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/test/publish-test-results
- Formato JUnit XML: https://llg.cubic.org/docs/junit/
- Windows-latest Agent: https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/hosted
- FPHmobile README: `README_TESTES.md`
- Docker setup: `DOCKER_SETUP.md`
