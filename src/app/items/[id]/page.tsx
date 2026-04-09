// Gegenstand-Detailseite
// Route: /items/[id]

interface Props {
  params: { id: string };
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = params;

  // TODO Phase 1: Supabase-Query für Item-Daten
  // TODO Phase 1: ItemGallery-Komponente
  // TODO Phase 1: BookingBox-Komponente
  // TODO Phase 1: OwnerCard-Komponente
  // TODO Phase 2: ReviewList-Komponente

  return (
    <main>
      <p>Item {id} – Details folgen in Phase 1</p>
    </main>
  );
}
