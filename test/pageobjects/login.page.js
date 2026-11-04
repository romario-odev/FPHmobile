const { $ } = require('@wdio/globals');
const Page = require('./page');

class LoginPage extends Page {
    get inputEmail() { return $('android=new UiSelector().className("android.widget.EditText").instance(0)'); }
    get inputSenha() { return $('android=new UiSelector().className("android.widget.EditText").instance(1)'); }
    get btnLogin() { return $('~login-botao-entrar'); }
    get menuPerfil() { return $('~menu-perfil'); }

    async estaNaTelaDeLogin() {
        const elements = await $$('android=new UiSelector().className("android.widget.EditText")');
        return elements.length >= 2;
    }

    async realizarLogin(email, senha) {
        // Verifica se já está logado, se sim, não faz nada
        if (!(await this.estaNaTelaDeLogin())) {
            console.log('Já está logado, pulando login');
            return;
        }

        await this.inputEmail.setValue(email);
        await this.inputSenha.setValue(senha);
        await this.waitAndClick(this.btnLogin);
    }
}

module.exports = new LoginPage();
