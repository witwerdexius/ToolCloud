import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Nachrichten – ToolCloud" };

export default async function MessagesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/messages");

  const { data: messages } = await supabase
    .from("messages")
    .select(
      "*, sender:users!sender_id(id, name), receiver:users!receiver_id(id, name)"
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  // Konversationen gruppieren (nach "anderer Nutzer")
  type Convo = {
    otherId: string;
    otherName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastMessage: any;
    unread: number;
  };

  const convMap = new Map<string, Convo>();
  for (const msg of messages ?? []) {
    const isSender = msg.sender_id === user.id;
    const otherId = isSender ? msg.receiver_id : msg.sender_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherUser = isSender ? (msg.receiver as any) : (msg.sender as any);

    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        otherId,
        otherName: otherUser?.name ?? "Unbekannt",
        lastMessage: msg,
        unread: 0,
      });
    }
    if (!isSender && !msg.read) {
      convMap.get(otherId)!.unread++;
    }
  }

  const conversations = Array.from(convMap.values());

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Nachrichten</h1>

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500">Noch keine Nachrichten.</p>
            <p className="mt-1 text-sm text-gray-400">
              Nachrichten erscheinen hier, sobald du mit einem Vermieter oder
              Ausleiher kommunizierst.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.otherId}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                  {conv.otherName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{conv.otherName}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(conv.lastMessage.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage.sender_id === user.id && (
                      <span className="text-gray-400">Du: </span>
                    )}
                    {conv.lastMessage.content}
                  </p>
                </div>

                {/* Unread Badge */}
                {conv.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {conv.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
