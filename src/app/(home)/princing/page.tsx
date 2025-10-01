"use client";
import { PricingTable } from "@clerk/nextjs";
import Image from "next/image";

export default function PricingPage() {
    return (
        <div className="flex flex-col max-w-3xl mx-auto w-full">
          <section className="space-y-6 pt-[16vh] 2xl:pt-48">
            <div className="flex flex-col items-center">
              <Image
                src="/logo.svg"
                alt="Vibe"
                width={50}
                height={50}
                className="hidden md:block"
              />
            </div>
            <h1>Pricing</h1>
            <p>Choose the plan that's right for you</p>
            <PricingTable 
            appearance={{
                elements: {
                  pricingTableCard: "border! shadow-none! rounded-lg!",
                },
              }}
            />
          </section>
        </div>
      )
      
}