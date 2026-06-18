const STORE_PATH = "freshman-seminar-2026/attendees.json";
const memoryVisitors = globalThis.__utkccAttendeeVisitors || new Set();

globalThis.__utkccAttendeeVisitors = memoryVisitors;

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
  let blob;

  try {
    blob = await blobStore.head(STORE_PATH);
  } catch (error) {
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
      addRandomSuffix: false,
      contentType: "application/json",
    }
  );
}

module.exports = async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const body = getRequestBody(request);
  const visitorId = body.visitorId;

  if (request.method === "POST" && !isValidVisitorId(visitorId)) {
    sendJson(response, 400, { error: "Invalid visitor ID" });
    return;
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
    }

    const blobStore = await import("@vercel/blob");
    const visitors = await readAttendees(blobStore);

    if (request.method === "POST") {
      const uniqueVisitors = new Set(visitors);
      uniqueVisitors.add(visitorId);

      const nextVisitors = Array.from(uniqueVisitors);
      await writeAttendees(blobStore, nextVisitors);

      sendJson(response, 200, {
        count: nextVisitors.length,
        storage: "blob",
      });
      return;
    }

    sendJson(response, 200, {
      count: visitors.length,
      storage: "blob",
    });
  } catch (error) {
    if (request.method === "POST") {
      memoryVisitors.add(visitorId);
    }

    response.setHeader("X-Attendee-Storage", "memory-fallback");

    sendJson(response, 200, {
      count: memoryVisitors.size,
      storage: "memory",
      ok: true,
    });
  }
};
