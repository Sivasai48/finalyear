import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - in production, fetch from database based on authenticated farmer
  const traderRequests = [
    {
      id: "1",
      dhalariName: "Ramesh Trading Co.",
      dhalariPhone: "+91 98765 00001",
      dhalariLocation: "Vijayawada, Andhra Pradesh",
      cropName: "Wheat",
      requestedQuantity: 2000,
      offeredPrice: 26,
      status: "pending",
      requestDate: "2025-01-10",
      message: "Interested in buying your wheat. Can we negotiate the price?",
    },
    {
      id: "2",
      dhalariName: "Krishna Agri Traders",
      dhalariPhone: "+91 98765 00002",
      dhalariLocation: "Guntur, Andhra Pradesh",
      cropName: "Rice",
      requestedQuantity: 1500,
      offeredPrice: 32,
      status: "pending",
      requestDate: "2025-01-09",
      message: "Need rice urgently for bulk order",
    },
  ]

  return NextResponse.json({
    success: true,
    data: traderRequests,
  })
}
