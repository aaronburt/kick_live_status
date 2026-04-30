const CLIENT_ID = process.env.KICK_CLIENT_ID;
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const SCAN_INTERVAL = parseInt(process.env.KICK_SCAN_INTERVAL || "30", 10) * 1000;
const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN;
const HA_API = "http://supervisor/core/api";

let channels = [];
try {
  const raw = process.env.KICK_CHANNELS;
  channels = JSON.parse(raw);
} catch {
  channels = (process.env.KICK_CHANNELS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("[ERROR] client_id and client_secret must be configured in the add-on options.");
  process.exit(1);
}

if (channels.length === 0) {
  console.error("[ERROR] No channels configured. Add channel slugs in the add-on options.");
  process.exit(1);
}

if (!SUPERVISOR_TOKEN) {
  console.error("[ERROR] SUPERVISOR_TOKEN not found. Ensure homeassistant_api is enabled in config.yaml.");
  process.exit(1);
}

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  console.log("[AUTH] Fetching new app access token...");
  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  console.log("[AUTH] Token acquired.");
  return accessToken;
}

async function fetchChannels(token, slugs) {
  const query = slugs.map((s) => `slug=${encodeURIComponent(s)}`).join("&");
  const response = await fetch(`https://api.kick.com/public/v1/channels?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Channels API failed: ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  return json.data || [];
}

async function setEntityState(entityId, state, attributes) {
  const response = await fetch(`${HA_API}/states/${entityId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ state, attributes }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[HA] Failed to set ${entityId}: ${response.status} ${text}`);
    return false;
  }

  return true;
}

function sanitizeSlug(slug) {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

async function updateChannel(channelData) {
  const slug = channelData.slug;
  const sanitized = sanitizeSlug(slug);
  const entityId = `binary_sensor.kick_${sanitized}`;
  const isLive = channelData.stream?.is_live ?? false;
  const state = isLive ? "on" : "off";

  const attributes = {
    friendly_name: slug,
    device_class: "connectivity",
    icon: isLive ? "mdi:broadcast" : "mdi:broadcast-off",
    stream_title: channelData.stream_title || "",
    viewer_count: channelData.stream?.viewer_count ?? 0,
    category: channelData.category?.name || "",
    category_thumbnail: channelData.category?.thumbnail || "",
    thumbnail: channelData.stream?.thumbnail || "",
    language: channelData.stream?.language || "",
    is_mature: channelData.stream?.is_mature ?? false,
    started_at: channelData.stream?.start_time || "",
    profile_picture: channelData.banner_picture || "",
    broadcaster_user_id: channelData.broadcaster_user_id,
    channel_url: `https://kick.com/${slug}`,
    attribution: "Data provided by Kick.com API",
  };

  if (!isLive) {
    attributes.viewer_count = 0;
    attributes.started_at = "";
    attributes.thumbnail = "";
  }

  const success = await setEntityState(entityId, state, attributes);
  if (success) {
    const status = isLive ? "🟢 LIVE" : "🔴 Offline";
    const extra = isLive ? ` | ${attributes.viewer_count} viewers | ${attributes.stream_title}` : "";
    console.log(`[${slug}] ${status}${extra}`);
  }
}

async function markChannelUnavailable(slug) {
  const sanitized = sanitizeSlug(slug);
  const entityId = `binary_sensor.kick_${sanitized}`;

  await setEntityState(entityId, "unavailable", {
    friendly_name: slug,
    device_class: "connectivity",
    icon: "mdi:broadcast-off",
    stream_title: "",
    viewer_count: 0,
    category: "",
    channel_url: `https://kick.com/${slug}`,
    attribution: "Data provided by Kick.com API",
  });

  console.log(`[${slug}] ⚠️ Channel not found or unavailable`);
}

async function poll() {
  try {
    const token = await getAccessToken();
    const results = await fetchChannels(token, channels);

    const found = new Set(results.map((c) => c.slug.toLowerCase()));

    for (const channel of results) {
      await updateChannel(channel);
    }

    for (const slug of channels) {
      if (!found.has(slug.toLowerCase())) {
        await markChannelUnavailable(slug);
      }
    }
  } catch (err) {
    console.error(`[POLL] Error: ${err.message}`);
  }
}

async function main() {
  console.log("═".repeat(50));
  console.log("  Kick Live Status — Home Assistant Add-on");
  console.log("═".repeat(50));
  console.log(`  Channels: ${channels.join(", ")}`);
  console.log(`  Scan interval: ${SCAN_INTERVAL / 1000}s`);
  console.log("═".repeat(50));
  console.log("");

  await poll();

  setInterval(poll, SCAN_INTERVAL);

  process.on("SIGTERM", () => {
    console.log("[SHUTDOWN] Received SIGTERM, exiting...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("[SHUTDOWN] Received SIGINT, exiting...");
    process.exit(0);
  });
}

main();
