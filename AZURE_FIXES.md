# Correções Azure DevOps - FPH Mobile

## Problema Original
Os testes não rodavam no Azure DevOps e você não visualizava o gráfico de pizza (resultados).

## Causas Identificadas

### 1. Formato de Resultados Incompatível
- **Antes**: O script gerava JSON customizado em `results/reports/*.json`
- **Problema**: Azure DevOps `PublishTestResults@2` não aceita JSON customizado
- **Solução**: Adicionar geração de JUnit XML (`results/junit.xml`)

### 2. Caminho Errado no Pipeline
- **Antes**: `testResultsFiles: '**/results/reports/*.json'`
- **Problema**: Arquivo não existia ou não estava no formato esperado
- **Solução**: `testResultsFiles: '**/results/junit.xml'` com formato `JUnit`

### 3. Appium em Background
- **Antes**: `start "" npx appium --allow-cors`
- **Problema**: O comando `start` no Windows não funciona bem no Azure DevOps agent
- **Solução**: Usar `start /B cmd /c` com redirecionamento de log e espera explícita

### 4. Falta de Espera
- **Antes**: Iniciava Appium e rodava testes imediatamente
- **Problema**: Appium pode não estar pronto quando os testes começam
- **Solução**: Adicionar `timeout /t 10` para aguardar Appium iniciar

## Mudanças Realizadas

### 1. utils/reports.js
- ✅ Adicionado campo `suite` para agrupar testes por suite
- ✅ Gerar arquivo `junit.xml` no formato padrão do Azure DevOps
- ✅ Manter HTML dashboard para visualização local
- ✅ Manter JSON para uso interno

**Formato JUnit gerado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="FPH Mobile E2E Tests" tests="2" failures="0" errors="0" skipped="0" time="5.0">
  <testsuite name="Home Tests" tests="1" failures="0" errors="0" skipped="0" time="2.5">
    <testcase name="Teste de login" time="2.5"/>
  </testsuite>
  <testsuite name="Navegação" tests="1" failures="0" errors="0" skipped="0" time="2.5">
    <testcase name="Teste de navegação" time="2.5"/>
  </testsuite>
</testsuites>
```

### 2. azure-pipelines.yml
- ✅ Removido `winget` (não está disponível no Azure DevOps agent)
- ✅ Adicionado verificação de Java pré-instalado
- ✅ Adicionado verificação de APK antes de rodar testes
- ✅ Melhorado inicialização do Appium com logging
- ✅ Adicionado espera para emulador e Appium
- ✅ Alterado `testResultsFormat` para `JUnit`
- ✅ Alterado `testResultsFiles` para `**/results/junit.xml`
- ✅ Adicionado `failTaskOnFailedTests: false` para não falhar o pipeline se testes falharem

### 3. docker-compose.yml (NOVO)
- ✅ Criado para desenvolvimento local
- ✅ Simplificado (apenas Node.js + dependências)
- ✅ Não inclui Android Emulator (limitação técnica)
- ✅ Usa `network_mode: host` para acessar ADB do host

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

## Comparação com ybera

### ybera
- Usa **testes unitários/integração** .NET
- Formato nativo (NUnit/xUnit) já compatível com Azure DevOps
- Dashboard visual é nativo do Azure DevOps
- Não precisa de conversão de formato

### FPHmobile
- Usa **testes E2E mobile** (WebdriverIO)
- Formato customizado precisa ser convertido para JUnit
- Dashboard HTML é adicional (para visualização local)
- JUnit XML permite visualização no Azure DevOps

## Próximos Passos

1. **Commit e push** das mudanças
2. **Rodar o pipeline** no Azure DevOps
3. **Verificar** se a aba "Tests" aparece com o gráfico
4. **Configurar** APK no Azure DevOps (se necessário)

## Solução de Problemas

### "Test Results não aparecem"
- Verifique o log do task `PublishTestResults@2`
- Baixe o artifact `test-results` e confirme se `junit.xml` existe
- Abra o `junit.xml` e veja se tem formato válido

### "Appium não inicia"
- Verifique o log `appium.log` nos artifacts
- Aumente o timeout de espera para Appium (atualmente 10s)
- Verifique se Java está instalado no agent

### "Emulador não inicia"
- Windows-latest agent tem Android SDK pré-instalado
- O comando `avdmanager create avd` pode precisar de ajustes
- Considere usar um emulador pré-configurado ou imagem customizada

## Recursos Adicionais

- Documentação PublishTestResults: https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/test/publish-test-results
- Formato JUnit XML: https://llg.cubic.org/docs/junit/
- FPHmobile README: `README_TESTES.md`
- Docker setup: `DOCKER_SETUP.md`
