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
    });

    const fluxos = [
        { opcao: 'Resultados', titulo: 'Resultados' },
        { opcao: 'Eventos', titulo: 'Eventos' },
        { opcao: 'Notícias', titulo: 'Notícias' },
        { opcao: 'Financeiro', titulo: 'Financeiro' },
        { opcao: 'Perfil', titulo: 'Perfil' }
    ];

    fluxos.forEach(fluxo => {
        it(`Cenário: deve acessar tela de ${fluxo.opcao} através do menu`, async () => {
            await HomePage.clicarMenu(fluxo.opcao);
            await expect(HomePage.tituloTela).toHaveText(fluxo.titulo);
        });
    });
});
