export async function POST({ request, platform }) {
	const { codigo, nuevoStock } = await request.json();
	const db = platform?.env.inventario;

	await db.prepare("UPDATE productos SET stock = ? WHERE codigo = ?")
		.bind(nuevoStock, codigo)
		.run();

	return new Response(JSON.stringify({ success: true }));
}