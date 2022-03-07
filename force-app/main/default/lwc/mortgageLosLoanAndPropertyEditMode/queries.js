export const COUNTY_CODES_QUERY = `query mortgagePublicRefiCounties($args: CountyInput) {
    mortgagePublicRefiCounties(args: $args) {
      fipsCountyCode
      name
    }
  }`