"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Feather, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { requestPasswordResetPublicAction, AuthState } from "@/app/author/actions";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    requestPasswordResetPublicAction,
    {}
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Botanical Header Card */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
          <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
          <span>Private Editorial Recovery</span>
        </div>

        <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
          Recover Sanctuary Key
        </h1>

        <p className="font-kalam text-lg text-[#6B584C]">
          &ldquo;Enter your registered author email to receive an unhurried recovery link.&rdquo;
        </p>
      </div>

      {/* Main Form Box */}
      <div className="relative rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 p-8 shadow-xs">
        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-nunito flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Recovery Notice</p>
              <p className="leading-relaxed">{state.error}</p>
            </div>
          </div>
        )}

        {state?.success ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#FFF9EC] border border-[#718B55]/40 text-[#3B3028] text-sm font-nunito space-y-3">
              <div className="flex items-center gap-2 text-[#718B55] font-patrick font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Recovery Dispatch Sent</span>
              </div>
              <p className="leading-relaxed text-[#6B584C]">
                If this email address belongs to our authorized author, a secure recovery link has been dispatched to your inbox.
              </p>
              <p className="text-xs text-[#6B584C]/80 leading-relaxed italic">
                Please check your inbox (and spam folder if needed). The recovery link will grant you access to set a fresh secret password.
              </p>
            </div>

            <Link
              href="/author/login"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-base font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Author Sanctuary Login</span>
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-patrick text-base font-bold text-[#3B3028]"
              >
                Author Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="author@sunflowerreverie.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-sm text-[#3B3028] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] font-nunito transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-lg font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group"
              >
                {isPending ? (
                  <span>Dispatching Recovery Link...</span>
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Back to Login Link */}
            <div className="text-center pt-2">
              <Link
                href="/author/login"
                className="font-patrick text-sm font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
              >
                &larr; Remember your password? Return to Login
              </Link>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-8 pt-5 border-t border-[#EADBCE]/80 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#718B55] font-nunito font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Strict Privacy Protection</span>
          </div>
          <p className="font-nunito text-xs text-[#6B584C] leading-relaxed">
            Neutral confirmations are returned for all requests to protect author privacy and prevent email enumeration.
          </p>
        </div>
      </div>

      {/* Return Home Link */}
      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-patrick font-semibold text-[#6B584C] hover:text-[#3B3028] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sunflower Reverie Homepage</span>
        </Link>
      </div>
    </div>
  );
}

