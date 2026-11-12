# Chamados do professor

## Fluxo

- Uma inspeção reprovada abre um chamado corretivo, mesmo quando mais de um item crítico falha.
- A descrição do problema é obrigatória. A prioridade é enviada como severidade e começa em `ALTA`.
- O chamado guarda o equipamento, o solicitante e o ID da inspeção. As observações, o resultado e a data da vistoria permanecem no registro relacionado.
- O equipamento muda para `EM_MANUTENCAO` dentro da mesma transação que grava a inspeção e o chamado.
- Uma inspeção reprovada antiga sem chamado pode receber um pelo seu registro de detalhes. A restrição única do banco evita dois chamados para a mesma inspeção.

## Banco de dados

`database/init/02-schema.sql` define as tabelas `inspecoes` e `chamados_manutencao`, além da coluna `inspecao_id` única e opcional em chamados. A migração `database/migrations/20261112_chamados_professor.sql` garante essa relação e adiciona um índice para a listagem por solicitante e situação em bancos já existentes.

## API

- `POST /api/inspecoes` grava a inspeção e, em caso de reprovação, abre o chamado na mesma transação. Para inspeções reprovadas, recebe `chamadoDescricao` e `chamadoSeveridade`.
- `POST /api/inspecoes/:id/chamado` abre um chamado para uma inspeção reprovada existente. Recebe `descricao` e `severidade`.
- `GET /api/chamados/professor` lista apenas os chamados do professor autenticado. O parâmetro `situacao` aceita `EM_ANDAMENTO` ou `CONCLUIDO`.

Os chamados ativos (`ABERTO`, `EM_ATENDIMENTO`, `AGUARDANDO_PECAS`) são exibidos como “Em andamento”. Os estados `CONCLUIDO` e `CANCELADO` pertencem ao filtro de encerrados; o estado individual continua visível na lista.
