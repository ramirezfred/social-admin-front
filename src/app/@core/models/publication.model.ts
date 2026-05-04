export interface PublicationImage {
  id: number;
  publication_id: number;
  image_path: string;
  url: string;
}

export interface Supplier {
  id: number;
  razon_social: string;
  telefono: string;
  direccion: string;
  contacto: string;
  categoria: string;
  status: boolean;
}

export interface Publication {
  id?: number;
  supplier_id: number;
  texto: string;
  estado: 'borrador' | 'publicada';
  publication_date?: string;
  images: PublicationImage[];
  supplier?: Supplier;
  created_at?: string;
  // campos offline
  _localId?: string;
  _offline?: boolean;
}