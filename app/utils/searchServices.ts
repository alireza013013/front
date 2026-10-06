import type {
  LegacySearchType,
  SearchServiceId,
  SearchTypeAlias,
} from '@/types/search'

const SEARCH_SERVICE_BY_TYPE = {
  'test': 'paper',
  'learnfiles': 'multimedia',
  'azmoon': 'quizhub',
  'question': 'forum',
  'dars': 'tutorial',
  'paper': 'paper',
  'study-materials': 'study-materials',
  'multimedia': 'multimedia',
  'quizhub': 'quizhub',
  'forum': 'forum',
  'tutorial': 'tutorial',
  'teacher': 'teacher',
} satisfies Record<SearchTypeAlias, SearchServiceId>

const LEGACY_TYPE_BY_SEARCH_SERVICE = {
  'paper': 'test',
  'study-materials': 'test',
  'multimedia': 'learnfiles',
  'quizhub': 'azmoon',
  'forum': 'question',
  'tutorial': 'dars',
  'test': 'test',
  'learnfiles': 'learnfiles',
  'azmoon': 'azmoon',
  'question': 'question',
  'dars': 'dars',
  'teacher': 'teacher',
} satisfies Record<SearchTypeAlias, LegacySearchType>

const isSearchTypeAlias = (type: string): type is SearchTypeAlias =>
  Object.prototype.hasOwnProperty.call(SEARCH_SERVICE_BY_TYPE, type)

export const normalizeSearchService = (type: unknown): SearchServiceId => {
  const key = String(type ?? '')
  return isSearchTypeAlias(key) ? SEARCH_SERVICE_BY_TYPE[key] : 'paper'
}

export const getLegacySearchType = (type: unknown): LegacySearchType => {
  const key = String(type ?? '')
  return isSearchTypeAlias(key) ? LEGACY_TYPE_BY_SEARCH_SERVICE[key] : 'test'
}
