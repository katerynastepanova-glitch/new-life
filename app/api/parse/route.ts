import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Серверний роут: бере сирий надиктований/написаний текст і повертає
// структуровані задачі (title, priority, estimateMin, deadline).
// Ключ читається з env на сервері, у браузер не потрапляє.

function systemPrompt(today: string) {
  return `Ти — асистент-планувальник. Користувач накидав хаотичний список думок і задач (часто з помилками розпізнавання мовлення, без розділових знаків). Розбий його на окремі задачі.

Для кожної задачі визнач:
- title: коротке дієве формулювання ("Подзвонити в клініку"), виправляй очевидні помилки розпізнавання за змістом, прибирай вступні слова ("треба", "не забути")
- priority: "must" якщо терміново/важливо, інакше "nice"
- estimateMin: реалістична оцінка в хвилинах (ціле число)
- deadline: дата у форматі YYYY-MM-DD, якщо в тексті є час/день (напр. "завтра", "у пʼятницю", "до 15-го"); інакше null

Сьогодні: ${today}. Відштовхуйся від цієї дати, обчислюючи відносні дні ("завтра", "наступного вівторка").
Не вигадуй задач, яких немає в тексті. Якщо текст беззмістовний — поверни порожній масив. Усі формулювання — українською.`;
}

const SCHEMA = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          priority: { type: "string", enum: ["must", "nice"] },
          estimateMin: { type: ["integer", "null"] },
          deadline: { type: ["string", "null"] },
        },
        required: ["title", "priority", "estimateMin", "deadline"],
        additionalProperties: false,
      },
    },
  },
  required: ["tasks"],
  additionalProperties: false,
} as const;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ tasks: [] });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD на сервері

    const client = new Anthropic(); // читає ANTHROPIC_API_KEY з оточення (лише в рантаймі)
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: systemPrompt(today),
      messages: [{ role: "user", content: text }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const block = response.content.find((b) => b.type === "text");
    const parsed = block && block.type === "text" ? JSON.parse(block.text) : { tasks: [] };

    // нормалізуємо до форми { text, priority, estimateMin, deadline }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasks = (Array.isArray(parsed.tasks) ? parsed.tasks : [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((t: any) => t && typeof t.title === "string" && t.title.trim())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((t: any) => ({
        text: t.title.trim(),
        priority: t.priority === "must" ? "must" : "nice",
        estimateMin: typeof t.estimateMin === "number" ? t.estimateMin : null,
        deadline: typeof t.deadline === "string" ? t.deadline : null,
      }));

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("parse error:", err);
    return NextResponse.json({ error: "parse_failed" }, { status: 500 });
  }
}
