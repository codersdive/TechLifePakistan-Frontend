/** Shape of the `myReferrals` query (refer-a-friend dashboard on the account page). */
export interface ReferralSummary {
  enabled: boolean
  code: string
  referralsRequired: number
  qualifyOn: "first_delivered_order" | "signup"
  rewardText: string
  rewardValidDays?: number | null
  repeatable: boolean
  terms?: string | null
  qualifiedCount: number
  pendingCount: number
  progress: number
  remaining: number
  referrals: { name: string; status: "pending" | "qualified" | "rejected"; joinedAt: string }[]
  rewards: { code: string; description: string; endsAt?: string | null; used: boolean; expired: boolean }[]
}

export const REFERRAL_FIELDS = `enabled code referralsRequired qualifyOn rewardText rewardValidDays repeatable terms qualifiedCount pendingCount progress remaining
  referrals { name status joinedAt }
  rewards { code description endsAt used expired }`
