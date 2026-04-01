import prisma from "@/lib/db";

export type AccessResult =
  | {
      allowed: true;
      via: "subscription" | "free_monthly" | "dev_unlimited";
    }
  | { allowed: false; reason: "subscription_required" };

/** Emails with full catalog access (no monthly cap). Set DEV_UNLIMITED_EMAILS in .env (comma-separated). */
export function isDevUnlimitedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  const fromEnv = (process.env.DEV_UNLIMITED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv.includes(lower)) return true;
  if (
    process.env.NODE_ENV === "development" &&
    lower === "akbolon@gmail.com"
  ) {
    return true;
  }
  return false;
}

export async function getWatchAccess(
  userId: string,
  movieId: string,
): Promise<AccessResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, reason: "subscription_required" };

  if (isDevUnlimitedEmail(user.email)) {
    return { allowed: true, via: "dev_unlimited" };
  }

  const now = new Date();
  const activeSub =
    user.subscriptionStatus === "active" &&
    user.subscriptionPeriodEnd &&
    user.subscriptionPeriodEnd > now;

  if (activeSub) {
    return { allowed: true, via: "subscription" };
  }

  const month = now.toISOString().slice(0, 7);

  if (!user.freeMovieMonth || user.freeMovieMonth !== month) {
    return { allowed: true, via: "free_monthly" };
  }

  if (user.freeMovieId === movieId) {
    return { allowed: true, via: "free_monthly" };
  }

  return { allowed: false, reason: "subscription_required" };
}

export async function claimFreeMovieIfNeeded(
  userId: string,
  movieId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  if (isDevUnlimitedEmail(user.email)) return;

  const now = new Date();
  const activeSub =
    user.subscriptionStatus === "active" &&
    user.subscriptionPeriodEnd &&
    user.subscriptionPeriodEnd > now;
  if (activeSub) return;

  const month = now.toISOString().slice(0, 7);

  if (!user.freeMovieMonth || user.freeMovieMonth !== month) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeMovieMonth: month, freeMovieId: movieId },
    });
    return;
  }

  if (user.freeMovieId === movieId) return;
}
