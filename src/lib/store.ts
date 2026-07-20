// Simple client-side store for demo card generation system.

export type Estudante = {
  id_est: string;
  nome: string;
  contacto: string;
  genero: "Masculino" | "Feminino";
  email: string;
  bi: string;
  codigo: number;
  curso: string;
  ano_letivo: string;
  status: "Matriculado" | "Admitido" | "Pendente";
  foto?: string;
  tema?: string;
};

export type TipoPessoa = "Funcionário" | "Docente" | "Estudante";

export type Pessoa = {
  id: string;
  nome: string;
  tipo: TipoPessoa;
  cargo: string; // curso para estudante, cargo para funcionário/docente
  email: string;
  contacto: string;
  bi: string;
  codigo: number;
  genero: "Masculino" | "Feminino";
  ano_letivo: string;
  status: "Activo" | "Inactivo" | "Pendente";
  foto?: string;
  tema?: string;
};

export type Curso = {
  id: string;
  nome: string;
  grau: "Licenciatura" | "Mestrado" | "Técnico";
  duracao: string;
  coordenador: string;
  estudantes: number;
};

export type Utilizador = {
  id: string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Operador" | "Consulta";
  ultimo_acesso: string;
  activo: boolean;
};

export type CartaoEmitido = {
  id: string;
  pessoa_id: string;
  titular: string;
  subtitulo: string;
  tipo: TipoPessoa;
  codigo_cartao: string;
  emitido_em: string; // ISO
  validade: string; // ISO
  estado: "Emitido" | "Revogado" | "Expirado";
  foto?: string;
  tema?: string;
};

const SEED_ESTUDANTES: Estudante[] = [
  { id_est: "a1f2c3d4-0001", nome: "Alexandre Cassua", contacto: "+244 923 111 222", genero: "Masculino", email: "cassuaalexandre3@gmail.com", bi: "004512345LA041", codigo: 20260001, curso: "Licenciatura em Ciências da Computação", ano_letivo: "2025-2026", status: "Matriculado" },
  { id_est: "a1f2c3d4-0002", nome: "Beatriz Ferreira", contacto: "+244 924 555 010", genero: "Feminino", email: "beatriz.ferreira@imetro.ao", bi: "005612378LA042", codigo: 20260002, curso: "Licenciatura em Direito", ano_letivo: "2025-2026", status: "Matriculado" },
  { id_est: "a1f2c3d4-0003", nome: "Carlos Miguel Sebastião", contacto: "+244 925 220 733", genero: "Masculino", email: "carlos.sebastiao@imetro.ao", bi: "006723456LA038", codigo: 20260003, curso: "Licenciatura em Engenharia Civil", ano_letivo: "2025-2026", status: "Matriculado" },
  { id_est: "a1f2c3d4-0004", nome: "Deolinda Manuel", contacto: "+244 926 981 400", genero: "Feminino", email: "deolinda.manuel@imetro.ao", bi: "007834512LA044", codigo: 20260004, curso: "Licenciatura em Economia", ano_letivo: "2025-2026", status: "Admitido" },
  { id_est: "a1f2c3d4-0005", nome: "Edson Paulo Kiala", contacto: "+244 927 010 918", genero: "Masculino", email: "edson.kiala@imetro.ao", bi: "008945677LA045", codigo: 20260005, curso: "Licenciatura em Arquitectura", ano_letivo: "2025-2026", status: "Matriculado" },
  { id_est: "a1f2c3d4-0006", nome: "Fátima Domingas João", contacto: "+244 928 456 771", genero: "Feminino", email: "fatima.joao@imetro.ao", bi: "009056788LA046", codigo: 20260006, curso: "Licenciatura em Jornalismo", ano_letivo: "2025-2026", status: "Pendente" },
];

