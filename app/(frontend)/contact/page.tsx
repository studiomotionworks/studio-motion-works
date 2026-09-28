import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactGrid } from "@/components/contact/ContactGrid";
import { ContactClosing } from "@/components/contact/ContactClosing";

export const metadata: Metadata = {
  title: "Contact — Studio Motionworks",
  description:
    "Reach Studio Motionworks for commissions, collaborations, and press. Based in Ahmedabad, India.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactGrid />
      <ContactClosing />
    </>
  );
}