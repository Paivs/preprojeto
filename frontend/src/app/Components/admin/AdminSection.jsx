export default function AdminSection({ titulo, descricao, mensagem }) {
  return (
    <div className="admin-content">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRAÇÃO</span>

          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
      </header>

      <section className="admin-panel admin-empty-panel">
        <div className="empty-icon">▤</div>

        <h2>{mensagem}</h2>

        <p>
          Esta área está preparada para receber suas funcionalidades e a
          integração com o banco de dados.
        </p>
      </section>

      <footer className="admin-footer">
        AlertAbc — Painel administrativo geral
      </footer>
    </div>
  );
}
