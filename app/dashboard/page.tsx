import { redirect } from "next/navigation";
import { getSessionFromCookies } from "../../lib/auth";
import { getScheduleByEmail } from "../../lib/db";
import { DashboardView } from "../../components/dashboard-view";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/");

  const schedule = getScheduleByEmail(session.email);

  return <DashboardView email={session.email} schedule={schedule} />;
}
