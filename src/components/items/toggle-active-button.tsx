"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ToggleActiveButtonProps {
  itemId: string;
  isActive: boolean;
}

export function ToggleActiveButton({ itemId, isActive }: ToggleActiveButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await supabase
      .from("items")
      .update({ is_active: !isActive })
      .eq("id", itemId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant={isActive ? "danger" : "secondary"}
      size="sm"
      loading={loading}
      onClick={handleToggle}
    >
      {isActive ? "Inserat deaktivieren" : "Inserat aktivieren"}
    </Button>
  );
}
