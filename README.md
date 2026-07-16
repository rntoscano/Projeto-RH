# Projeto RH

Frontend React para a plataforma de Recursos Humanos do Projeto RH. A aplicação consome a API publicada em:

```text
https://projeto-rh-sqib.onrender.com/
```

Documentação Swagger consultada:

```text
https://projeto-rh-sqib.onrender.com/swagger-ui/swagger-ui/index.html
```

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Context API
- React Toastify
- Phosphor Icons

## Configuração de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_API_URL=https://projeto-rh-sqib.onrender.com/
```

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Rotas do frontend

- `/` e `/home`: página inicial
- `/sobre`: apresentação institucional
- `/produto`: funcionalidades da plataforma
- `/login`: autenticação
- `/cadastro`: cadastro de usuário
- `/dashboard`: área privada com indicadores
- `/perfil`: atualização do usuário logado
- `/usuarios`: listagem, busca e exclusão de usuários
- `/departamentos`: CRUD de departamentos
- `/funcionarios`: CRUD de funcionários
- `*`: página 404

## Endpoints integrados

- `POST /usuarios/logar`
- `POST /usuarios/cadastrar`
- `GET /usuarios`
- `GET /usuarios/{id}`
- `GET /usuarios/usuario/{usuario}`
- `GET /usuarios/cpf/{cpf}`
- `PUT /usuarios`
- `DELETE /usuarios/{id}`
- `GET /departamentos`
- `GET /departamentos/{id}`
- `GET /departamentos/nome/{nome}`
- `POST /departamentos`
- `PUT /departamentos`
- `DELETE /departamentos/{id}`
- `GET /funcionarios`
- `GET /funcionarios/{id}`
- `GET /funcionarios/cargo/{cargo}`
- `POST /funcionarios`
- `PUT /funcionarios`
- `DELETE /funcionarios/{id}`

## Observações

O backend não faz parte deste projeto. O frontend usa somente requisições HTTP para consumir a API publicada e envia o token JWT no cabeçalho `Authorization` nas rotas privadas.
