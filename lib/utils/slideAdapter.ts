import type { Slide } from "../redux/features/pptSlice";

export function normaliseSlides(raw: any[]): Slide[] {
  return raw.map((s) => ({
    slide_id: s.slide_id ?? crypto.randomUUID(),
    background: mapBackground(s.background),
    content: (s.content ?? []).map(normaliseContent),
  }));
}

function mapBackground(bg: any) {
  if (!bg) return { type: "color", value: "#ffffff" };
  if (bg.type === "solid") return { type: "color", value: bg.value };
  return bg;
}

function normaliseContent(c: any) {
  if (c.type === "bullet_list") {
    return { ...c, type: "list", items: c.points ?? c.items ?? [] };
  }
  if (c.type === "numbered_list") {
    return { ...c, items: c.points ?? c.items ?? [] }; // keep the type
  }
  return c;
}


// function normaliseContent(c: any) {
//   // bullet_list vs list vs numbered_list -> items[]
//   if (c.type === "bullet_list" || c.type === "numbered_list") {
//     return { ...c, items: c.points ?? c.items ?? [] };
//   }
//   return c;
// }
