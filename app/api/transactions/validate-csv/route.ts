import { parseTransactionCsv } from "@/actions/csv-actions";

export async function POST(request: Request) {
	const file = (await request.formData()).get("csv");

	if (!(file instanceof File)) {
		return new Response("Choose a CSV file.", { status: 400 });
	}

	const updates = parseTransactionCsv(file);
	const encoder = new TextEncoder();
	const stream = new ReadableStream<Uint8Array>({
		async pull(controller) {
			const update = await updates.next();
			if (update.done) {
				controller.close();
				return;
			}

			controller.enqueue(encoder.encode(`${JSON.stringify(update.value)}\n`));
		},
		async cancel() {
			await updates.return(undefined);
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
	});
}
