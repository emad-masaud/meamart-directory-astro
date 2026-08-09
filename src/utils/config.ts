import { siteConfig } from '~/site.config';

export async function getActiveConfig(astroContext?: any) {
  return siteConfig;
}
