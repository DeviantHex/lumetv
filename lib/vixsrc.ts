export async function checkMultipleOnVixsrc(
  type: "movie" | "tv",
  ids: number[],
  onBatch?: (availableIds: number[]) => void // optional callback for streaming
) {
  if (!ids || ids.length === 0) return [];

  const BATCH_SIZE = 150;
  const CONCURRENCY = 4; // number of batches to fetch in parallel
  const results: number[] = [];

  // Split ids into chunks
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    chunks.push(ids.slice(i, i + BATCH_SIZE));
  }

  // Process batches with limited concurrency
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);

    const batchResults = await Promise.all(
      batch.map(async (chunk) => {
        try {
          const res = await fetch("/api/check-availability-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, ids: chunk }),
          });

          if (!res.ok) return [];
          const data = await res.json();
          if (!data || !Array.isArray(data.results)) return [];

          return data.results.filter((r: any) => r.ok).map((r: any) => r.id);
        } catch (err) {
          console.error("Batch Vixsrc check failed for chunk", err);
          return [];
        }
      })
    );

    const flatBatch = batchResults.flat();
    results.push(...flatBatch);
    console.log('Vixsrc batch results:', flatBatch);

    // Stream callback
    if (onBatch && flatBatch.length > 0) {
      onBatch(flatBatch); // update UI as soon as this batch is done
    }
  }

  return results;
}
