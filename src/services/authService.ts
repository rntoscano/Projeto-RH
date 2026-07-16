import type { Usuario, UsuarioAutenticado, UsuarioCadastro, UsuarioLogin } from '../models/Usuario';
import { getCachedList, upsertCachedItem } from '../utils/localCache';
import { getPhotoForApi } from '../utils/photoUpload';
import { api } from './api';

const USUARIOS_CACHE_KEY = 'projeto-rh:cache:usuarios';

export async function autenticarUsuario(dados: UsuarioLogin): Promise<UsuarioAutenticado> {
  const response = await api.post<UsuarioAutenticado>('/usuarios/logar', dados);
  const cachedUsuario = getCachedList<Usuario>(USUARIOS_CACHE_KEY).find(
    (usuario) => usuario.usuario === response.data.usuario || usuario.usuario === dados.usuario,
  );
  const usuarioAutenticado = { ...response.data, foto: response.data.foto || cachedUsuario?.foto };

  upsertCachedItem(
    USUARIOS_CACHE_KEY,
    {
      id: usuarioAutenticado.id,
      nome: usuarioAutenticado.nome,
      cpf: cachedUsuario?.cpf ?? '',
      usuario: usuarioAutenticado.usuario,
      foto: usuarioAutenticado.foto,
    },
    ['usuario', 'cpf'],
  );
  return usuarioAutenticado;
}

export async function cadastrarUsuario(dados: UsuarioCadastro): Promise<Usuario> {
  const response = await api.post<Usuario>('/usuarios/cadastrar', {
    ...dados,
    foto: getPhotoForApi(dados.foto),
  });
  const usuario = { ...response.data, cpf: response.data.cpf || dados.cpf, foto: response.data.foto || dados.foto };
  upsertCachedItem(USUARIOS_CACHE_KEY, usuario, ['usuario', 'cpf']);
  return usuario;
}
