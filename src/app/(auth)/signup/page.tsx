"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Surface } from "@/components/ui/Surface";
import { PRODUCT_CONFIG } from "@/config/product";
import { signupAction } from "@/features/auth/actions";
import { AuthActionResult } from "@/features/auth/schemas/auth-schema";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signupAction,
    null
  );

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Surface variant="raised" className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
            D
          </div>
          <h1 className="text-xl font-bold text-dsa-text">{PRODUCT_CONFIG.name}</h1>
          <p className="text-xs text-dsa-muted">Create your personal account</p>
        </div>

        {state?.error && (
          <div className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {state.error}
          </div>
        )}

        <form className="space-y-4" action={formAction}>
          <div>
            <label className="block text-xs font-semibold text-dsa-text mb-1.5 uppercase tracking-wider">
              Display Name
            </label>
            <input
              name="displayName"
              type="text"
              placeholder="Abhijeet"
              required
              disabled={isPending}
              className="w-full px-4 py-2.5 rounded-xl border border-dsa-border bg-canvas-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dsa-text mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isPending}
              className="w-full px-4 py-2.5 rounded-xl border border-dsa-border bg-canvas-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dsa-text mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              className="w-full px-4 py-2.5 rounded-xl border border-dsa-border bg-canvas-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold text-sm shadow-soft transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-dsa-muted pt-2 border-t border-dsa-border/60">
          Already have an account?{" "}
          <Link href="/login" className="text-brand font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </Surface>
    </div>
  );
}
