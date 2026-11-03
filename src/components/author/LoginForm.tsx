"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Feather, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { loginAuthorAction, AuthState } from "@/app/author/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlSuccess = searchParams.get("success");

  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAuthorAction,
    {}
  );

  let initialErrorMessage: string | null = null;
  if (urlError === "unauthorized") {
    initialErrorMessage =
      "Access restricted. Only the authorized curator (nadvihasan107@gmail.com) has publishing access.";
  } else if (urlError === "not_configured") {
    initialErrorMessage =
      "Supabase backend configuration is pending. Please verify your environment variables.";
  } else if (urlError === "recovery_failed") {
    initialErrorMessage =
      "The password recovery link was invalid, expired, or has already been used. Please request a fresh recovery link below.";
  } else if (urlError === "session_required") {
    initialErrorMessage =
      "A valid recovery session is required. Please use the link sent to your email or enter your credentials.";
  }

  let successMessage: string | null = null;
  if (urlSuccess === "password_updated") {
    successMessage =
      "Your secret password has been updated successfully beneath the morning light. You may now enter your writing desk.";
  }

  const errorMessage = state?.error || initialErrorMessage;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Botanical Header Card */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
          <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
          <span>Private Editorial Desk</span>
        </div>

        <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
          Author Sanctuary
        </h1>

        <p className="font-kalam text-lg text-[#6B584C]">
          &ldquo;One pen, one unhurried voice, one quiet garden.&rdquo;
        </p>
      </div>

      {/* Main Login Box */}
      <div className="relative rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 p-8 shadow-xs">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-nunito flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Authentication Notice</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && !errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#FFF9EC] border border-[#718B55]/40 text-[#3B3028] text-xs sm:text-sm font-nunito flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#718B55] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#718B55]">Password Successfully Updated</p>
              <p className="leading-relaxed text-[#6B584C]">{successMessage}</p>
            </div>
          </div>
        )}

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

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block font-patrick text-base font-bold text-[#3B3028]"
            >
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-sm text-[#3B3028] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] font-nunito transition-colors"
              />
            </div>
            {/* Forgot Password Link */}
            <div className="flex items-center justify-end pt-1">
              <Link
                href="/author/forgot-password"
                className="font-patrick text-sm font-bold text-[#E8AF30] hover:text-[#3B3028] underline-offset-2 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-lg font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <span>Entering Writing Desk...</span>
              ) : (
                <>
                  <span>Enter My Writing Desk</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 pt-5 border-t border-[#EADBCE]/80 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#718B55] font-nunito font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Single-Author Sanctuary</span>
          </div>
          <p className="font-nunito text-xs text-[#6B584C] leading-relaxed">
            Public visitor registration is strictly disabled. Only the verified author has publishing credentials.
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
