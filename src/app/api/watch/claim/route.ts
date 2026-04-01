import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { claimFreeMovieIfNeeded } from "@/lib/access";
import { getMovieById } from "@/lib/movies";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { movieId } = (await req.json()) as { movieId?: string };
  if (!movieId || !getMovieById(movieId)) {
    return NextResponse.json({ error: "Invalid movie" }, { status: 400 });
  }
  await claimFreeMovieIfNeeded(session.user.id, movieId);
  return NextResponse.json({ ok: true });
}
