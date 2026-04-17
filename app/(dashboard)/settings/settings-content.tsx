'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, CreditCard, Check, Zap } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { sanitizePlainText } from '@/lib/security/input-sanitize';

interface SettingsContentProps {
  profile: Profile;
}

export function SettingsContent({ profile }: SettingsContentProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const sanitizedFullName = sanitizePlainText(fullName, 100);
    setFullName(sanitizedFullName);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ full_name: sanitizedFullName })
      .eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setBillingError(data.error ?? 'Unable to start checkout right now.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setBillingError('Billing provider did not return a checkout URL.');
    } catch {
      setBillingError('Unable to connect to billing right now.');
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    setManagingBilling(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setBillingError(data.error ?? 'Unable to open billing portal right now.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setBillingError('Billing provider did not return a billing portal URL.');
    } catch {
      setBillingError('Unable to connect to billing right now.');
    } finally {
      setManagingBilling(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            Manage your account and billing
          </p>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8 max-w-2xl">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-[#EDE9FE] p-6 mb-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-shadow duration-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-500" />
            Profile
          </h2>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs text-gray-500 mb-1"
              >
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saved && (
                <span className="text-emerald-600 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved successfully
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Plan Section */}
        <div className="bg-white rounded-2xl border border-[#EDE9FE] p-6 shadow-[0_1px_3px_rgba(124,58,237,0.06)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-shadow duration-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet-500" />
            Plan &amp; Billing
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-gray-600">Current plan:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                profile.plan === 'pro'
                  ? 'bg-violet-100 text-violet-700 border border-violet-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              {profile.plan === 'pro' ? '⚡ Pro' : 'Free'}
            </span>
          </div>

          {profile.plan === 'free' ? (
            <div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-5 mb-4">
                <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-600" />
                  Upgrade to Pro
                </h3>
                <ul className="text-gray-600 text-sm space-y-1.5 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-violet-500" />
                    Unlimited widgets
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-violet-500" />
                    Remove &quot;Powered by ProofEngine&quot; badge
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-violet-500" />
                    Priority support
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {upgrading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={managingBilling}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {managingBilling ? 'Redirecting...' : 'Manage billing'}
            </button>
          )}
          {billingError ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {billingError}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
