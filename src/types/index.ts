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
  categories?: string[];
  classification?: string;
  media_format?: string;
  publish_format?: string;
  barcode?: string;
  publisher?: {
    names: Names;
    link: string;
  };
  distributor?: {
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
  vocals?: string[];
  discs?: Disc[];
  notes?: string;
  bootleg?: boolean;
  bootleg_of?: {
    catalog: string;
    link: string;
    note?: string;
  };
  reprints?: Array<{
    catalog: string;
    link: string;
    note?: string;
  }>;
  release_events?: Array<{
    name: string;
    shortname: string;
    link: string;
  }>;
  release_price?: {
    price: string | number;
    currency?: string;
  };
  rating?: number;
  votes?: number;
  products?: Array<{
    names: Names;
    link?: string;
  }>;
  platforms?: string[];
  related?: Array<{
    catalog: string;
    link: string;
    type: string;
    names: Names;
    date?: string;
  }>;
  stores?: Array<{
    link: string;
    name: string;
  }>;
  websites?: Record<
    string,
    Array<{
      link: string;
      name: string;
    }>
  >;
  covers?: Array<{
    name: string;
    thumb: string;
    medium: string;
    full: string;
  }>;
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
  sex?: 'male' | 'female';
  type?: string;
  alias_of?: {
    names: Names;
    link?: string;
  };
  name_real?: string;
  name_trans?: string;
  aliases?:
    | Array<{
        names?: Names;
        link?: string;
      }>
    | string[];
  birth_place?: string;
  birthdate?: string;
  deathdate?: string;
  notes?: string;
  info?: Record<string, unknown>;
  members?: Array<{
    names: Names;
    link?: string;
  }>;
  units?: Array<{
    names: Names;
    link?: string;
  }>;
  organizations?: Array<{
    names: Names;
    link?: string;
  }>;
  discography?: AlbumEntry[];
  featured_on?: AlbumEntry[];
  websites?: Record<
    string,
    Array<{
      link: string;
      name: string;
    }>
  >;
  twitter_names?: string[];
  meta?: MetaInfo;
}

export interface AlbumEntry {
  date?: string;
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
  name_real?: string;
  link?: string;
  picture_thumb?: string;
  picture_small?: string;
  picture_full?: string;
  type?: string;
  description?: string;
  release_date?: string;
  franchises?: Array<{
    names: Names;
    link: string;
  }>;
  organizations?: Array<{
    names: Names;
    link?: string;
  }>;
  superproduct?: {
    names: Names;
    link?: string;
  };
  subproducts?: Array<{
    date?: string;
    names: Names;
    link?: string;
    type?: string;
  }>;
  titles?: Array<{
    date?: string;
    names: Names;
    link?: string;
    type?: string;
  }>;
  releases?: Array<{
    date?: string;
    names: Names;
    link?: string;
    region: string;
    platform: string;
  }>;
  websites?: Record<
    string,
    Array<{
      link: string;
      name: string;
    }>
  >;
  albums?: Array<{
    date: string;
    classifications?: string[];
    titles: Names;
    catalog: string;
    link: string;
    type: string;
  }>;
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
  description?: string;
  website?: string;
  websites?: Record<
    string,
    Array<{
      link: string;
      name: string;
    }>
  >;
  staff?: Array<{
    names: Names;
    link: string;
    owner?: boolean;
  }>;
  releases?: Array<{
    role: string;
    catalog: string;
    reprint?: boolean;
    event?: {
      link: string;
      name: string;
      shortname: string;
    };
    date?: string;
    link?: string;
    titles: Names;
    type?: string;
  }>;
  meta?: MetaInfo;
}

export interface EventInfo {
  name: string;
  link?: string;
  startdate?: string;
  enddate?: string;
  series?: {
    name: string;
    link: string;
  };
  notes?: string;
  releases?: Array<{
    release_type?: string;
    catalog: string;
    album_type?: string;
    titles: Names;
    link: string;
    release_date?: string;
    publisher?: {
      link?: string;
      names: Names;
    };
  }>;
  meta?: MetaInfo;
}
