import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Серверний роут: бере сирий надиктований/написаний текст і повертає
// список конкретних, переформульованих задач. Ключ читається з env на сервері,
// у браузер не потрапляє.

const client = new Anthropic(); // читає ANTHROPIC_API_KEY з оточення

const SYSTEM = `Ти — асистент-планувальник. Користувач диктує або пише потік думок українською (часто з помилками розпізнавання мовлення, без розділових знаків).

Твоє завдання: перетворити цей потік на список окремих, конкретних, дієвих задач.

Правила:
- Кожна задача — короткий імператив ("Подзвонити в клініку", "Купити хліб"), а не дослівний переказ.
- Виправляй очевидні помилки розпізнавання за змістом.
- Прибирай вступні слова ("треба", "не забути", "хочу"), залишай суть.
- Якщо в одному реченні кілька справ — розділяй на окремі задачі.
- Не вигадуй задач, яких немає в тексті.
- Якщо текст беззмістовний або не містить задач — поверни порожній список.
- Відповідай українською.`;

const SCHEMA = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: { type: "string" },
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

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const block = response.content.find((b) => b.type === "text");
    const parsed = block && block.type === "text" ? JSON.parse(block.text) : { tasks: [] };
    const tasks: string[] = Array.isArray(parsed.tasks)
      ? parsed.tasks.filter((t: unknown) => typeof t === "string" && t.trim())
      : [];

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("parse error:", err);
    return NextResponse.json({ error: "parse_failed" }, { status: 500 });
  }
}
