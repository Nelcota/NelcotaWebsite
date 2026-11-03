import { SOFTWARE_HOUSE } from '../src/lib/flags.ts';

/**
 * Where the BaaS landing is in the build under test. Run the suite with the same
 * SOFTWARE_HOUSE value the site was built with (src/lib/flags.ts).
 */
export const BAAS = SOFTWARE_HOUSE ? '/produtos/baas/' : '/';
export const BAAS_PT = SOFTWARE_HOUSE ? '/pt-br/produtos/baas/' : '/pt-br/';
