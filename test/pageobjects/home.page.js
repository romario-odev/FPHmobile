const { $ } = require('@wdio/globals');
const Page = require('./page');

class HomePage extends Page {
    get saudacao() { return $('~home-saudacao'); }
    get alertNovosEventos() { return $('android=new UiSelector().text("Novos eventos adicionados!")'); }
    get btnDesativarAlertas() { return $('android=new UiSelector().text("Desativar alertas")'); }
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

    async realizarLogout() {
        await this.waitAndClick(this.btnLogout);
    }
}

module.exports = new HomePage();
