const { $ } = require('@wdio/globals');
const Page = require('./page');

class LoginPage extends Page {
    get inputEmail() { return $('~login-email'); }
    get inputSenha() { return $('~login-senha'); }
    get btnLogin() { return $('~[FALTA NA PBI: nome do botao de login]'); }

    async realizarLogin(email, senha) {
        await this.inputEmail.setValue(email);
        await this.inputSenha.setValue(senha);
        await this.waitAndClick(this.btnLogin);
    }
}

module.exports = new LoginPage();
