/**
 * Instagram Graph API Integration
 * Auto-posts ads to Instagram when they are created.
 */

function formatRupiah(price: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function buildCaption(title: string, price: number | string, description: string): string {
  return [
    `🛍️ ${title}`,
    `💰 ${formatRupiah(price)}`,
    ``,
    `📝 ${description}`,
    ``,
    `📍 COD Bandung`,
    `📲 Chat langsung via link di bio!`,
    ``,
    `#JualinAja #JualBeliBandung #JualBeli #Bandung #SecondHand #BarangBekas #BarangBaru #MarketplaceBandung`,
  ].join("\n");
}

export async function postToInstagram(
  imageUrl: string,
  title: string,
  price: number | string,
  description: string
): Promise<void> {
  const accountId = process.env.IG_ACCOUNT_ID;
  const accessToken = process.env.IG_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    console.warn("[Instagram] IG_ACCOUNT_ID or IG_ACCESS_TOKEN not set. Skipping.");
    return;
  }

  try {
    const caption = buildCaption(title, price, description);

    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerRes.json();

    if (containerData.error) {
      console.error("[Instagram] Container creation failed:", containerData.error);
      return;
    }

    const creationId = containerData.id;
    if (!creationId) {
      console.error("[Instagram] No creation_id returned:", containerData);
      return;
    }

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishRes.json();

    if (publishData.error) {
      console.error("[Instagram] Publish failed:", publishData.error);
      return;
    }

    console.log("[Instagram] Successfully posted! Media ID:", publishData.id);
  } catch (error) {
    console.error("[Instagram] Unexpected error:", error);
    // Never throw — ad creation must not be blocked by IG failures
  }
}
