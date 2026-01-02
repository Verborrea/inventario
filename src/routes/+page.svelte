<script lang="ts">
	import type { Producto } from '$lib/types.js';

    export let data; // Viene del server
    let busqueda = "";
    let seleccionado: Producto|null = null;
    let cantidadInput = 0;
    let dialog: HTMLDialogElement | undefined;

    // Filtrado en tiempo real
    $: productosFiltrados = data.productos.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.codigo.includes(busqueda)
    );

    function abrirModal(producto: Producto) {
        seleccionado = producto;
        cantidadInput = 0;
        dialog?.showModal();
    }

    async function guardarStock() {
        const res = await fetch('/api/update-stock', {
            method: 'POST',
            body: JSON.stringify({ 
                codigo: seleccionado?.codigo, 
                nuevoStock: cantidadInput 
            })
        });

        if (res.ok && seleccionado) {
            // Actualización optimista en el cliente
            seleccionado.stock = cantidadInput;
            dialog?.close();
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
                on:click={() => abrirModal(producto)}
                class="w-full text-left p-3 border-b flex justify-between items-center active:bg-gray-100"
            >
                <span>{producto.nombre} <br> <small class="text-gray-500">{producto.codigo}</small></span>
                <span class="font-mono font-bold">{producto.stock}</span>
            </button>
        {/each}
    </div>
</main>

<dialog bind:this={dialog} class="rounded-lg p-6 shadow-xl">
    {#if seleccionado}
        <h2 class="font-bold mb-2">Actualizar Stock</h2>
        <p class="text-sm mb-4">{seleccionado.nombre}</p>
        
        <input type="number" bind:value={cantidadInput} class="w-full border p-2 mb-4 text-center text-2xl" />

        <div class="flex gap-2">
            <button on:click={() => dialog?.close()} class="flex-1 p-2 bg-gray-200 rounded">Cancelar</button>
            <button on:click={guardarStock} class="flex-1 p-2 bg-blue-600 text-white rounded">Aceptar</button>
        </div>
    {/if}
</dialog>