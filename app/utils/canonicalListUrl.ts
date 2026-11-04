import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import { buildSearchParams, normalizeSearchService } from '@/utils/searchServices'

type ListQuery = LocationQuery | LocationQueryRaw

// Values that mean "no filter": the pages write them as leftovers (`state=`, `state=null`, `course=0`).
const EMPTY_VALUES = new Set(['', 'null', 'undefined', '0'])

const firstValue = (value: ListQuery[string]): string => {
  const raw = Array.isArray(value) ? value[0] : value
  return String(raw ?? '').trim()
}

// The canonical URL of a filtered list page (search, school finder, post list). One filter is reachable under
// many query strings: empty or "null" leftovers, a "0" placeholder, a stray space, a legacy type name, a sort,
// page or keyword. Google counts each one as a separate page and reports them as "Duplicate without
// user-selected canonical". Only `keys` are kept, in that order, trimmed and without empty values.
export const canonicalListUrl = (host: string, path: string, query: ListQuery, keys: readonly string[]): string => {
  const params = new URLSearchParams()
  for (const key of keys) {
    const value = firstValue(query[key])
    if (!EMPTY_VALUES.has(value)) params.append(key, value)
  }
  const search = params.toString()
  return `https://${host}${path}${search ? `?${search}` : ''}`
}

// The filters each search service actually sends to the API (see buildSearchParams), so a filter the
// current service ignores can't make a second URL for the same results. The keyword (`title`) is left out:
// free-text searches would make an endless set of near-duplicate pages.
const SEARCH_IGNORED_PARAMS = new Set(['page', 'perpage', 'noTypesStats', 'is_paper', 'type', 'title'])

export const canonicalSearchUrl = (host: string, query: ListQuery): string => {
  const type = normalizeSearchService(query.type)
  const filterKeys = Object.keys(buildSearchParams({ ...query, type }, 1, 1))
    .filter(key => !SEARCH_IGNORED_PARAMS.has(key))
  // The legacy aliases (`test`, `azmoon`, `dars`, ...) all fold into the current service name.
  return canonicalListUrl(host, '/search', { ...query, type }, ['type', ...filterKeys])
}
