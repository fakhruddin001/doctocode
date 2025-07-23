import React from "react";
import Hero from "@/components/Home";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Doc to Code",
};

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
