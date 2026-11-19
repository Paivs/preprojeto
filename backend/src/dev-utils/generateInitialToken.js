import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'chave-padrao-desenvolvimento';

// Função para gerar um token JWT
export function gerarTokenInicial(payload = { sub: 1, perfil: 'admin' }, options = { expiresIn: '1h' }) {
  return jwt.sign(payload, jwtSecret, options);
}

const token = gerarTokenInicial();
console.log('Token gerado:', token);
