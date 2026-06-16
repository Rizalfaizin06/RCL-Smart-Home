"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House } from "lucide-react";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call POST /auth/login and store the JWT
    router.push("/dashboard");
  };

  return (
    <div>
      <div className="mb-8 md:hidden">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-accent-foreground">
          <House className="h-6 w-6" />
        </span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to control your smart home.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="mb-1.5 text-xs font-medium text-muted hover:text-foreground">
              Forgot?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-foreground">
          Sign up
        </Link>
      </p>
    </div>
  );
}
