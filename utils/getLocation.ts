export interface ServerLocation {
  city: string,
  region: string,
  country: string,
  postCode: string,
  regionCode: string,
  countryCode: string,
  coords: {
    latitude: number,
    longitude: number,
  },
  isp: string,
  timezone: string,
  languages: string,
  currency: string,
  currencyCode: string,
  // ...
};

export const getLocation = (response: any): ServerLocation => {
  return {
    city: response.city,
    region: response.region,
    country: response.country_name,
    postCode: response.postal,
    regionCode: response.region_code,
    countryCode: response.country_code,
    coords: {
      latitude: response.latitude,
      longitude: response.longitude,
    },
    isp: response.org,
    timezone: response.timezone,
    languages: response.languages,
    currencyCode: response.currency,
    currency: response.currency_name,
    // ...
  };
};