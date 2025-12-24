export const servicesEndpoints = {
  searchServices: (search: string, limit = 10) =>
    `/api/homeowners/search-services?search=${encodeURIComponent(search)}&limit=${limit}`,

  featuredExperts: (scCodes: string[], zipCodes: string[]) => {
    // Some backends expect literal bracket keys (service_category_codes[]=X)
    // and may not parse URL-encoded brackets (%5B%5D). Keep brackets literal.
    const parts: string[] = [];
    scCodes.forEach((code) =>
      parts.push(`service_category_codes[]=${encodeURIComponent(code)}`)
    );
    zipCodes.forEach((zip) => parts.push(`zip_codes[]=${encodeURIComponent(zip)}`));
    return `/api/featured_experts?${parts.join('&')}`;
  },

  memberLeadBySlug: () => '/api/affiliate/memberleadbyslug',

  generalLeadV1: () => '/api/affiliate/generalleadv1',
} as const;