const SEED_PESSOAS: Pessoa[] = [
  { id: "p-f-0001", nome: "Artur Paulo", tipo: "Funcionário", cargo: "Coordenador de Admissões e Matrículas", email: "arturpaulo929@gmail.com", contacto: "+244 923 000 001", bi: "003344556LA040", codigo: 20260001, genero: "Masculino", ano_letivo: "2025-2026", status: "Activo" },
  { id: "p-f-0002", nome: "Helena Vieira", tipo: "Funcionário", cargo: "Secretária Académica", email: "helena.vieira@imetro.ao", contacto: "+244 923 000 002", bi: "003344557LA040", codigo: 20260002, genero: "Feminino", ano_letivo: "2025-2026", status: "Activo" },
  { id: "p-d-0001", nome: "Prof. João Bengui", tipo: "Docente", cargo: "Ciências da Computação", email: "joao.bengui@imetro.ao", contacto: "+244 923 100 010", bi: "004411223LA041", codigo: 20260101, genero: "Masculino", ano_letivo: "2025-2026", status: "Activo" },
  ...SEED_ESTUDANTES.slice(0, 3).map<Pessoa>((e) => ({
    id: e.id_est, nome: e.nome, tipo: "Estudante", cargo: e.curso, email: e.email, contacto: e.contacto,
    bi: e.bi, codigo: e.codigo, genero: e.genero, ano_letivo: e.ano_letivo,
    status: e.status === "Matriculado" ? "Activo" : e.status === "Admitido" ? "Pendente" : "Inactivo",
  })),
];

const SEED_CURSOS: Curso[] = [
  { id: "c-001", nome: "Ciências da Computação", grau: "Licenciatura", duracao: "4 anos", coordenador: "Prof. João Bengui", estudantes: 42 },
  { id: "c-002", nome: "Direito", grau: "Licenciatura", duracao: "5 anos", coordenador: "Prof. Marta Silva", estudantes: 68 },
  { id: "c-003", nome: "Engenharia Civil", grau: "Licenciatura", duracao: "5 anos", coordenador: "Prof. Nuno Alberto", estudantes: 55 },
  { id: "c-004", nome: "Economia", grau: "Licenciatura", duracao: "4 anos", coordenador: "Prof. Cláudia Neto", estudantes: 39 },
  { id: "c-005", nome: "Arquitectura", grau: "Licenciatura", duracao: "5 anos", coordenador: "Prof. Rui Cabral", estudantes: 27 },
  { id: "c-006", nome: "Jornalismo", grau: "Licenciatura", duracao: "4 anos", coordenador: "Prof. Ana Bento", estudantes: 22 },
];

const SEED_UTILIZADORES: Utilizador[] = [
  { id: "u-001", nome: "Artur Paulo", email: "arturpaulo929@gmail.com", perfil: "Administrador", ultimo_acesso: "2026-07-19", activo: true },
  { id: "u-002", nome: "Helena Vieira", email: "helena.vieira@imetro.ao", perfil: "Operador", ultimo_acesso: "2026-07-18", activo: true },
  { id: "u-003", nome: "Registo Académico", email: "registo@imetro.ao", perfil: "Consulta", ultimo_acesso: "2026-07-10", activo: false },
];

const SEED_CARTOES: CartaoEmitido[] = [
  {
    id: "ct-0001",
    pessoa_id: "p-f-0001",
    titular: "Artur Paulo",
    subtitulo: "Coordenador de Admissões e Matrículas",
    tipo: "Funcionário",
    codigo_cartao: "IM-2026-0001",
    emitido_em: "2026-07-19",
    validade: "2027-07-19",
    estado: "Emitido",
  },
];

const STUDENTS_KEY = "imetro.estudantes";
const PESSOAS_KEY = "imetro.pessoas";
const CURSOS_KEY = "imetro.cursos";
const USERS_KEY = "imetro.utilizadores";
const CARDS_KEY = "imetro.cartoes";
const AUTH_KEY = "imetro.auth";

function readOr<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(key);
  if (!raw) { window.localStorage.setItem(key, JSON.stringify(seed)); return seed; }
  try { return JSON.parse(raw) as T; } catch { return seed; }
}
function write<T>(key: string, val: T) { window.localStorage.setItem(key, JSON.stringify(val)); }

