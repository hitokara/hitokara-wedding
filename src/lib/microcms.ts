/**
 * microCMS client setup
 *
 * Usage:
 *   import { client } from '@/lib/microcms';
 *   const data = await client.get({ endpoint: 'creators' });
 *
 * Requires env vars:
 *   MICROCMS_SERVICE_DOMAIN
 *   MICROCMS_API_KEY
 */

// ---------- Types ----------
export interface MicroCMSImage {
  url: string;
  height: number;
  width: number;
}

export interface MicroCMSContent {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

export interface Creator extends MicroCMSContent {
  name: string;
  role: string;
  image?: MicroCMSImage;
  profile?: string;
  slug: string;
}

export interface JournalArticle extends MicroCMSContent {
  title: string;
  slug: string;
  body: string;
  thumbnail?: MicroCMSImage;
  category?: string[];
}

export interface Venue extends MicroCMSContent {
  name: string;
  area: string;
  image?: MicroCMSImage;
  capacity?: string;
}

// ---------- Client placeholder ----------
// The actual client will be initialized when microcms-js-sdk is configured.
// For now, export a placeholder that throws if called without env vars.

function getServiceDomain(): string {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN;
  if (!domain) {
    throw new Error("MICROCMS_SERVICE_DOMAIN is not set");
  }
  return domain;
}

function getApiKey(): string {
  const key = process.env.MICROCMS_API_KEY;
  if (!key) {
    throw new Error("MICROCMS_API_KEY is not set");
  }
  return key;
}

export const microCMSConfig = {
  get serviceDomain() {
    return getServiceDomain();
  },
  get apiKey() {
    return getApiKey();
  },
};

// TODO: Initialize the actual client:
// import { createClient } from 'microcms-js-sdk';
// export const client = createClient({
//   serviceDomain: microCMSConfig.serviceDomain,
//   apiKey: microCMSConfig.apiKey,
// });
