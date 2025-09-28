export type Classification = { priority: "low"|"medium"|"high"; department: "account"|"hardware"|"network"|"software"|"other";  estimated_minutes: number;
};

export async function classifyTicket(title: string, message: string): Promise<Classification | null> {
  try {
    const res = await fetch(`${process.env.CLASSIFIER_URL}/classify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-classifier-key": process.env.CLASSIFIER_KEY ?? "",
      },
      body: JSON.stringify({ title, message }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Classification;
  } catch (e) {
    console.error("[classifier] failed:", e);
    return null;
  }
}
