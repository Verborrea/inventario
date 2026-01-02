<script lang="ts">
    import type { Producto } from '$lib/types';

    let { data } = $props();
    
    // Convertimos la lista inicial en un estado reactivo
    let productos = $state(data.productos);
    let busqueda = $state("");
    let seleccionado: Producto | null = $state(null);
    let cantidadInput = $state(0);
    let dialog: HTMLDialogElement | undefined = $state();
    let stockInput: HTMLInputElement | undefined = $state();

   // Función auxiliar para quitar acentos y caracteres especiales
    const normalizar = (texto: string) => 
        texto.toLowerCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes

    let productosFiltrados = $derived(
        productos.filter(p => {
            const busquedaLimpia = normalizar(busqueda);
            const nombreLimpio = normalizar(p.nombre);
            const codigoLimpio = normalizar(p.codigo);

            // Dividimos la búsqueda en palabras (ej: ["barra", "cons"])
            const terminos = busquedaLimpia.split(/\s+/).filter(t => t.length > 0);

            // Verificamos que CADA término esté en el nombre o en el código
            return terminos.every(termino => 
                nombreLimpio.includes(termino) || codigoLimpio.includes(termino)
            );
        })
    );
    function abrirModal(producto: Producto) {
        seleccionado = producto;
        cantidadInput = producto.stock;
        dialog?.showModal();
        stockInput?.focus();
    }

    async function guardarStock() {
        if (!seleccionado) return;

        const res = await fetch('/api/update-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                codigo: seleccionado.codigo, 
                nuevoStock: cantidadInput 
            })
        });

        if (res.ok) {
            // BUSCAMOS EL ÍNDICE para asegurar que Svelte detecte el cambio en el array
            const index = productos.findIndex(p => p.codigo === seleccionado?.codigo);
            
            if (index !== -1) {
                // Actualizamos el objeto directamente en el array de estado
                productos[index].stock = cantidadInput;
            }

            dialog?.close();
            seleccionado = null; // Limpiamos la selección
        }
    }
</script>

<main class="p-4">
    <h1 class="text-xl font-bold mb-4">Inventario</h1>
    
    <input 
        type="text" 
        bind:value={busqueda} 
        placeholder="Buscar producto..." 
        class="w-full p-2 border rounded mb-4"
    />

    <div class="listado">
        {#each productosFiltrados as producto}
            <button 
                onclick={() => abrirModal(producto)}
                class="w-full text-left p-3 border-b flex justify-between items-center active:bg-gray-100 border-gray-200"
            >
                <span>{producto.nombre} <br> <small class="text-gray-500">{producto.codigo}&bull; {producto.empresa}</small></span>
                <span class="font-mono font-bold">{producto.stock}</span>
            </button>
        {/each}
    </div>
</main>

<dialog bind:this={dialog} class="rounded-lg p-6 shadow-xl" closedby="any">
    {#if seleccionado}
        <form onsubmit={(e) => { e.preventDefault(); guardarStock(); }}>
            <h2 class="font-bold mb-2">Actualizar Stock</h2>
            <p class="text-sm mb-4 text-gray-600">{seleccionado.nombre}</p>
            
            <input 
            bind:this={stockInput}
                type="number" 
                bind:value={cantidadInput} 
                class="w-full border p-2 mb-4 text-center text-2xl" 
                autofocus
            />

            <div class="flex gap-2">
                <button 
                    type="button" 
                    onclick={() => dialog?.close()} 
                    class="flex-1 p-2 bg-gray-200 rounded"
                >
                    Cancelar
                </button>
                
                <button 
                    type="submit" 
                    class="flex-1 p-2 bg-blue-600 text-white rounded font-bold"
                >
                    Aceptar
                </button>
            </div>
        </form>
    {/if}
</dialog>