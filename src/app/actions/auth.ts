"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { REFERRAL_COOKIE } from "@/lib/referral-cookie"
import { clearSession, setSessionToken } from "@/lib/session"
import { gql, isStrapiEnabled, StrapiError } from "@/lib/strapi/client"
import type { ActionResult } from "./checkout"

type AuthPayload = { jwt: string; user: { username: string; email: string } }

const friendly = (error: unknown) => {
  const message = error instanceof StrapiError ? error.message : ""
  if (/invalid identifier or password/i.test(message)) return "Incorrect email or password."
  if (/email.*taken|already taken/i.test(message)) return "An account with this email already exists."
  if (/too many requests/i.test(message)) return "Too many attempts — please wait a minute and try again."
  return message || "Something went wrong. Please try again."
}

/**
 * Applies a remembered `?ref=` invite to a freshly signed-in account. The backend only credits new
 * accounts without orders, so it is safe to try after every sign-in; the cookie is used once either way.
 */
async function claimPendingReferral(jwt: string) {
  const jar = await cookies()
  const code = jar.get(REFERRAL_COOKIE)?.value
  if (!code) return
  jar.delete(REFERRAL_COOKIE)
  await gql(`mutation($code: String!) { claimReferral(code: $code) { ok } }`, { code }, { jwt }).catch(() => {})
}

export async function login(identifier: string, password: string): Promise<ActionResult<{ name: string }>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Accounts need the store backend." }
  try {
    const { login } = await gql<{ login: AuthPayload }>(
      `mutation Login($input: UsersPermissionsLoginInput!) { login(input: $input) { jwt user { username email } } }`,
      { input: { identifier: identifier.trim().toLowerCase(), password, provider: "local" } }
    )
    await setSessionToken(login.jwt)
    await claimPendingReferral(login.jwt)
    return { ok: true, data: { name: login.user.username } }
  } catch (error) {
    return { ok: false, error: friendly(error) }
  }
}

export async function register(name: string, email: string, password: string): Promise<ActionResult<{ name: string }>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Accounts need the store backend." }
  try {
    const { register } = await gql<{ register: AuthPayload }>(
      `mutation Register($input: UsersPermissionsRegisterInput!) { register(input: $input) { jwt user { username email } } }`,
      // Strapi requires a unique username — the email is unique, so use it (the name is saved on the profile).
      { input: { username: email.trim().toLowerCase(), email: email.trim().toLowerCase(), password } }
    )
    await setSessionToken(register.jwt)
    if (name.trim()) {
      await gql(`mutation($n: String!) { updateMyProfile(fullName: $n) { fullName } }`, { n: name.trim() }, { jwt: register.jwt }).catch(() => {})
    }
    await claimPendingReferral(register.jwt)
    return { ok: true, data: { name: name.trim() || register.user.username } }
  } catch (error) {
    return { ok: false, error: friendly(error) }
  }
}

/** Sends the reset link (always reports success so emails can't be probed for existing accounts). */
export async function requestPasswordReset(email: string): Promise<ActionResult<null>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Accounts need the store backend." }
  try {
    await gql(`mutation Forgot($email: String!) { forgotPassword(email: $email) { ok } }`, { email: email.trim().toLowerCase() })
  } catch (error) {
    if (error instanceof StrapiError && error.code === "RATE_LIMITED") return { ok: false, error: error.message }
  }
  return { ok: true, data: null }
}

/** Completes the reset with the code from the email and signs the customer in. */
export async function resetPassword(code: string, password: string): Promise<ActionResult<null>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Accounts need the store backend." }
  try {
    const { resetPassword } = await gql<{ resetPassword: AuthPayload }>(
      `mutation Reset($code: String!, $password: String!) {
        resetPassword(code: $code, password: $password, passwordConfirmation: $password) { jwt user { username email } }
      }`,
      { code, password }
    )
    await setSessionToken(resetPassword.jwt)
    return { ok: true, data: null }
  } catch (error) {
    const message = error instanceof StrapiError ? error.message : ""
    return { ok: false, error: /incorrect code|code/i.test(message) ? "This reset link is invalid or has expired. Please request a new one." : friendly(error) }
  }
}

/** Emails a one-time 6-digit sign-in code (passwordless login; new emails get an account). */
export async function requestLoginCode(email: string): Promise<ActionResult<string>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Accounts need the store backend." }
  try {
    const { requestLoginCode } = await gql<{ requestLoginCode: { message: string } }>(
      `mutation($email: String!) { requestLoginCode(email: $email) { message } }`,
      { email: email.trim().toLowerCase() }
    )
    return { ok: true, data: requestLoginCode.message }
  } catch (error) {
    return { ok: false, error: friendly(error) }
  }
}

export async function verifyLoginCode(email: string, code: string): Promise<ActionResult<null>> {
  if (!isStrapiEnabled()) return { ok: false, error: "Accounts need the store backend." }
  try {
    const { verifyLoginCode } = await gql<{ verifyLoginCode: { jwt: string } }>(
      `mutation($email: String!, $code: String!) { verifyLoginCode(email: $email, code: $code) { jwt } }`,
      { email: email.trim().toLowerCase(), code }
    )
    await setSessionToken(verifyLoginCode.jwt)
    await claimPendingReferral(verifyLoginCode.jwt)
    return { ok: true, data: null }
  } catch (error) {
    return { ok: false, error: friendly(error) }
  }
}

export async function logout() {
  await clearSession()
  redirect("/login")
}
