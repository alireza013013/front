import type { BillingInterval, UserSubscriptionUsagePeriod } from '@/types'

export const BILLING_INTERVALS = [
  'Daily',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Annual',
] as const

export const BILLING_INTERVAL_DAYS: Record<BillingInterval, number> = {
  Daily: 1,
  Weekly: 7,
  Monthly: 30,
  Quarterly: 90,
  Annual: 365,
}

export const BILLING_INTERVAL_SUFFIX: Record<BillingInterval, string> = {
  Daily: 'per day',
  Weekly: 'per week',
  Monthly: 'per month',
  Quarterly: 'every 3 months',
  Annual: 'per year',
}

export const BILLING_INTERVAL_PERIOD_LABEL: Record<BillingInterval, string> = {
  Daily: 'day',
  Weekly: 'week',
  Monthly: 'month',
  Quarterly: 'quarter',
  Annual: 'year',
}

// Matches Localizer.Value["SwitchNotAllowedWhileCancellationPending"] in
// Gama-back's SubscriptionService.cs - the backend only ever sets this on
// ApiErrorItem.message (never .code), so match against message for now.
// FRAGILE: IStringLocalizer returns the raw key as a fallback only because no
// translation resource exists for this key yet - the moment one is added
// (any locale), this equality check silently stops matching. ApiErrorItem
// already has an optional `code` field for exactly this case; ask backend to
// populate it on this error and switch this match to error.code once it does.
export const SWITCH_NOT_ALLOWED_WHILE_CANCELLATION_PENDING_ERROR = 'SwitchNotAllowedWhileCancellationPending'

// How a usage row shows its feature and which page its content lives on. Keys are the backend's
// FeatureCodes constants; a code missing here still renders, just with a generic icon and no link.
export const SUBSCRIPTION_USAGE_FEATURES: Record<string, { icon: string, contentLabel: string, path?: (id: number) => string }> = {
  PastpaperDownload: { icon: 'md:description', contentLabel: 'Paper', path: id => `/paper/${id}` },
  MultimediaDownload: { icon: 'md:movie', contentLabel: 'Multimedia', path: id => `/multimedia/${id}` },
  TestDownload: { icon: 'md:quiz', contentLabel: 'Test', path: id => `/test/${id}` },
  TestSubmission: { icon: 'md:quiz', contentLabel: 'Test', path: id => `/test/${id}` },
  ExamDownload: { icon: 'md:assignment', contentLabel: 'Exam', path: id => `/exam/${id}` },
  ExamParticipation: { icon: 'md:assignment', contentLabel: 'Exam', path: id => `/exam/${id}` },
  ExamAnalysis: { icon: 'md:psychology', contentLabel: 'Exam', path: id => `/exam/${id}` },
}

export const SUBSCRIPTION_USAGE_PERIODS: { value: UserSubscriptionUsagePeriod, title: string }[] = [
  { value: 'billingPeriod', title: 'This billing period' },
  { value: 'last30Days', title: 'Last 30 days' },
  { value: 'allTime', title: 'All time' },
]
