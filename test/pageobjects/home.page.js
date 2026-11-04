const { $ } = require('@wdio/globals');
const Page = require('./page');

class HomePage extends Page {
    get saudacao() { return $('~home-saudacao'); }
    get alertNovosEventos() { return $('android=new UiSelector().text("Novos eventos adicionados!")'); }
    get btnIrParaHome() { return $('~home-new-events-modal-go-home'); }
    get btnDesativarAlertas() { return $('~home-new-events-modal-disable-alerts'); }
    get btnLogout() { return $('~[FALTA NA PBI: botao de logout]'); }
    get loadingSpinner() { return $('~[FALTA NA PBI: seletor do componente de carregamento]'); }
    get msgErro() { return $('android=new UiSelector().text("Não foi possível carregar os dados")'); }
    get btnTentarNovamente() { return $('android=new UiSelector().text("Tentar novamente")'); }
    get menuResultados() { return $('~menu-resultados'); }
    get menuEventos() { return $('~menu-eventos'); }
    get menuNoticias() { return $('~menu-noticias'); }
    get menuFinanceiro() { return $('~menu-financeiro'); }
    get menuPerfil() { return $('~menu-perfil'); }
    get tituloTela() { return $('~header-titulo'); }
    get ultimasNotificacoes() { return $('android=new UiSelector().text("Últimas notícias")'); }

    async clicarMenu(opcao) {
        const menus = {
            'Resultados': this.menuResultados,
            'Eventos': this.menuEventos,
            'Notícias': this.menuNoticias,
            'Financeiro': this.menuFinanceiro,
            'Perfil': this.menuPerfil
        };
        await this.waitAndClick(menus[opcao]);
    }

    async desativarAlertas() {
        await this.waitAndClick(this.btnDesativarAlertas);
    }

    async fecharPopupNovosEventos() {
        // Verifica se o pop-up está visível e clica em "Ir para Home"
        try {
            await this.btnIrParaHome.waitForDisplayed({ timeout: 5000 });
            await this.waitAndClick(this.btnIrParaHome);
            console.log('Pop-up de novos eventos fechado');
        } catch (e) {
            console.log('Pop-up não estava visível, continuando...');
        }
    }

    async rolarParaNotificacoes() {
        // Rola para cima para visualizar as últimas notificações
        await driver.execute('mobile: scrollGesture', {
            left: 500,
            top: 1000,
            width: 200,
            height: 200,
            direction: 'down',
            percent: 1.0
        });
    }

    async realizarLogout() {
        await this.waitAndClick(this.btnLogout);
    }
}

module.exports = new HomePage();
