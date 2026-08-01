"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const hasError = Boolean(state?.error);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-lg font-semibold">Admin kirish</h1>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={state?.email}
            aria-invalid={hasError}
            aria-describedby={hasError ? "login-error" : undefined}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Parol</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={hasError}
            aria-describedby={hasError ? "login-error" : undefined}
          />
        </div>

        {state?.error && (
          <p id="login-error" role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Tekshirilmoqda..." : "Kirish"}
        </Button>
      </form>
    </div>
  );
}
