export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface RegisterRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  cedula?: string;
  rol: 'Administrador' | 'Tecnico';
  departamento?: string;
  ubicacionId?: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  usuario: {
    usuarioId: number;
    nombreUsuario: string;
    email: string;
    nombres: string;
    apellidos: string;
    rol: string;
  };
  message: string;
}

export interface UserProfile {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  cedula?: string;
  rol: string;
  departamento?: string;
  ubicacionId?: number;
}
