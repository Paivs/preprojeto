-- Garante o vínculo único entre chamado e inspeção em bancos já existentes.
-- As tabelas dedicadas e a relação já constam em database/init/02-schema.sql.
USE tenken_db;

DELIMITER //
CREATE PROCEDURE migrar_chamados_professor()
BEGIN
    DECLARE tem_coluna_inspecao INT DEFAULT 0;
    DECLARE tem_indice_unico INT DEFAULT 0;
    DECLARE tem_fk_inspecao INT DEFAULT 0;
    DECLARE tem_indice_professor INT DEFAULT 0;

    SELECT COUNT(*) INTO tem_coluna_inspecao
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'chamados_manutencao'
      AND column_name = 'inspecao_id';

    IF tem_coluna_inspecao = 0 THEN
        ALTER TABLE chamados_manutencao
            ADD COLUMN inspecao_id BIGINT UNSIGNED NULL AFTER equipamento_id;
    END IF;

    SELECT COUNT(*) INTO tem_indice_unico
    FROM (
        SELECT index_name
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'chamados_manutencao'
        GROUP BY index_name
        HAVING MIN(non_unique) = 0
           AND COUNT(*) = 1
           AND SUM(column_name = 'inspecao_id') = 1
    ) AS indices_unicos;

    IF tem_indice_unico = 0 THEN
        ALTER TABLE chamados_manutencao
            ADD UNIQUE KEY uq_chamados_manutencao_inspecao (inspecao_id);
    END IF;

    SELECT COUNT(*) INTO tem_fk_inspecao
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'chamados_manutencao'
      AND column_name = 'inspecao_id'
      AND referenced_table_name = 'inspecoes';

    IF tem_fk_inspecao = 0 THEN
        ALTER TABLE chamados_manutencao
            ADD CONSTRAINT fk_chamados_manutencao_inspecao
            FOREIGN KEY (inspecao_id) REFERENCES inspecoes(id);
    END IF;

    SELECT COUNT(*) INTO tem_indice_professor
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'chamados_manutencao'
      AND index_name = 'idx_chamados_professor_status_aberto';

    IF tem_indice_professor = 0 THEN
        CREATE INDEX idx_chamados_professor_status_aberto
            ON chamados_manutencao (solicitante_id, status, aberto_em);
    END IF;
END//
DELIMITER ;

CALL migrar_chamados_professor();
DROP PROCEDURE migrar_chamados_professor;
