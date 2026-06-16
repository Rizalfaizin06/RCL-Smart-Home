"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const FALLBACK_AVATAR =
  "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (password && password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password && password !== confirm) {
      return setError("Passwords do not match.");
    }

    const payload: {
      name: string;
      email: string;
      avatar_url: string | null;
      password?: string;
    } = {
      name: name.trim(),
      email: email.trim(),
      avatar_url: avatarUrl.trim() || null,
    };
    if (password) payload.password = password;

    setSubmitting(true);
    try {
      const updated = await authApi.updateProfile(payload);
      setUser(updated);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Edit profile" subtitle="Update your account details" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar preview */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src={avatarUrl.trim() || FALLBACK_AVATAR}
            alt={name || "Avatar"}
            width={88}
            height={88}
            className="h-22 w-22 rounded-full object-cover ring-4 ring-zinc-100"
            unoptimized
          />
        </div>

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

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
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input
            id="avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            autoComplete="off"
          />
          <p className="mt-1.5 text-xs text-muted">
            Paste a link to an image. Leave empty to use the default avatar.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-medium">Change password</p>
          <p className="mb-3 text-xs text-muted">
            Leave blank to keep your current password.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
