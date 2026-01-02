import type { Producto } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env.inventario;
	const { results } = await db.prepare("SELECT * FROM productos").all();
	return { productos: results as Producto[] };
};