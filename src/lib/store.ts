// Simple client-side store for demo card generation system.
// Auth is localStorage-based and seeded from the DB dump admin user.

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
};

const SEED: Estudante[] = [
  {
    id_est: "a1f2c3d4-0001",
    nome: "Alexandre Cassua",
    contacto: "+244 923 111 222",
    genero: "Masculino",
    email: "cassuaalexandre3@gmail.com",
    bi: "004512345LA041",
    codigo: 20260001,
    curso: "Licenciatura em Ciências da Computação",
    ano_letivo: "2025-2026",
    status: "Matriculado",
  },
  {
    id_est: "a1f2c3d4-0002",
    nome: "Beatriz Ferreira",
    contacto: "+244 924 555 010",
    genero: "Feminino",
    email: "beatriz.ferreira@imetro.ao",
    bi: "005612378LA042",
    codigo: 20260002,
    curso: "Licenciatura em Direito",
    ano_letivo: "2025-2026",
    status: "Matriculado",
  },
  {
    id_est: "a1f2c3d4-0003",
    nome: "Carlos Miguel Sebastião",
    contacto: "+244 925 220 733",
    genero: "Masculino",
    email: "carlos.sebastiao@imetro.ao",
    bi: "006723456LA038",
    codigo: 20260003,
    curso: "Licenciatura em Engenharia Civil",
    ano_letivo: "2025-2026",
    status: "Matriculado",
  },
  {
    id_est: "a1f2c3d4-0004",
    nome: "Deolinda Manuel",
    contacto: "+244 926 981 400",
    genero: "Feminino",
    email: "deolinda.manuel@imetro.ao",
    bi: "007834512LA044",
    codigo: 20260004,
    curso: "Licenciatura em Economia",
    ano_letivo: "2025-2026",
    status: "Admitido",
  },
  {
    id_est: "a1f2c3d4-0005",
    nome: "Edson Paulo Kiala",
    contacto: "+244 927 010 918",
    genero: "Masculino",
    email: "edson.kiala@imetro.ao",
    bi: "008945677LA045",
    codigo: 20260005,
    curso: "Licenciatura em Arquitectura",
    ano_letivo: "2025-2026",
    status: "Matriculado",
  },
  {
    id_est: "a1f2c3d4-0006",
    nome: "Fátima Domingas João",
    contacto: "+244 928 456 771",
    genero: "Feminino",
    email: "fatima.joao@imetro.ao",
    bi: "009056788LA046",
    codigo: 20260006,
    curso: "Licenciatura em Jornalismo",
    ano_letivo: "2025-2026",
    status: "Pendente",
  },
];

const STUDENTS_KEY = "imetro.estudantes";
const AUTH_KEY = "imetro.auth";

export function getEstudantes(): Estudante[] {
  if (typeof window === "undefined") return SEED;
  const raw = window.localStorage.getItem(STUDENTS_KEY);
  if (!raw) {
    window.localStorage.setItem(STUDENTS_KEY, JSON.stringify(SEED));
    return SEED;
  }
  try {
    return JSON.parse(raw) as Estudante[];
  } catch {
    return SEED;
  }
}

export function getEstudante(id: string): Estudante | undefined {
  return getEstudantes().find((e) => e.id_est === id);
}

export function saveEstudante(est: Estudante) {
  const list = getEstudantes();
  const idx = list.findIndex((e) => e.id_est === est.id_est);
  if (idx >= 0) list[idx] = est;
  else list.push(est);
  window.localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
}

// Auth
export function login(email: string, senha: string): boolean {
  // Seeded admin from DB dump: arturpaulo929@gmail.com
  // We accept the seeded admin (any non-empty password) for demo purposes.
  if (!email || !senha) return false;
  const ok =
    email.trim().toLowerCase() === "arturpaulo929@gmail.com" &&
    senha.length >= 4;
  if (!ok) return false;
  window.localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ email, nome: "Artur Paulo", at: Date.now() })
  );
  return true;
}

export function getSession(): { email: string; nome: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  window.localStorage.removeItem(AUTH_KEY);
}
