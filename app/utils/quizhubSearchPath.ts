/** Filters the QuizHub search page reads from its query string. */
export interface QuizhubSearchFilters {
  section?: string
  base?: string
  lesson?: string
  exam_type?: string
  topic?: string
}

/** The QuizHub search list for these filters; empty ones are left out. */
export const quizhubSearchPath = (filters: QuizhubSearchFilters) => {
  const query = new URLSearchParams({ type: 'quizhub' })
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      query.set(key, value)
    }
  }
  return `/search?${query}`
}
