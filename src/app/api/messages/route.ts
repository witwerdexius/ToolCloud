import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  receiver_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  booking_id: z.string().uuid().optional(),
});

// GET /api/messages – Alle Nachrichten des eingeloggten Nutzers
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, sender:users!sender_id(id, name), receiver:users!receiver_id(id, name)"
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

// POST /api/messages – Nachricht senden
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  if (parsed.data.receiver_id === user.id) {
    return NextResponse.json(
      { error: "Du kannst dir nicht selbst schreiben" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: parsed.data.receiver_id,
      content: parsed.data.content,
      booking_id: parsed.data.booking_id ?? null,
      read: false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

// PATCH /api/messages – Nachrichten als gelesen markieren
export async function PATCH(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { message_ids } = await request.json();

  if (!Array.isArray(message_ids) || message_ids.length === 0) {
    return NextResponse.json({ error: "message_ids erforderlich" }, { status: 400 });
  }

  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .in("id", message_ids)
    .eq("receiver_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
