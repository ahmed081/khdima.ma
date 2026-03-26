import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ locale: string }>
}

// Portfolio is now integrated into the Edit Profile page (Photos tab).
// Redirect to keep old links working.
export default async function PortfolioRedirectPage({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}/provider/dashboard/edit`)
}
