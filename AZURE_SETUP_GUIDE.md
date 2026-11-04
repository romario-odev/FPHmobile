# Guia de Configuração do Azure DevOps para Testes E2E

## 📋 Pré-requisitos

- Acesso ao projeto FPH no Azure DevOps
- Permissões para criar Variable Groups e executar Pipelines

## 🔧 Passo 1: Criar Variable Group

### 1.1 Acessar o Azure DevOps
1. Abra o navegador e acesse: https://dev.azure.com/
2. Faça login com suas credenciais
3. Selecione a organização (provavelmente `globalsysdev`)
4. Selecione o projeto **FPH**

### 1.2 Criar Variable Group
1. No menu lateral esquerdo, clique em **Pipelines**
2. Clique em **Library** (geralmente está em Pipelines)
3. Clique no botão **+ Variable group** (ou "Criar grupo de variáveis")
4. Preencha:
   - **Variable group name**: `e2e-test-credentials`
   - **Description**: `Credenciais para testes E2E Android do FPH Mobile`
5. Clique em **Add variable** para cada variável:

#### Variável 1: USER_EMAIL
- **Name**: `USER_EMAIL`
- **Value**: `day.mesoli@gmail.com`
- **Secret**: ✅ Marque o cadeado (This value is a secret)
- **Allow access to all pipelines**: ✅ Marque

#### Variável 2: USER_PASSWORD
- **Name**: `USER_PASSWORD`
- **Value**: `123`
- **Secret**: ✅ Marque o cadeado (This value is a secret)
- **Allow access to all pipelines**: ✅ Marque

6. Clique em **Save** (Salvar)

## 🚀 Passo 2: Executar o Pipeline

### 2.1 Acessar o Pipeline
1. No menu lateral, clique em **Pipelines**
2. Clique em **Pipelines** (ou "Pipelines" novamente)
3. Você deve ver o pipeline do FPHmobile (provavelmente chamado de algo como "FPHmobile" ou baseado no nome do repositório)

### 2.2 Executar Manualmente
1. Clique no botão **Run pipeline** (ou "Executar pipeline")
2. Configure:
   - **Branch**: Selecione `main`
   - **Tags**: Deixe vazio
3. Clique em **Run** (ou "Executar")

### 2.3 Monitorar a Execução
1. Você será redirecionado para a página de execução do pipeline
2. Aguarde os seguintes stages completarem:
   - **Build and Test**
     - Install Node.js
     - Install Dependencies
     - Setup Android Environment
     - Run E2E Tests
     - Publish Test Results
     - Publish Test Artifacts

3. Clique em cada job para ver os logs em tempo real

## 📊 Passo 3: Verificar Resultados

### 3.1 Verificar Resultados dos Testes
1. Após a conclusão, clique na aba **Tests** (Testes)
2. Você verá:
   - Gráfico de pass/fail
   - Lista de testes com status
   - Detalhes de cada teste

### 3.2 Baixar Artefatos
1. Clique na aba **Artifacts** (Artefatos)
2. Você verá o artefato `test-results`
3. Clique nele e depois em **Download**
4. Extraia o arquivo ZIP
5. Abra o arquivo `index.html` no navegador
6. Você verá o dashboard completo com:
   - 📊 Cards de Total, Passed, Failed, Pass Rate
   - 📋 Lista de todos os testes
   - 🖼️ Screenshots dos testes
   - 🔴/🟢 Cores indicando status

## ⚠️ Solução de Problemas

### Problema: Pipeline falha com "Variable group not found"
**Solução:**
1. Verifique se o Variable Group foi criado com o nome exato: `e2e-test-credentials`
2. No pipeline, clique em **Edit**
3. Vá em **Variables**
4. Clique em **Link variable group**
5. Selecione `e2e-test-credentials`
6. Salve o pipeline

### Problema: Pipeline falha com "Android emulator not found"
**Solução:**
O `windows-latest` não tem Android Emulator pré-instalado. Você tem duas opções:

**Opção 1: Usar Self-Hosted Agent**
1. Configure um self-hosted agent com Windows e Android SDK
2. No pipeline, altere `vmImage: 'windows-latest'` para `pool: 'nome-do-seu-agent'`

**Opção 2: Usar Serviço de Teste em Nuvem**
1. Crie conta no BrowserStack ou Sauce Labs
2. Adicione credenciais como secrets no Azure DevOps
3. Atualize as capabilities no `wdio.conf.js` para usar o serviço em nuvem

### Problema: Credenciais não funcionam
**Solução:**
1. Verifique se as variáveis estão marcadas como secrets
2. Verifique se o nome das variáveis está correto (case-sensitive)
3. Verifique se o Variable Group está vinculado ao pipeline

## 📝 Verificação da Configuração

### Checklist:
- [ ] Variable Group `e2e-test-credentials` criado
- [ ] Variável `USER_EMAIL` configurada como secret
- [ ] Variável `USER_PASSWORD` configurada como secret
- [ ] Variable Group vinculado ao pipeline
- [ ] Pipeline executado manualmente pelo menos uma vez
- [ ] Resultados dos testes visíveis na aba Tests
- [ ] Artefatos baixados e dashboard HTML visualizado

## 🎯 Resultado Esperado

Após configurar e executar o pipeline, você terá:

1. **Execução Automática**:
   - A cada 4 horas (schedule configurado)
   - Em todos os commits para `main` e `develop`
   - Em todos os Pull Requests

2. **Relatórios Visuais**:
   - Dashboard HTML com gráficos
   - Screenshots dos testes
   - Histórico de execuções

3. **Alertas**:
   - Notificações de falhas
   - Insights de tendências de testes

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do pipeline clicando em cada job
2. Revise a documentação do Azure DevOps
3. Consulte a equipe de DevOps da sua organização
