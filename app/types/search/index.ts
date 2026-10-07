import type { Ref } from 'vue'

export type SearchServiceId
  = | 'paper'
    | 'study-materials'
    | 'multimedia'
    | 'quizhub'
    | 'forum'
    | 'tutorial'
    | 'teacher'

export type LegacySearchType
  = | 'test'
    | 'learnfiles'
    | 'azmoon'
    | 'question'
    | 'dars'
    | 'teacher'

export type SearchTypeAlias = SearchServiceId | LegacySearchType

export type SearchFilterKey
  = | 'section'
    | 'base'
    | 'lesson'
    | 'type'
    | 'topic'
    | 'edu_year'
    | 'edu_month'
    | 'test_type'
    | 'variant'
    | 'exam_type'
    | 'content_type'

export type SearchConditionalFilter
  = | 'year'
    | 'session'
    | 'paper'
    | 'variant'
    | 'material'
    | 'topic'
    | 'exam-type'
    | 'content-type'

export interface SearchFilterOption {
  id: string | number
  title: string
  code?: string | number | null
  icon?: string | null
  apiIcon?: string | null
  is_paper?: boolean
  list_order?: string | number
}

export interface SearchServiceOption extends SearchFilterOption {
  id: SearchServiceId
  legacyApiType: LegacySearchType
  shortTitle: string
  isPaper: boolean | null
}

export interface SearchFilterDependency {
  key: SearchFilterKey
  sourceKey: 'id' | 'code'
}

export interface SearchFilterDefinition {
  key: SearchFilterKey
  title: string
  icon?: string
  dependsOn?: SearchFilterDependency[]
  staticOptions?: SearchFilterOption[]
  disabledUntilReady?: boolean
}

export interface SearchFilterState extends SearchFilterDefinition {
  loading: boolean
  disabled: boolean
  options: SearchFilterOption[]
  selected: SearchFilterOption | null
}

export type SearchFilterSelections = Partial<Record<SearchFilterKey, SearchFilterOption | undefined>>

export interface SearchFilterOptions {
  initialService?: SearchServiceId
  syncRouteQuery?: boolean
}

export interface SearchFilterResult {
  activeService: Ref<SearchServiceId>
  filters: Ref<SearchFilterState[]>
  selections: SearchFilterSelections
  setService: (service: SearchServiceId) => Promise<void>
  selectFilter: (key: SearchFilterKey, option: SearchFilterOption | null) => Promise<void>
  loadFilterOptions: (key: SearchFilterKey) => Promise<SearchFilterOption[]>
  resetFilters: () => Promise<void>
}
