"use server"

import { getSessionToken } from "@/lib/session"
import { gql, isStrapiEnabled, StrapiError } from "@/lib/strapi/client"
import type { ActionResult } from "./checkout"

export interface PaymentAccount {
  method: "bank" | "wallet"
  provider: string
  accountTitle: string
  accountNumber: string
  iban?: string | null
  instructions?: string | null
}

/** Bank / wallet accounts from Store settings (empty when none are set up). */
export async function getPaymentAccounts(method: string): Promise<PaymentAccount[]> {
  if (!isStrapiEnabled()) return []
  try {
    const { paymentAccounts } = await gql<{ paymentAccounts: PaymentAccount[] }>(
      `query($method: String) { paymentAccounts(method: $method) { method provider accountTitle accountNumber iban instructions } }`,
      { method },
      { revalidate: 300, tags: ["global"] }
    )
    return paymentAccounts
  } catch {
    return []
  }
}

/** Customer reports a bank/wallet payment; the store verifies it before it counts. */
export async function submitPayment(input: { orderNumber: string; phone?: string; reference: string; amount?: number }): Promise<ActionResult<{ message: string }>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Payments need the store backend." }
  try {
    const { submitPayment } = await gql<{ submitPayment: { message: string } }>(
      `mutation($input: SubmitPaymentInput!) { submitPayment(input: $input) { message } }`,
      {
        input: {
          orderNumber: input.orderNumber.trim().toUpperCase(),
          phone: input.phone?.replace(/\s/g, "") || null,
          reference: input.reference.trim(),
          amount: input.amount ?? null,
        },
      },
      { jwt: await getSessionToken() }
    )
    return { ok: true, data: { message: submitPayment.message } }
  } catch (error) {
    return { ok: false, error: error instanceof StrapiError ? error.message : "Something went wrong. Please try again." }
  }
}
