/**
 * Instagram Graph API Integration
 * Auto-posts ads to Instagram when they are created and paid.
 */

function formatRupiah(price: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

interface CaptionData {
  title: string;
  price: number | string;
  description: string;
  condition: string;
  location: string;
  contactPhone: string;
  categoryName: string;
}

function buildCaption(data: CaptionData): string {
  const { title, price, description, condition, location, contactPhone, categoryName } = data;
  
  return [
    `🛍️ ${title}`,
    `💰 ${formatRupiah(price)}`,
    ``,
    `🏷️ Kategori: ${categoryName}`,
    `✨ Kondisi: ${condition === "NEW" ? "Baru" : "Bekas"}`,
    `📍 Lokasi: ${location}`,
    `📲 WhatsApp: ${contactPhone}`,
    ``,
    `📝 Deskripsi:`,
    `${description}`,
    ``,
    `📲 Chat langsung via link di bio!`,
    ``,
    `#JualinAja #JualBeliBandung #JualBeli #Bandung #SecondHand #BarangBekas #BarangBaru #MarketplaceBandung #${categoryName.replace(/\s+/g, '')}`,
  ].join("\n");
}

export async function postToInstagram(
  imageUrl: string,
  data: CaptionData
): Promise<void> {
  const accountId = process.env.IG_ACCOUNT_ID;
  const accessToken = process.env.IG_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    console.error("[Instagram] IG_ACCOUNT_ID or IG_ACCESS_TOKEN is missing in environment variables!");
    return;
  }

  console.log(`[Instagram] Starting post for: ${data.title}`);
  console.log(`[Instagram] Image URL: ${imageUrl}`);

  try {
    const caption = buildCaption(data);

    // Step 1: Create media container
    console.log("[Instagram] Step 1: Creating media container...");
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
      console.error("[Instagram] Step 1 Failed:", JSON.stringify(containerData.error, null, 2));
      return;
    }

    const creationId = containerData.id;
    console.log(`[Instagram] Step 1 Success! Creation ID: ${creationId}`);

    // Step 2: Publish the container
    console.log("[Instagram] Step 2: Publishing container...");
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
      console.error("[Instagram] Step 2 Failed:", JSON.stringify(publishData.error, null, 2));
      return;
    }

    console.log(`[Instagram] Step 2 Success! Post ID: ${publishData.id}`);
  } catch (error) {
    console.error("[Instagram] Critical error in postToInstagram:", error);
  }
}
