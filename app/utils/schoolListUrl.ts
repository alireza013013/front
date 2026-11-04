export type SchoolListScope = 'country' | 'state' | 'city'

interface SchoolLocation {
  countryId?: number | null
  stateId?: number | null
  cityId?: number | null
}

/** Link to the school list filtered down to one level of a school's location. */
export function buildSchoolListUrl(scope: SchoolListScope, school: SchoolLocation): string {
  const query: Record<string, string> = {}
  if (school.countryId) query.country = String(school.countryId)
  if ((scope === 'state' || scope === 'city') && school.stateId) query.state = String(school.stateId)
  if (scope === 'city' && school.cityId) query.city = String(school.cityId)
  const params = new URLSearchParams(query).toString()
  return params ? `/school?${params}` : '/school'
}
