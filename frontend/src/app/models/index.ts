export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface AuthResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
  tiempoExpiracion: string;
}

export interface Usuario {
  usuarioId?: number;
  UsuarioID?: number;
  nombreUsuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  cedula?: string;
  rol: string;
  departamento?: string;
  ubicacionId?: number;
}

export interface Dispositivo {
  dispositivoID?: number;
  codigoDispositivo: string;
  nombreDispositivo: string;
  categoriaId: number;
  marcaId: number;
  modelo: string;
  numeroSerie?: string;
  numeroParte?: string;
  procesador?: string;
  memoriaRAM?: string;
  almacenamiento?: string;
  sistemaOperativo?: string;
  versionSO?: string;
  proveedorId?: number;
  fechaCompra?: string;
  precioCompra?: number;
  vencimientoGarantia?: string;
  numeroFactura?: string;
  estado: 'Disponible' | 'Asignado' | 'En Reparacion' | 'Dado de Baja' | 'Perdido';
  condicion: 'Excelente' | 'Bueno' | 'Regular' | 'Malo';
  ubicacionId?: number;
  observaciones?: string;
  nombreCategoria?: string;
  nombreMarca?: string;
  nombreUbicacion?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  creadoPor?: string;
  estadoGarantia?: string;
  totalArchivos?: number;
}

export interface Categoria {
  categoriaID: number;
  nombreCategoria: string;
  descripcion?: string;
  totalDispositivos: number;
}

export interface Marca {
  marcaID: number;
  nombreMarca: string;
  descripcion?: string;
  totalDispositivos: number;
}

export interface Ubicacion {
  ubicacionID: number;
  nombreUbicacion: string;
  direccion?: string;
  piso?: string;
  edificio?: string;
  ciudad?: string;
  provincia?: string;
  totalDispositivos: number;
}

export interface Proveedor {
  proveedorID: number;
  nombreProveedor: string;
  nombreContacto?: string;
  email?: string;
  telefono?: string;
  ruc?: string;
  ciudad?: string;
  totalDispositivos: number;
}

export interface Estadisticas {
  general: {
    totalDispositivos: number;
    disponibles: number;
    asignados: number;
    enReparacion: number;
    dadosDeBaja: number;
    perdidos: number;
    garantiaVencida: number;
    garantiaPorVencer: number;
    precioPromedio: number;
    valorTotalInventario: number;
  };
  porCategoria: { nombreCategoria: string; cantidad: number }[];
  porMarca: { nombreMarca: string; cantidad: number }[];
  porUbicacion: { nombreUbicacion: string; cantidad: number }[];
}