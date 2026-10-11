import "server-only"

import { cache } from "react"
import { gql, isStrapiEnabled } from "@/lib/strapi/client"

export interface ReferralProgramInfo {
  enabled: boolean
  referralsRequired: number
  qualifyOn: "first_delivered_order" | "signup"
  rewardText: string
  popup: { enabled: boolean; title?: string | null; text?: string | null; delaySeconds: number; frequencyDays: number }
}

/** Public refer-a-friend settings (cached, tag "referral"), or null when there's no backend / it fails. */
export const getReferralProgram = cache(async (): Promise<ReferralProgramInfo | null> => {
  if (!isStrapiEnabled()) return null
  try {
    const { referralProgram } = await gql<{ referralProgram: ReferralProgramInfo }>(
      `{ referralProgram { enabled referralsRequired qualifyOn rewardText popup { enabled title text delaySeconds frequencyDays } } }`,
      {},
      { revalidate: 300, tags: ["referral"] }
    )
    return referralProgram
  } catch {
    return null
  }
})
