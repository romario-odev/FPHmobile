const { expect } = require('@wdio/globals');
const LoginPage = require('../pageobjects/login.page');
const HomePage = require('../pageobjects/home.page');
const { openApp } = require('../../utils/openApp');

const PBI_MISSING = {
    ROTA_HOME: '[FALTA NA PBI: rota da home]',
    RESET_ALERTAS: '[FALTA NA PBI: reset de alertas do usuario]'
};

describe('Home - Funcionalidades e Estados', () => {
    const emailValido = process.env.USER_EMAIL;
    const senhaValida = process.env.USER_PASSWORD;

    beforeEach(async () => {
        await openApp();
    });

    const nomes = ['João', 'Conceição', 'Jean-Pierre', 'Wladislaus'];
    nomes.forEach(nome => {
        it(`Cenário 1: deve exibir saudação personalizada para ${nome}`, async () => {
            await LoginPage.realizarLogin(emailValido, senhaValida);
            // Simulação de verificação de saudação (ajustar se o nome vier do login)
            await expect(HomePage.saudacao).toHaveTextContaining(`Boas-vindas, ${nome}`);
        });
    });

    it('Cenário 2: deve exibir opções do menu principal ao carregar a Home', async () => {
        await LoginPage.realizarLogin(emailValido, senhaValida);
        await expect(HomePage.menuResultados).toBeDisplayed();
        await expect(HomePage.menuEventos).toBeDisplayed();
        await expect(HomePage.menuNoticias).toBeDisplayed();
        await expect(HomePage.menuFinanceiro).toBeDisplayed();
        await expect(HomePage.menuPerfil).toBeDisplayed();
    });

    it('Cenário 8: deve exibir alerta de novos eventos ao acessar a Home', async () => {
        await LoginPage.realizarLogin(emailValido, senhaValida);
        await expect(HomePage.alertNovosEventos).toBeDisplayed();
    });

    it('Cenário 9: deve desativar alertas e validar persistência', async () => {
        await LoginPage.realizarLogin(emailValido, senhaValida);
        await HomePage.desativarAlertas();
        await expect(HomePage.alertNovosEventos).not.toBeDisplayed();
        
        await HomePage.realizarLogout();
        await LoginPage.realizarLogin(emailValido, senhaValida);
        
        await expect(HomePage.alertNovosEventos).not.toBeDisplayed();
        console.log(`RESTAURAR ESTADO: ${PBI_MISSING.RESET_ALERTAS}`);
    });

    it('Cenário 10: deve exibir estado de carregamento com latência', async () => {
        await LoginPage.realizarLogin(emailValido, senhaValida);
        await expect(HomePage.loadingSpinner).toBeDisplayed();
        await HomePage.loadingSpinner.waitForDisplayed({ reverse: true });
    });

    it('Cenário 11: deve exibir erro amigável ao falhar comunicação', async () => {
        // Nota: Este teste exige mock de rede ou indução de falha via servidor
        await LoginPage.realizarLogin(emailValido, senhaValida);
        await expect(HomePage.msgErro).toBeDisplayed();
        await expect(HomePage.btnTentarNovamente).toBeDisplayed();
    });
});
