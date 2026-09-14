// spotchu-rn 읽기 BFF — 도시 1건.
import { getCity } from "@/lib/data";
import { rnJson, toRnCity } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const city = await getCity(id);
  if (!city) return rnJson({ error: "not_found" }, 404);
  return rnJson(toRnCity(city));
}
