import { redirect } from "next/navigation";

/** Legacy path kept for backward compatibility — canonical route is /tasbeeh */
export default function TasbihRedirect() {
  redirect("/tasbeeh");
}
