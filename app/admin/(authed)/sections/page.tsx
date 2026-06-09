import { redirect } from "next/navigation";
import { SECTIONS } from "./sections";

// /admin/sections → première section par défaut.
export default function SectionsIndex() {
  redirect(`/admin/sections/${SECTIONS[0].routeId}`);
}
