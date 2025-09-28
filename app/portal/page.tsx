import { redirect } from "next/navigation";

export default function PortalIndex() {
  redirect("/portal/submit-ticket");
}
