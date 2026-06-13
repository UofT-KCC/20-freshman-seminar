const STORE_PATH = "freshman-seminar-2026/attendees.json";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function isValidVisitorId(visitorId) {
  return typeof visitorId === "string" && /^[a-zA-Z0-9_-]{12,80}$/.test(visitorId);
}

function getRequestBody(request) {
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      return {};
    }
  }

  return request.body || {};
}

async function readAttendees(blobStore) {
  const result = await blobStore.list({
    limit: 1,
    prefix: STORE_PATH,
  });
  const blob = result.blobs.find((item) => item.pathname === STORE_PATH);

  if (!blob) {
    return [];
  }

  const response = await fetch(`${blob.url}?ts=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data.visitors) ? data.visitors.filter(isValidVisitorId) : [];
}

async function writeAttendees(blobStore, visitors) {
  await blobStore.put(
    STORE_PATH,
    JSON.stringify({
      visitors,
      updatedAt: new Date().toISOString(),
    }),
    {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
    }
  );
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const blobStore = await import("@vercel/blob");
    const visitorId = getRequestBody(request).visitorId;

    if (!isValidVisitorId(visitorId)) {
      sendJson(response, 400, { error: "Invalid visitor ID" });
      return;
    }

    const visitors = await readAttendees(blobStore);
    const uniqueVisitors = new Set(visitors);
    uniqueVisitors.add(visitorId);

    const nextVisitors = Array.from(uniqueVisitors);
    await writeAttendees(blobStore, nextVisitors);

    sendJson(response, 200, {
      count: nextVisitors.length,
    });
  } catch (error) {
    sendJson(response, 200, {
      count: null,
      storageReady: false,
    });
  }
};
