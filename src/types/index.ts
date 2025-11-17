export interface Names {
  [lang: string]: string;
}

export interface AlbumInfo {
  names: Names;
  name: string;
  link?: string;
  picture_thumb?: string;
  picture_small?: string;
  picture_full?: string;
  catalog?: string;
  release_date?: string;
  category?: string;
  classification?: string;
  media_format?: string;
  publisher?: {
    names: Names;
    link: string;
  };
  organizations?: Array<{
    names: Names;
    link: string;
    role: string;
  }>;
  arrangers?: string[];
  performers?: string[];
  composers?: string[];
  lyricists?: string[];
  discs?: Disc[];
  meta?: MetaInfo;
}

export interface Disc {
  name?: string;
  tracks: Track[];
}

export interface Track {
  names: Names;
  track_length?: string;
}

export interface MetaInfo {
  added_date?: string;
  added_user?: string;
  edited_date?: string;
  edited_user?: string;
  visitors?: number;
  freedb?: number;
  ttl?: number;
}

export interface ArtistInfo {
  names: Names;
  name: string;
  link?: string;
  picture_thumb?: string;
  picture_small?: string;
  picture_full?: string;
  aliases?: string[];
  birth_place?: string;
  birthdate?: string;
  notes?: string;
  discography?: AlbumEntry[];
  meta?: MetaInfo;
}

export interface AlbumEntry {
  date: string;
  roles?: string[];
  titles: Names;
  catalog: string;
  link: string;
  type: string;
  reprint?: boolean;
}

export interface ProductInfo {
  names: Names;
  name: string;
  link?: string;
  picture_thumb?: string;
  picture_small?: string;
  picture_full?: string;
  type?: string;
  description?: string;
  related?: Array<{
    names: Names;
    link: string;
    type: string;
  }>;
  albums?: AlbumEntry[];
  meta?: MetaInfo;
}

export interface OrgInfo {
  names: Names;
  name: string;
  link?: string;
  picture_thumb?: string;
  picture_small?: string;
  picture_full?: string;
  type?: string;
  region?: string;
  website?: string;
  staff?: Array<{
    names: Names;
    link: string;
    role: string;
  }>;
  releases?: AlbumEntry[];
  meta?: MetaInfo;
}

export interface EventInfo {
  name: string;
  link?: string;
  date?: string;
  series?: {
    name: string;
    link: string;
  };
  albums?: AlbumEntry[];
  meta?: MetaInfo;
}
