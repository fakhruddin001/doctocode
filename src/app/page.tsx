import React from "react";
import Hero from "@/components/Home";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Codient - Generate Project Code At Bureau Veritas",
};

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
