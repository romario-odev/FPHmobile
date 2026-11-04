const { expect } = require('@wdio/globals');
const LoginPage = require('../pageobjects/login.page');
const HomePage = require('../pageobjects/home.page');
const { openApp } = require('../../utils/openApp');

describe('Navegação - Menu Principal', () => {
    const emailValido = process.env.USER_EMAIL;
    const senhaValida = process.env.USER_PASSWORD;

    beforeEach(async () => {
        await openApp();
        await LoginPage.realizarLogin(emailValido, senhaValida);
        await HomePage.fecharPopupNovosEventos();
        await HomePage.fecharAlertaErro();
    });

    it('Cenário: deve exibir todas as opções do menu principal', async () => {
        await expect(HomePage.menuResultados).toBeDisplayed();
        await expect(HomePage.menuEventos).toBeDisplayed();
        await expect(HomePage.menuNoticias).toBeDisplayed();
        await expect(HomePage.menuFinanceiro).toBeDisplayed();
        await expect(HomePage.menuPerfil).toBeDisplayed();
    });
});
