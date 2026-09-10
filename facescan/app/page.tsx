import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] text-white flex flex-col items-center justify-center px-6 py-10">
      <Card className="p-8 max-w-md w-full bg-[#1B263B] border-none shadow-2xl rounded-2xl">
        <h1 className="text-4xl font-bold text-center mb-4">FaceScan</h1>
        <p className="text-center text-lg text-gray-300 mb-6">
          Analyse ton visage et découvre ton score bien‑être.
        </p>
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#4A90E2] animate-pulse"></div>
          <Image src="/avatar.png" alt="face" fill className="rounded-full object-cover" />
        </div>
        <Button className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white text-lg py-4 rounded-xl">
          Commencer le scan
        </Button>
      </Card>
    </main>
  )
}
