import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Examples } from "@/components/landing/examples";
import { Features } from "@/components/landing/features";
import { Cta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/chats");
  }

  return (
    <>
      <LandingNavbar />
      <main>
        <Hero />
        <HowItWorks />
        <Examples />
        <Features />
        <Cta />
      </main>
      <LandingFooter />
    </>
  );
}
