const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class Usuario {
    constructor({ id, nome, email }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError('id deve ser inteiro positivo');
        }
        if (typeof nome !== 'string' || nome.trim() === '') {
            throw new TypeError('Nome é obrigatorio');
        }
        if (nome.trim().length > 120) {
            throw new TypeError('Nome deve ter no máximo 120 caracteres');
        }
        if (typeof email !== 'string' || !REGEX_EMAIL.test(email.trim())) {
            throw new TypeError('Email é obrigatorio e deve ser válido');
        }
        if (email.trim().length > 160) {
            throw new TypeError('Email deve ter no máximo 160 caracteres');
        }
        Object.assign(this, {
            id, nome: nome.trim(), email: email.trim().toLowerCase()
        });
    }
}
