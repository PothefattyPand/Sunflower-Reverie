import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { revalidateSecret } from "@/sanity/env";

export async function POST(req: NextRequest) {
  try {
    // If a webhook secret is configured, authenticate the incoming request
    if (revalidateSecret) {
      const headerSecret = req.headers.get("x-sanity-webhook-secret") || req.headers.get("authorization");
      const paramSecret = req.nextUrl.searchParams.get("secret");
      const matched = headerSecret === revalidateSecret || headerSecret === `Bearer ${revalidateSecret}` || paramSecret === revalidateSecret;

      if (!matched) {
        return NextResponse.json({ message: "Invalid revalidation secret" }, { status: 401 });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty or non-JSON body is acceptable for general revalidation pings
    }

    const { _type, slug, category } = body;

    // Invalidate data cache tags
    try {
      revalidateTag("publications", "default");
    } catch {
      // Fallback
    }

    try {
      revalidateTag("author", "default");
    } catch {
      // Fallback
    }

    // Revalidate affected route paths
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/blogs");
    revalidatePath("/poetry");
    revalidatePath("/journal");
    revalidatePath("/writings");

    const slugStr = typeof slug === "string" ? slug : slug?.current;

    // If author document changed, revalidate author's profile page
    if (_type === "author" && slugStr) {
      revalidatePath(`/authors/${slugStr}`);
    }

    // If specific publication changed, revalidate its dynamic page
    if (category && slugStr) {
      const catPath = category === "writing" ? "writings" : category;
      revalidatePath(`/${catPath}/${slugStr}`);
    }

    return NextResponse.json({
      revalidated: true,
      type: _type || "all",
      now: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error revalidating";
    return NextResponse.json({ message }, { status: 500 });
  }
}
