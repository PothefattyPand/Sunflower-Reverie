"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Feather, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { resetPasswordAction } from "@/app/author/actions";

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Your new password must be at least 8 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The entered passwords do not match. Please verify both fields.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await resetPasswordAction(null, formData);

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.success) {
        setIsSuccess(true);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Botanical Header Card */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
          <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
          <span>Editorial Key Replacement</span>
        </div>

        <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
          Choose Fresh Password
        </h1>

        <p className="font-kalam text-lg text-[#6B584C]">
          &ldquo;Set a new secret password to safeguard your writing sanctuary.&rdquo;
        </p>
      </div>

      {/* Main Form Box */}
      <div className="relative rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 p-8 shadow-xs">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-nunito flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Password Notice</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#FFF9EC] border border-[#718B55]/40 text-[#3B3028] text-sm font-nunito space-y-3">
              <div className="flex items-center gap-2 text-[#718B55] font-patrick font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Password Successfully Updated</span>
              </div>
              <p className="leading-relaxed text-[#6B584C]">
                Your new secret password has been securely stored. You can now use your updated credentials to enter your editorial writing desk.
              </p>
            </div>

            <Link
              href="/author/login?success=password_updated"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-base font-bold transition-all shadow-xs"
            >
              <span>Enter Author Sanctuary Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block font-patrick text-base font-bold text-[#3B3028]"
              >
                New Secret Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-sm text-[#3B3028] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] font-nunito transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block font-patrick text-base font-bold text-[#3B3028]"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password..."
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
                  <span>Securing New Password...</span>
                ) : (
                  <>
                    <span>Update Secret Password</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-8 pt-5 border-t border-[#EADBCE]/80 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#718B55] font-nunito font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Strict Two-Author Boundary</span>
          </div>
          <p className="font-nunito text-xs text-[#6B584C] leading-relaxed">
            Only authorized co-curators with an active recovery session can complete password updates.
          </p>
        </div>
      </div>

      {/* Return Home Link */}
      <div className="text-center mt-8">
        <Link
          href="/author/login"
          className="inline-flex items-center gap-1.5 text-sm font-patrick font-semibold text-[#6B584C] hover:text-[#3B3028] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Author Sanctuary Login</span>
        </Link>
      </div>
    </div>
  );
}

