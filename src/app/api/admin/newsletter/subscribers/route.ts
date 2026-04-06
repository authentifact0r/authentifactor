import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { email, phone, firstName, lastName, emailOptIn, smsOptIn } = await request.json();
    if (!email && !phone) return NextResponse.json({ error: "Email or phone required" }, { status: 400 });

    const subscriber = await tdb.subscriber.create({
      data: {
        email: email || null,
        phone: phone || null,
        firstName: firstName || null,
        lastName: lastName || null,
        emailOptIn: emailOptIn ?? true,
        smsOptIn: smsOptIn ?? false,
        source: "manual",
      },
    });
    return NextResponse.json({ subscriber }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "This email is already subscribed" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