export function getEstudantes(): Estudante[] { return readOr(STUDENTS_KEY, SEED_ESTUDANTES); }
export function getEstudante(id: string): Estudante | undefined { return getEstudantes().find((e) => e.id_est === id); }
export function saveEstudante(est: Estudante) {
  const list = getEstudantes();
  const idx = list.findIndex((e) => e.id_est === est.id_est);
  if (idx >= 0) list[idx] = est; else list.push(est);
  write(STUDENTS_KEY, list);
}

export function getPessoas(): Pessoa[] { return readOr(PESSOAS_KEY, SEED_PESSOAS); }
export function getPessoa(id: string): Pessoa | undefined { return getPessoas().find((p) => p.id === id); }
export function addPessoa(input: Omit<Pessoa, "id" | "codigo"> & { codigo?: number }): Pessoa {
  const list = getPessoas();
  const prefix = input.tipo === "Funcionário" ? "p-f" : input.tipo === "Docente" ? "p-d" : "p-e";
  const seq = String(list.filter((p) => p.id.startsWith(prefix)).length + 1).padStart(4, "0");
  const codigo = input.codigo ?? Math.max(20260000, ...list.map((p) => p.codigo)) + 1;
  const nova: Pessoa = { ...input, id: `${prefix}-${seq}`, codigo };
  list.unshift(nova);
  write(PESSOAS_KEY, list);
  return nova;
}

export function getCursos(): Curso[] { return readOr(CURSOS_KEY, SEED_CURSOS); }
export function getUtilizadores(): Utilizador[] { return readOr(USERS_KEY, SEED_UTILIZADORES); }

export function getCartoesEmitidos(): CartaoEmitido[] { return readOr(CARDS_KEY, SEED_CARTOES); }
export function updatePessoa(p: Pessoa) {
  const list = getPessoas();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    list[idx] = p;
    write(PESSOAS_KEY, list);
  }
}
export function emitirCartao(pessoa: Pessoa, custom?: { foto?: string; tema?: string }): CartaoEmitido {
  const list = getCartoesEmitidos();
  
  // Se já existe e há dados customizados novos, atualiza no histórico
  const existingIdx = list.findIndex((c) => c.pessoa_id === pessoa.id && c.estado === "Emitido");
  const existing = existingIdx >= 0 ? list[existingIdx] : null;
  if (existing) {
    if (custom) {
      existing.foto = custom.foto ?? existing.foto ?? pessoa.foto;
      existing.tema = custom.tema ?? existing.tema ?? pessoa.tema;
      write(CARDS_KEY, list);
    }
    return existing;
  }

  const seq = String(list.length + 1).padStart(4, "0");
  const now = new Date();
  const val = new Date(now); val.setFullYear(val.getFullYear() + 1);
  const rec: CartaoEmitido = {
    id: `ct-${seq}`,
    pessoa_id: pessoa.id,
    titular: pessoa.nome,
    subtitulo: pessoa.cargo,
    tipo: pessoa.tipo,
    codigo_cartao: `IM-${now.getFullYear()}-${seq}`,
    emitido_em: now.toISOString().slice(0, 10),
    validade: val.toISOString().slice(0, 10),
    estado: "Emitido",
    foto: custom?.foto ?? pessoa.foto,
    tema: custom?.tema ?? pessoa.tema,
  };
  list.unshift(rec);
  write(CARDS_KEY, list);
  return rec;
}

// Auth
export function login(email: string, senha: string): boolean {
  if (!email || !senha) return false;
  const ok = email.trim().toLowerCase() === "arturpaulo929@gmail.com" && senha.length >= 4;
  if (!ok) return false;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify({ email, nome: "Artur Paulo", at: Date.now() }));
  return true;
}
export function getSession(): { email: string; nome: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function logout() { window.localStorage.removeItem(AUTH_KEY); }
