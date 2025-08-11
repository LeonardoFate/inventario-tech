// Interfaces actualizadas para coincidir EXACTAMENTE con el backend

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

// ✅ DISPOSITIVO ACTUALIZADO - PascalCase como viene del backend
export interface Dispositivo {
  DispositivoID?: number;          // PascalCase del backend
  dispositivoID?: number;          // Mantener compatibilidad
  CodigoDispositivo: string;       // PascalCase del backend
  codigoDispositivo?: string;      // Mantener compatibilidad
  NombreDispositivo: string;       // ⭐ Esta es la clave - PascalCase del backend
  nombreDispositivo?: string;      // Mantener compatibilidad
  CategoriaID?: number;            // PascalCase del backend
  categoriaId?: number;            // Mantener compatibilidad
  MarcaID?: number;                // PascalCase del backend
  marcaId?: number;                // Mantener compatibilidad
  Modelo: string;                  // PascalCase del backend
  modelo?: string;                 // Mantener compatibilidad
  NumeroSerie?: string;            // PascalCase del backend
  numeroSerie?: string;            // Mantener compatibilidad
  NumeroParte?: string;            // PascalCase del backend
  numeroParte?: string;            // Mantener compatibilidad
  Procesador?: string;             // PascalCase del backend
  procesador?: string;             // Mantener compatibilidad
  MemoriaRAM?: string;             // PascalCase del backend
  memoriaRAM?: string;             // Mantener compatibilidad
  Almacenamiento?: string;         // PascalCase del backend
  almacenamiento?: string;         // Mantener compatibilidad
  SistemaOperativo?: string;       // PascalCase del backend
  sistemaOperativo?: string;       // Mantener compatibilidad
  VersionSO?: string;              // PascalCase del backend
  versionSO?: string;              // Mantener compatibilidad
  ProveedorID?: number;            // PascalCase del backend
  proveedorId?: number;            // Mantener compatibilidad
  FechaCompra?: string;            // PascalCase del backend
  fechaCompra?: string;            // Mantener compatibilidad
  PrecioCompra?: number;           // PascalCase del backend
  precioCompra?: number;           // Mantener compatibilidad
  VencimientoGarantia?: string;    // PascalCase del backend
  vencimientoGarantia?: string;    // Mantener compatibilidad
  NumeroFactura?: string;          // PascalCase del backend
  numeroFactura?: string;          // Mantener compatibilidad
  Estado: 'Disponible' | 'Asignado' | 'En Reparacion' | 'Dado de Baja' | 'Perdido';  // PascalCase del backend
  estado?: 'Disponible' | 'Asignado' | 'En Reparacion' | 'Dado de Baja' | 'Perdido'; // Mantener compatibilidad
  Condicion: 'Excelente' | 'Bueno' | 'Regular' | 'Malo';  // PascalCase del backend
  condicion?: 'Excelente' | 'Bueno' | 'Regular' | 'Malo'; // Mantener compatibilidad
  UbicacionID?: number;            // PascalCase del backend
  ubicacionId?: number;            // Mantener compatibilidad
  Observaciones?: string;          // PascalCase del backend
  observaciones?: string;          // Mantener compatibilidad
  NombreCategoria?: string;        // PascalCase del backend - Viene de JOIN
  nombreCategoria?: string;        // Mantener compatibilidad
  NombreMarca?: string;            // PascalCase del backend - Viene de JOIN
  nombreMarca?: string;            // Mantener compatibilidad
  NombreUbicacion?: string;        // PascalCase del backend - Viene de JOIN
  nombreUbicacion?: string;        // Mantener compatibilidad
  FechaCreacion?: string;          // PascalCase del backend
  fechaCreacion?: string;          // Mantener compatibilidad
  FechaActualizacion?: string;     // PascalCase del backend
  fechaActualizacion?: string;     // Mantener compatibilidad
  CreadoPor?: string;              // PascalCase del backend
  creadoPor?: string;              // Mantener compatibilidad
  EstadoGarantia?: string;         // PascalCase del backend
  estadoGarantia?: string;         // Mantener compatibilidad
  TotalArchivos?: number;          // PascalCase del backend
  totalArchivos?: number;          // Mantener compatibilidad
}

export interface Categoria {
  CategoriaID: number;             // PascalCase del backend
  categoriaID?: number;            // Mantener compatibilidad
  NombreCategoria: string;         // PascalCase del backend
  nombreCategoria?: string;        // Mantener compatibilidad
  Descripcion?: string;            // PascalCase del backend
  descripcion?: string;            // Mantener compatibilidad
  TotalDispositivos: number;       // PascalCase del backend
  totalDispositivos?: number;      // Mantener compatibilidad
}

