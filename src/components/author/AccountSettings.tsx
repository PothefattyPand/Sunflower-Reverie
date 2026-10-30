"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  LogOut,
  Send,
} from "lucide-react";
import {
  changePasswordAction,
  requestPasswordResetAction,
} from "@/app/author/dashboard/actions";
import { logoutAuthorAction } from "@/app/author/actions";

interface AccountSettingsProps {
  userEmail: string;
}

export function AccountSettings({ userEmail }: AccountSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [isResetPending, startResetTransition] = useTransition();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await changePasswordAction(null, formData);

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Your password has been updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleSendResetEmail = () => {
    setErrorMessage(null);
    setResetMessage(null);

    startResetTransition(async () => {
      const res = await requestPasswordResetAction();
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setResetMessage(`A password recovery email has been sent to ${userEmail}. Check your inbox.`);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EADBCE]">
        <Link
          href="/author/dashboard"
          className="inline-flex items-center gap-2 text-base font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#E8AF30]" />
          <span>Back to My Writing Desk</span>
        </Link>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-nunito flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Security Notice</p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-nunito flex items-start gap-3 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-[#FFF3D9] border border-[#EADBCE] text-[#3B3028] text-sm font-nunito flex items-start gap-3 shadow-xs">
          <Mail className="w-5 h-5 text-[#E8AF30] shrink-0 mt-0.5" />
          <p className="font-semibold">{resetMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Account Details & Security Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-[#EADBCE] bg-[#FFF3D9]/60 p-6 space-y-4 shadow-xs">
            <span className="text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Editorial Account Email</span>
            </span>

            <div className="p-3.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE]">
              <span className="font-nunito font-bold text-sm text-[#3B3028] block truncate">
                {userEmail}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-patrick text-emerald-700 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Co-Curator</span>
              </span>
            </div>

            <p className="text-xs font-nunito text-[#6B584C] leading-relaxed">
              This email is registered with Supabase Authentication and is linked to Author 1 on the sanctuary allowlist.
            </p>
          </div>

          {/* Recovery Option */}
          <div className="rounded-3xl border border-[#EADBCE] bg-[#FFF3D9]/60 p-6 space-y-3 shadow-xs">
            <span className="text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold block flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Forgot Password?</span>
            </span>
            <p className="text-xs font-nunito text-[#6B584C] leading-relaxed">
              We can deliver a secure password reset link directly to your verified address.
            </p>
            <button
              type="button"
              disabled={isResetPending}
              onClick={handleSendResetEmail}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9EC] hover:bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick font-bold text-[#3B3028] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>{isResetPending ? "Sending..." : "Send Recovery Email"}</span>
            </button>
          </div>

          {/* Log Out Box */}
          <div className="rounded-3xl border border-[#EADBCE] bg-[#FFF3D9]/40 p-6 space-y-3">
            <span className="text-xs font-patrick uppercase tracking-wider text-[#6B584C] font-bold block">
              Editorial Session
            </span>
            <p className="text-xs font-nunito text-[#6B584C]">
              Signing out will close your private desk until your next visit.
            </p>
            <form action={logoutAuthorAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF9EC] hover:bg-amber-100 text-xs font-patrick font-bold text-red-800 border border-[#EADBCE] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Desk</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Change Password Form */}
        <div className="lg:col-span-7 rounded-3xl border border-[#EADBCE] bg-[#FFF3D9]/60 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-patrick uppercase tracking-widest text-[#718B55] font-bold">
              <KeyRound className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Secret Password</span>
            </div>
            <h2 className="font-caveat text-3xl font-bold text-[#3B3028]">
              Change Password
            </h2>
            <p className="font-nunito text-xs text-[#6B584C]">
              Update your account password. Reauthentication is required to verify identity.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="currentPassword"
                className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
              >
                Current Secret Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
              >
                New Secret Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
              >
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B584C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-sm font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#3B3028] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying &amp; Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

