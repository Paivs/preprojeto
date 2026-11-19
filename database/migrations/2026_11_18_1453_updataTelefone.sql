UPDATE usuario
SET telefone = CASE
    WHEN email = 'admin@volthouse.com' THEN '(11) 99999-1001'
    WHEN email = 'financeiro@alimentos-silva.com.br' THEN '(11) 99999-1002'
    WHEN email = 'atendimento@lograpido.com.br' THEN '(11) 99999-1003'
    WHEN email = 'contato@gama.com' THEN '(11) 99999-1004'
    WHEN email = 'admin@modaeestilo.com' THEN '(11) 99999-1005'
    WHEN email = 'contato@metalurgicaoliveira.com.br' THEN '(11) 99999-1006'
    WHEN email = 'admin@bompreco.com.br' THEN '(11) 99999-1007'
    WHEN email = 'contato@horizonte.com.br' THEN '(11) 99999-1008'
    WHEN email = 'administracao@saolucas.com.br' THEN '(11) 99999-1009'
    WHEN email = 'suporte@digitalplus.com.br' THEN '(11) 99999-1010'
    WHEN email = 'contato@textilcarvalho.com.br' THEN '(11) 99999-1011'
    WHEN email = 'administracao@paodourado.com.br' THEN '(11) 99999-1012'
    WHEN email = 'vendas@autopecasnacional.com.br' THEN '(11) 99999-1013'
    WHEN email = 'contato@vidasaudavel.com.br' THEN '(11) 99999-1014'
    WHEN email = 'financeiro@distribuidoracentral.com.br' THEN '(11) 99999-1015'
    ELSE telefone
END;
