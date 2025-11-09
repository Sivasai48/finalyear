import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { message, userType, conversationHistory } = await request.json()

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 })
    }

    // System prompt based on user type
    const systemPrompt =
      userType === "farmer"
        ? `You are an agricultural advisor chatbot helping farmers in India. You provide advice on:
         - Crop selection and farming practices
         - Weather and seasonal guidance
         - Market prices and selling strategies
         - Connecting with verified traders (dhalaris)
         - Pest management and crop diseases
         - Government schemes and subsidies
         Be helpful, concise, and practical. Respond in a friendly manner.`
        : `You are a business advisor chatbot helping traders (dhalaris) in India. You provide advice on:
         - Connecting with farmers and sourcing products
         - Market trends and pricing strategies
         - Quality assessment and grading
         - Logistics and supply chain
         - Government regulations and compliance
         - Business growth and profitability
         Be helpful, professional, and practical. Respond in a friendly manner.`

    // Build conversation context for AI
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      {
        role: "user",
        content: message,
      },
    ]

    const { text: response } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    return Response.json({
      response,
      success: true,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
