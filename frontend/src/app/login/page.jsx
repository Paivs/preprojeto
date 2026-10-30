import Link from "next/link";
import "./login.css";

export default function Login() {
  return (
    <main id="login">
      <div className="card-login">
        <div className="top-login">
          <img src="/images/logo.png" />

          <div className="txt-card-top">
            <h3>Acesse sua conta</h3>
            <span>Entre para acompanhar seu consumo de energia</span>
          </div>
        </div>
        <form>
          <div className="form-group">
            <label>E-mail</label>
            <div className="input-wrapper">
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <i className="bi bi-lock"></i>
              <input
                type="password"
                name="senha"
                placeholder="Digite sua senha"
                required
              />
            </div>
          </div>
          <Link className="esquecer-senha" href="/">Esqueci minha senha</Link>

          <div className="btn-entrar">
            <button type="button">Entrar</button>
          </div>
        </form>
      </div>
    </main>
  );
}
