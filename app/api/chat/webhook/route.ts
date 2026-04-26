import { NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "http://localhost:5678/webhook/acff7719-703d-4ef3-a521-b87dcf125af4"
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const webhookRes = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (!webhookRes.ok) {
            return NextResponse.json(
                { error: "Webhook returned an error", status: webhookRes.status },
                { status: 502 }
            )
        }

        const contentType = webhookRes.headers.get("content-type") || ""
        let rawData: any

        const text = await webhookRes.text()
        if (contentType.includes("application/json") && text.trim() !== "") {
            try {
                rawData = JSON.parse(text)
            } catch (e) {
                console.error("JSON parse error on webhook response:", e)
                return NextResponse.json({ output: text })
            }
        } else {
            return NextResponse.json({ output: text })
        }


        // n8n often returns data as an array — unwrap the first element
        let data = rawData
        if (Array.isArray(data)) {
            data = data[0] || {}
        }

        // Extract the output object
        const output = data.output || data.response || data.text || data.message || data

        // If output is a nested object with answer + suggestions, format it as a string
        if (typeof output === "object" && output !== null) {
            let formattedText = ""

            // Extract the answer/text
            if (output.answer) {
                formattedText += output.answer
            } else if (output.text) {
                formattedText += output.text
            } else if (output.response) {
                formattedText += output.response
            }

            // Format suggestions as bullet points
            if (output.suggestions && Array.isArray(output.suggestions) && output.suggestions.length > 0) {
                formattedText += "\n\nSuggestions:\n"
                output.suggestions.forEach((suggestion: string) => {
                    formattedText += `• ${suggestion}\n`
                })
            }

            const result = formattedText.trim()
            return NextResponse.json({ output: result || JSON.stringify(output) })
        }

        // output is already a plain string
        return NextResponse.json({ output: String(output) })
    } catch (error) {
        console.error("Webhook proxy error:", error)
        return NextResponse.json(
            { error: "Failed to reach webhook" },
            { status: 502 }
        )
    }
}
