let ventasProductoChart, unidadesVendedorChart, ventasLocalidadChart, tendenciasVentasChart, ventasClienteChart, ventasAnoChart;

// Función para filtrar datos
function filterData(data, filters) {
    return data.filter(venta => {
        return (filters.factura ? venta.factura === filters.factura : true) &&
            (filters.producto ? venta.productos.some(producto => producto.producto === filters.producto) : true) &&
            (filters.cliente ? venta.cliente === filters.cliente : true) &&
            (filters.vendedor ? venta.vendedor === filters.vendedor : true) &&
            (filters.localidad ? venta.localidad === filters.localidad : true);
    });
}

// Función para actualizar gráficos y tarjetas
function updateDashboard(data) {
    // Inicializar contadores
    let totalClientes = new Set();
    let totalVendedores = new Set();
    let totalProductos = new Set();
    let totalLocalidades = new Set();

    let ventasPorProducto = {};
    let unidadesVendidasPorVendedor = {};
    let ventasPorLocalidad = {};

    // Para tendencias
    let tendenciasVentas = {};

    // Para ventas por cliente
    let ventasPorCliente = {};

    // Para ventas por año
    let ventasPorAno = {};

    // Para cálculos adicionales
    let totalGeneral = 0;
    let costoTotal = 0;
    let margenTotal = 0;
    let ventasPorAnio = { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0 };

    data.forEach(venta => {
        totalClientes.add(venta.cliente);
        totalVendedores.add(venta.vendedor);
        totalLocalidades.add(venta.localidad);

        let fecha = new Date(venta.fecha);

        // Acumular ventas por mes para tendencias
        let mes = fecha.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (tendenciasVentas[mes]) {
            tendenciasVentas[mes] += venta.total_general;
        } else {
            tendenciasVentas[mes] = venta.total_general;
        }

        // Acumular ventas por año
        let anio = fecha.getFullYear();

        if (ventasPorAno[anio]) {
            ventasPorAno[anio] += venta.total_general;
        } else {
            ventasPorAno[anio] = venta.total_general;
        }

        venta.productos.forEach(producto => {
            totalProductos.add(producto.producto);

            // Acumular ventas por producto
            if (ventasPorProducto[producto.producto]) {
                ventasPorProducto[producto.producto] += producto.sub_total;
            } else {
                ventasPorProducto[producto.producto] = producto.sub_total;
            }

            // Acumular unidades vendidas por vendedor
            if (unidadesVendidasPorVendedor[venta.vendedor]) {
                unidadesVendidasPorVendedor[venta.vendedor] += producto.cantidad;
            } else {
                unidadesVendidasPorVendedor[venta.vendedor] = producto.cantidad;
            }

            // Acumular ventas por cliente
            if (ventasPorCliente[venta.cliente]) {
                ventasPorCliente[venta.cliente] += venta.total_general;
            } else {
                ventasPorCliente[venta.cliente] = venta.total_general;
            }

            // Acumular ventas por localidad
            if (ventasPorLocalidad[venta.localidad]) {
                ventasPorLocalidad[venta.localidad] += venta.total_general;
            } else {
                ventasPorLocalidad[venta.localidad] = venta.total_general;
            }

            // Acumular ventas por año
            if (ventasPorAnio[anio]) {
                ventasPorAnio[anio] += venta.total_general;
            } else {
                ventasPorAnio[anio] = venta.total_general;
            }

            // Acumular costo total
            costoTotal += producto.precio_compra * producto.cantidad;
        });

        // Acumular total general
        totalGeneral += venta.total_general;
    });

    // Calcular margen total
    margenTotal = totalGeneral - costoTotal;
    let porcentajeMargenTotal = (margenTotal / totalGeneral) * 100;

    $('#totalClientes').text(totalClientes.size);
    $('#totalVendedores').text(totalVendedores.size);
    $('#totalProductos').text(totalProductos.size);
    $('#totalLocalidades').text(totalLocalidades.size);

    // Calcular unidades vendidas totales
    const totalUnidadesVendidas = Object.values(unidadesVendidasPorVendedor).reduce((a, b) => a + b, 0);
    $('#unidadesVendidas').text(totalUnidadesVendidas);

    // Calcular total general
    $('#totalGeneral').text(totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

    // Actualizar footer
    $('#footerTotalGeneral').text(totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    $('#footerCosto').text(costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    $('#footerMargen').text(margenTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    $('#footerPorcentajeMargen').text(porcentajeMargenTotal.toFixed(2) + '%');

    // Distribuir ventas por año proporcionalmente
    const totalVentasPorAnio = Object.values(ventasPorAnio).reduce((a, b) => a + b, 0);
    const proporcionPorAnio = totalGeneral / totalVentasPorAnio;

    for (let anio in ventasPorAnio) {
        ventasPorAnio[anio] = (ventasPorAnio[anio] * proporcionPorAnio).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    $('#footerVentas2020').text(ventasPorAnio[2020]);
    $('#footerVentas2021').text(ventasPorAnio[2021]);
    $('#footerVentas2022').text(ventasPorAnio[2022]);
    $('#footerVentas2023').text(ventasPorAnio[2023]);
    $('#footerVentas2024').text(ventasPorAnio[2024]);

    // Gráfico de Ventas por Producto
    const ctx1 = document.getElementById('ventasProductoChart').getContext('2d');
    if (ventasProductoChart) {
        ventasProductoChart.destroy();
    }
    ventasProductoChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: Object.keys(ventasPorProducto),
            datasets: [{
                label: 'Ventas por Producto',
                data: Object.values(ventasPorProducto),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de Unidades Vendidas por Vendedor (cambiado a línea)
    const ctx2 = document.getElementById('unidadesVendedorChart').getContext('2d');
    if (unidadesVendedorChart) {
        unidadesVendedorChart.destroy();
    }
    unidadesVendedorChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: Object.keys(unidadesVendidasPorVendedor),
            datasets: [{
                label: 'Unidades Vendidas',
                data: Object.values(unidadesVendidasPorVendedor),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {}
    });

    // Gráfico de Ventas por Localidad
    const ctx3 = document.getElementById('ventasLocalidadChart').getContext('2d');
    if (ventasLocalidadChart) {
        ventasLocalidadChart.destroy();
    }
    ventasLocalidadChart = new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: Object.keys(ventasPorLocalidad),
            datasets: [{
                label: 'Ventas por Localidad',
                data: Object.values(ventasPorLocalidad),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de Tendencias de Ventas (Últimos meses)
    const ctx4 = document.getElementById('tendenciasVentasChart').getContext('2d');
    if (tendenciasVentasChart) {
        tendenciasVentasChart.destroy();
    }
    tendenciasVentasChart = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: Object.keys(tendenciasVentas),
            datasets: [{
                label: 'Tendencias de Ventas',
                data: Object.values(tendenciasVentas),
                fill: false,
                borderColor: 'rgba(255, 206, 86, 1)',
                tension: 0.1
            }]
        },
        options: {}
    });

    // Gráfico de Ventas por Cliente (nuevo gráfico)
    const ctx5 = document.getElementById('ventasClienteChart').getContext('2d');
    if (ventasClienteChart) {
        ventasClienteChart.destroy();
    }
    ventasClienteChart = new Chart(ctx5, {
        type: 'bar',
        data: {
            labels: Object.keys(ventasPorCliente),
            datasets: [{
                label: 'Ventas por Cliente',
                data: Object.values(ventasPorCliente),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });

   
// Gráfico de Ventas por Año (nuevo gráfico)
const ctx6 = document.getElementById('ventasAnoChart').getContext('2d');
if (ventasAnoChart) {
    ventasAnoChart.destroy();
}

// Colores para cada barra
const backgroundColors = [
    'rgba(153, 102, 255, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 159, 64, 0.7)'
];

const borderColors = [
    'rgba(153, 102, 255, 0.9)',
    'rgba(54, 162, 235, 0.9)',
    'rgba(255, 206, 86, 0.9)',
    'rgba(75, 192, 192, 0.9)',
    'rgba(255, 159, 64, 0.9)'
];

ventasAnoChart = new Chart(ctx6, {
    type: 'bar',
    data: {
        labels: Object.keys(ventasPorAno),
        datasets: [{
            label: 'Ventas por Año',
            data: Object.values(ventasPorAno),
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    }
});

}

// Cargar datos JSON
$.getJSON('https://raw.githubusercontent.com/JUANCITOPENA/RECURSOS-DE-BASE-DE-DATOS-Y-DATOS-CURSOS-SQL-SERVER-Y-ANALISIS-DE-DATOS/refs/heads/main/ventas_tecnologia.json', function (data) {
    let filteredData = data;

    // Obtener datos únicos para los filtros
    let facturas = [...new Set(data.map(venta => venta.factura))];
    let productos = [...new Set(data.flatMap(venta => venta.productos.map(producto => producto.producto)))];
    let clientes = [...new Set(data.map(venta => venta.cliente))];
    let vendedores = [...new Set(data.map(venta => venta.vendedor))];
    let localidades = [...new Set(data.map(venta => venta.localidad))];

    // Llenar los filtros con los datos únicos
    facturas.forEach(factura => {
        $('#facturaFilter').append(`<option value="${factura}">${factura}</option>`);
        $('#facturaFilterMobile').append(`<option value="${factura}">${factura}</option>`);
    });

    productos.forEach(producto => {
        $('#productoFilter').append(`<option value="${producto}">${producto}</option>`);
        $('#productoFilterMobile').append(`<option value="${producto}">${producto}</option>`);
    });

    clientes.forEach(cliente => {
        $('#clienteFilter').append(`<option value="${cliente}">${cliente}</option>`);
        $('#clienteFilterMobile').append(`<option value="${cliente}">${cliente}</option>`);
    });

    vendedores.forEach(vendedor => {
        $('#vendedorFilter').append(`<option value="${vendedor}">${vendedor}</option>`);
        $('#vendedorFilterMobile').append(`<option value="${vendedor}">${vendedor}</option>`);
    });

    localidades.forEach(localidad => {
        $('#localidadFilter').append(`<option value="${localidad}">${localidad}</option>`);
        $('#localidadFilterMobile').append(`<option value="${localidad}">${localidad}</option>`);
    });

    // Actualizar el dashboard con los datos filtrados
    updateDashboard(filteredData);

    // Eventos de filtro
    $('#facturaFilter, #productoFilter, #clienteFilter, #vendedorFilter, #localidadFilter').on('change', function () {
        const filters = {
            factura: $('#facturaFilter').val(),
            producto: $('#productoFilter').val(),
            cliente: $('#clienteFilter').val(),
            vendedor: $('#vendedorFilter').val(),
            localidad: $('#localidadFilter').val()
        };
        filteredData = filterData(data, filters);
        updateDashboard(filteredData);
    });

    $('#facturaFilterMobile, #productoFilterMobile, #clienteFilterMobile, #vendedorFilterMobile, #localidadFilterMobile').on('change', function () {
        const filters = {
            factura: $('#facturaFilterMobile').val(),
            producto: $('#productoFilterMobile').val(),
            cliente: $('#clienteFilterMobile').val(),
            vendedor: $('#vendedorFilterMobile').val(),
            localidad: $('#localidadFilterMobile').val()
        };
        filteredData = filterData(data, filters);
        updateDashboard(filteredData);
    });

    // Evento para limpiar filtros
    $('#clearFilters').on('click', function () {
        $('#facturaFilter, #productoFilter, #clienteFilter, #vendedorFilter, #localidadFilter').val('');
        filteredData = data;
        updateDashboard(filteredData);
    });

    $('#clearFiltersMobile').on('click', function () {
        $('#facturaFilterMobile, #productoFilterMobile, #clienteFilterMobile, #vendedorFilterMobile, #localidadFilterMobile').val('');
        filteredData = data;
        updateDashboard(filteredData);
    });
});