export interface Marca {
  MarcaID: number;                 // PascalCase del backend
  marcaID?: number;                // Mantener compatibilidad
  NombreMarca: string;             // PascalCase del backend
  nombreMarca?: string;            // Mantener compatibilidad
  Descripcion?: string;            // PascalCase del backend
  descripcion?: string;            // Mantener compatibilidad
  TotalDispositivos: number;       // PascalCase del backend
  totalDispositivos?: number;      // Mantener compatibilidad
}

export interface Ubicacion {
  UbicacionID: number;             // PascalCase del backend
  ubicacionID?: number;            // Mantener compatibilidad
  NombreUbicacion: string;         // PascalCase del backend
  nombreUbicacion?: string;        // Mantener compatibilidad
  Direccion?: string;              // PascalCase del backend
  direccion?: string;              // Mantener compatibilidad
  Piso?: string;                   // PascalCase del backend
  piso?: string;                   // Mantener compatibilidad
  Edificio?: string;               // PascalCase del backend
  edificio?: string;               // Mantener compatibilidad
  Ciudad?: string;                 // PascalCase del backend
  ciudad?: string;                 // Mantener compatibilidad
  Provincia?: string;              // PascalCase del backend
  provincia?: string;              // Mantener compatibilidad
  TotalDispositivos: number;       // PascalCase del backend
  totalDispositivos?: number;      // Mantener compatibilidad
}

export interface Proveedor {
  ProveedorID: number;             // PascalCase del backend
  proveedorID?: number;            // Mantener compatibilidad
  NombreProveedor: string;         // PascalCase del backend
  nombreProveedor?: string;        // Mantener compatibilidad
  NombreContacto?: string;         // PascalCase del backend
  nombreContacto?: string;         // Mantener compatibilidad
  Email?: string;                  // PascalCase del backend
  email?: string;                  // Mantener compatibilidad
  Telefono?: string;               // PascalCase del backend
  telefono?: string;               // Mantener compatibilidad
  RUC?: string;                    // PascalCase del backend
  ruc?: string;                    // Mantener compatibilidad
  Ciudad?: string;                 // PascalCase del backend
  ciudad?: string;                 // Mantener compatibilidad
  TotalDispositivos: number;       // PascalCase del backend
  totalDispositivos?: number;      // Mantener compatibilidad
}

export interface Estadisticas {
  general: {
    TotalDispositivos: number;
    Disponibles: number;
    Asignados: number;
    EnReparacion: number;
    DadosDeBaja: number;
    Perdidos: number;
    GarantiaVencida: number;
    GarantiaPorVencer: number;
    PrecioPromedio: number;
    ValorTotalInventario: number;
  };
  porCategoria: { 
    NombreCategoria: string;
    Cantidad: number;
  }[];
  porMarca: { 
    NombreMarca: string;
    Cantidad: number;
  }[];
  porUbicacion: { 
    NombreUbicacion: string;
    Cantidad: number;
  }[];
}

// Actualiza tu interface Usuario en frontend/src/app/models/index.ts

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
  // ✅ Agregar estas propiedades faltantes:
  password?: string;        // Para formularios de creación/edición
  activo?: boolean;         // Para indicar si el usuario está activo
  fechaCreacion?: string;   // Opcional - fecha de creación
  fechaUltimoAcceso?: string; // Opcional - último acceso
}

// Agregar al final de frontend/src/app/models/index.ts

// Interfaces para respuestas de API
export interface DispositivoResponse {
  dispositivo: Dispositivo;
  archivos: ArchivoDispositivo[];
  historial: HistorialDispositivo[];
}

export interface ArchivoDispositivo {
  ArchivoID?: number;
  archivoID?: number;
  DispositivoID?: number;
  dispositivoID?: number;
  NombreArchivo?: string;
  nombreArchivo?: string;
  TipoArchivo?: string;
  tipoArchivo?: string;
  RutaArchivo?: string;
  rutaArchivo?: string;
  TamanoArchivo?: number;
  tamanoArchivo?: number;
  TipoAdjunto?: string;
  tipoAdjunto?: string;
  FechaSubida?: string;
  fechaSubida?: string;
  SubidoPor?: string;
  subidoPor?: string;
}

export interface HistorialDispositivo {
  HistorialID?: number;
  historialID?: number;
  DispositivoID?: number;
  dispositivoID?: number;
  Accion?: string;
  accion?: string;
  Comentarios?: string;
  comentarios?: string;
  FechaAccion?: string;
  fechaAccion?: string;
  RealizadoPor?: string;
  realizadoPor?: string;
}