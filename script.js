// Declaración de variables para los gráficos
let ventasProductoChart, unidadesVendedorChart, ventasLocalidadChart, tendenciasVentasChart,
    ventasClienteChart, ventasAnoChart, mediaVentasChart, medianaVentasChart, modaVentasChart,
    desviacionVentasChart, paretoProductoChart, paretoClienteChart, paretoVendedorChart, paretoLocalidadChart;

// Función para filtrar datos según los filtros proporcionados
function filterData(data, filters) {
    // Filtra las ventas que cumplan con los filtros establecidos
    return data.filter(venta => {
        return (filters.factura ? venta.factura === filters.factura : true) &&
            (filters.producto ? venta.productos.some(producto => producto.producto === filters.producto) : true) &&
            (filters.cliente ? venta.cliente === filters.cliente : true) &&
            (filters.vendedor ? venta.vendedor === filters.vendedor : true) &&
            (filters.localidad ? venta.localidad === filters.localidad : true);
    });
}

// Función para actualizar los gráficos y las tarjetas del dashboard
function updateDashboard(data) {
    // Inicializar conjuntos y objetos para acumular las métricas
    let totalClientes = new Set();   // Conjunto de clientes únicos
    let totalVendedores = new Set(); // Conjunto de vendedores únicos
    let totalProductos = new Set();  // Conjunto de productos únicos
    let totalLocalidades = new Set(); // Conjunto de localidades únicas

    // Inicialización de los objetos para almacenar las métricas de ventas
    let ventasPorProducto = {};        // Acumula ventas por producto
    let unidadesVendidasPorVendedor = {}; // Acumula unidades vendidas por vendedor
    let ventasPorLocalidad = {};       // Acumula ventas por localidad
    let ventasPorVendedor = {};       // Acumula ventas por vendedor

    // Para almacenar las tendencias de ventas por mes
    let tendenciasVentas = {};

    // Para ventas por cliente
    let ventasPorCliente = {};

    // Para ventas por año
    let ventasPorAno = {};

    // Variables adicionales para cálculos totales
    let totalGeneral = 0; // Total general de ventas
    let costoTotal = 0;   // Costo total de los productos vendidos
    let margenTotal = 0;  // Margen total de ganancias
    let ventasPorAnio = { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0 }; // Ventas por año

    // Objetos para almacenar medidas de tendencia central
    let mediaVentas = {};   // Promedio de ventas por mes
    let medianaVentas = {}; // Mediana de ventas por mes
    let modaVentas = {};    // Moda de ventas por mes
    let desviacionVentas = {}; // Desviación estándar de ventas por mes

    // Iterar sobre las ventas para acumular y calcular métricas
    data.forEach(venta => {
        // Agregar clientes, vendedores y localidades únicos a sus respectivos conjuntos
        totalClientes.add(venta.cliente);
        totalVendedores.add(venta.vendedor);
        totalLocalidades.add(venta.localidad);

        let fecha = new Date(venta.fecha); // Convertir la fecha de la venta a un objeto Date

        // Acumular ventas por mes para analizar tendencias
        let mes = fecha.toLocaleString('default', { month: 'long', year: 'numeric' }); // Obtener el mes y año como cadena

        if (tendenciasVentas[mes]) {
            tendenciasVentas[mes] += venta.total_general; // Si ya hay ventas acumuladas para ese mes, sumarlas
        } else {
            tendenciasVentas[mes] = venta.total_general; // Si no, inicializar con el total general de la venta
        }

        // Acumular ventas por año
        let anio = fecha.getFullYear(); // Obtener el año de la venta

        if (ventasPorAno[anio]) {
            ventasPorAno[anio] += venta.total_general; // Acumular ventas por año
        } else {
            ventasPorAno[anio] = venta.total_general; // Inicializar las ventas por año
        }

        // Iterar sobre los productos de la venta para acumular datos relacionados
        venta.productos.forEach(producto => {
            totalProductos.add(producto.producto); // Agregar producto al conjunto de productos

            // Acumular ventas por producto
            if (ventasPorProducto[producto.producto]) {
                ventasPorProducto[producto.producto] += producto.sub_total; // Sumar las ventas del producto
            } else {
                ventasPorProducto[producto.producto] = producto.sub_total; // Inicializar las ventas por producto
            }

            // Acumular unidades vendidas por vendedor
            if (unidadesVendidasPorVendedor[venta.vendedor]) {
                unidadesVendidasPorVendedor[venta.vendedor] += producto.cantidad; // Sumar unidades vendidas por vendedor
            } else {
                unidadesVendidasPorVendedor[venta.vendedor] = producto.cantidad; // Inicializar unidades por vendedor
            }

            // Acumular ventas por cliente
            if (ventasPorCliente[venta.cliente]) {
                ventasPorCliente[venta.cliente] += venta.total_general; // Sumar ventas por cliente
            } else {
                ventasPorCliente[venta.cliente] = venta.total_general; // Inicializar ventas por cliente
            }

            // Acumular ventas por localidad
            if (ventasPorLocalidad[venta.localidad]) {
                ventasPorLocalidad[venta.localidad] += venta.total_general; // Sumar ventas por localidad
            } else {
                ventasPorLocalidad[venta.localidad] = venta.total_general; // Inicializar ventas por localidad
            }

            // Acumular ventas por año
            if (ventasPorAnio[anio]) {
                ventasPorAnio[anio] += venta.total_general; // Sumar ventas por año
            } else {
                ventasPorAnio[anio] = venta.total_general; // Inicializar ventas por año
            }

            // Acumular costo total de los productos vendidos
            costoTotal += producto.precio_compra * producto.cantidad; // Sumar el costo de cada producto vendido
        });

        // Acumular ventas por vendedor
        if (ventasPorVendedor[venta.vendedor]) {
            ventasPorVendedor[venta.vendedor] += venta.total_general; // Sumar ventas por vendedor
        } else {
            ventasPorVendedor[venta.vendedor] = venta.total_general; // Inicializar ventas por vendedor
        }

        // Acumular total general de ventas
        totalGeneral += venta.total_general;

        // Acumular medidas de tendencia central
        if (!mediaVentas[mes]) {
            mediaVentas[mes] = []; // Inicializar el arreglo si no existe
        }
        mediaVentas[mes].push(venta.total_general); // Agregar el total general de la venta

        if (!medianaVentas[mes]) {
            medianaVentas[mes] = []; // Inicializar el arreglo si no existe
        }
        medianaVentas[mes].push(venta.total_general); // Agregar el total general de la venta

        if (!modaVentas[mes]) {
            modaVentas[mes] = {}; // Inicializar el objeto si no existe
        }
        if (modaVentas[mes][venta.total_general]) {
            modaVentas[mes][venta.total_general]++; // Si ya existe ese valor, incrementar la frecuencia
        } else {
            modaVentas[mes][venta.total_general] = 1; // Si no, inicializar la frecuencia en 1
        }

        if (!desviacionVentas[mes]) {
            desviacionVentas[mes] = []; // Inicializar el arreglo si no existe
        }
        desviacionVentas[mes].push(venta.total_general); // Agregar el total general de la venta
    });


    // Calcular margen total
    margenTotal = totalGeneral - costoTotal; // El margen total se calcula restando el costo total del total general de ventas.
    let porcentajeMargenTotal = (margenTotal / totalGeneral) * 100; // El porcentaje del margen total se calcula dividiendo el margen total entre el total general, y multiplicando por 100 para obtener el porcentaje.

    // Actualizar el conteo de clientes, vendedores, productos y localidades en el DOM
    $('#totalClientes').text(totalClientes.size); // Se muestra el número total de clientes en la interfaz.
    $('#totalVendedores').text(totalVendedores.size); // Se muestra el número total de vendedores en la interfaz.
    $('#totalProductos').text(totalProductos.size); // Se muestra el número total de productos en la interfaz.
    $('#totalLocalidades').text(totalLocalidades.size); // Se muestra el número total de localidades en la interfaz.

    // Calcular unidades vendidas totales
    const totalUnidadesVendidas = Object.values(unidadesVendidasPorVendedor).reduce((a, b) => a + b, 0); // Se suman todas las unidades vendidas por vendedor para obtener el total.
    $('#unidadesVendidas').text(totalUnidadesVendidas); // Se muestra el total de unidades vendidas en la interfaz.

    // Calcular total general
    $('#totalGeneral').text(totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); // Se muestra el total general de ventas en formato monetario (con 2 decimales).

    // Actualizar footer con los totales calculados
    $('#footerTotalGeneral').text(totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); // Se actualiza el total general en el pie de página.
    $('#footerCosto').text(costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); // Se actualiza el costo total en el pie de página.
    $('#footerMargen').text(margenTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); // Se actualiza el margen total en el pie de página.
    $('#footerPorcentajeMargen').text(porcentajeMargenTotal.toFixed(2) + '%'); // Se actualiza el porcentaje de margen en el pie de página, con 2 decimales.

    // Distribuir ventas por año proporcionalmente
    const totalVentasPorAnio = Object.values(ventasPorAnio).reduce((a, b) => a + b, 0); // Se suman las ventas por año para obtener el total de ventas por año.
    const proporcionPorAnio = totalGeneral / totalVentasPorAnio; // Se calcula la proporción entre el total general y el total de ventas por año.

    // Se distribuyen las ventas por año proporcionalmente en base al total general de ventas
    for (let anio in ventasPorAnio) {
        ventasPorAnio[anio] = (ventasPorAnio[anio] * proporcionPorAnio).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Las ventas de cada año se multiplican por la proporción calculada y se formatean en formato monetario.
    }

    // Actualizar el pie de página con las ventas de cada año
    $('#footerVentas2020').text(ventasPorAnio[2020]); // Se actualizan las ventas de 2020 en el pie de página.
    $('#footerVentas2021').text(ventasPorAnio[2021]); // Se actualizan las ventas de 2021 en el pie de página.
    $('#footerVentas2022').text(ventasPorAnio[2022]); // Se actualizan las ventas de 2022 en el pie de página.
    $('#footerVentas2023').text(ventasPorAnio[2023]); // Se actualizan las ventas de 2023 en el pie de página.
    $('#footerVentas2024').text(ventasPorAnio[2024]); // Se actualizan las ventas de 2024 en el pie de página.


    // Gráfico de Ventas por Producto

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de ventas por producto
    const ctx1 = document.getElementById('ventasProductoChart').getContext('2d');

    // Si ya existe un gráfico (ventasProductoChart), lo destruimos para crear uno nuevo
    if (ventasProductoChart) {
        ventasProductoChart.destroy();
    }

    // Creación del gráfico de barras para mostrar las ventas por producto
    ventasProductoChart = new Chart(ctx1, {
        type: 'bar', // Tipo de gráfico: barras
        data: {
            labels: Object.keys(ventasPorProducto), // Etiquetas: los nombres de los productos
            datasets: [{
                label: 'Ventas por Producto', // Título del conjunto de datos
                data: Object.values(ventasPorProducto), // Datos: las ventas realizadas de cada producto
                backgroundColor: 'rgba(255, 99, 132, 0.7)', // Color de fondo de las barras
                borderColor: 'rgba(255, 99, 132, 1)', // Color del borde de las barras
                borderWidth: 1 // Grosor del borde de las barras
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // El eje Y comienza en cero para mostrar correctamente las barras
                }
            }
        }
    });

    // Gráfico de Unidades Vendidas por Vendedor (cambiado a línea)

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de unidades vendidas por vendedor
    const ctx2 = document.getElementById('unidadesVendedorChart').getContext('2d');

    // Si ya existe un gráfico (unidadesVendedorChart), lo destruimos para crear uno nuevo
    if (unidadesVendedorChart) {
        unidadesVendedorChart.destroy();
    }

    // Creación del gráfico de líneas para mostrar las unidades vendidas por cada vendedor
    unidadesVendedorChart = new Chart(ctx2, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: Object.keys(unidadesVendidasPorVendedor), // Etiquetas: los nombres de los vendedores
            datasets: [{
                label: 'Unidades Vendidas', // Título del conjunto de datos
                data: Object.values(unidadesVendidasPorVendedor), // Datos: las unidades vendidas por cada vendedor
                fill: false, // No se llena el área bajo la línea
                borderColor: 'rgba(75, 192, 192, 1)', // Color de la línea
                tension: 0.1 // Suavizado de la línea
            }]
        },
        options: {} // Opciones del gráfico (vacías en este caso)
    });

    // Gráfico de Ventas por Localidad

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de ventas por localidad
    const ctx3 = document.getElementById('ventasLocalidadChart').getContext('2d');

    // Si ya existe un gráfico (ventasLocalidadChart), lo destruimos para crear uno nuevo
    if (ventasLocalidadChart) {
        ventasLocalidadChart.destroy();
    }

    // Creación del gráfico de barras para mostrar las ventas por localidad
    ventasLocalidadChart = new Chart(ctx3, {
        type: 'bar', // Tipo de gráfico: barras
        data: {
            labels: Object.keys(ventasPorLocalidad), // Etiquetas: las localidades
            datasets: [{
                label: 'Ventas por Localidad', // Título del conjunto de datos
                data: Object.values(ventasPorLocalidad), // Datos: las ventas realizadas en cada localidad
                backgroundColor: 'rgba(54, 162, 235, 0.7)', // Color de fondo de las barras
                borderColor: 'rgba(54, 162, 235, 1)', // Color del borde de las barras
                borderWidth: 1 // Grosor del borde de las barras
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // El eje Y comienza en cero para mostrar correctamente las barras
                }
            }
        }
    });


    // Gráfico de Tendencias de Ventas (Últimos meses)

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de tendencias de ventas
    const ctx4 = document.getElementById('tendenciasVentasChart').getContext('2d');

    // Si ya existe un gráfico (tendenciasVentasChart), lo destruimos para crear uno nuevo
    if (tendenciasVentasChart) {
        tendenciasVentasChart.destroy();
    }

    // Creación del gráfico de líneas para mostrar las tendencias de ventas en los últimos meses
    tendenciasVentasChart = new Chart(ctx4, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: Object.keys(tendenciasVentas), // Etiquetas: los meses
            datasets: [{
                label: 'Tendencias de Ventas', // Título del conjunto de datos
                data: Object.values(tendenciasVentas), // Datos: las ventas de los últimos meses
                fill: false, // No se llena el área bajo la línea
                borderColor: 'rgba(255, 206, 86, 1)', // Color de la línea
                tension: 0.1 // Suavizado de la línea
            }]
        },
        options: {} // Opciones del gráfico (vacías en este caso)
    });

    // Gráfico de Ventas por Cliente (nuevo gráfico)

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de ventas por cliente
    const ctx5 = document.getElementById('ventasClienteChart').getContext('2d');

    // Si ya existe un gráfico (ventasClienteChart), lo destruimos para crear uno nuevo
    if (ventasClienteChart) {
        ventasClienteChart.destroy();
    }

    // Creación del gráfico de barras para mostrar las ventas por cliente
    ventasClienteChart = new Chart(ctx5, {
        type: 'bar', // Tipo de gráfico: barras
        data: {
            labels: Object.keys(ventasPorCliente), // Etiquetas: los nombres de los clientes
            datasets: [{
                label: 'Ventas por Cliente', // Título del conjunto de datos
                data: Object.values(ventasPorCliente), // Datos: las ventas realizadas por cada cliente
                backgroundColor: 'rgba(255, 159, 64, 0.7)', // Color de fondo de las barras
                borderColor: 'rgba(255, 159, 64, 1)', // Color del borde de las barras
                borderWidth: 1 // Grosor del borde de las barras
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // El eje Y comienza en cero para mostrar correctamente las barras
                }
            }
        }
    });

    // Gráfico de Ventas por Año (nuevo gráfico)

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de ventas por año
    const ctx6 = document.getElementById('ventasAnoChart').getContext('2d');

    // Si ya existe un gráfico (ventasAnoChart), lo destruimos para crear uno nuevo
    if (ventasAnoChart) {
        ventasAnoChart.destroy();
    }

    // Colores para cada barra del gráfico
    const backgroundColors = [
        'rgba(153, 102, 255, 0.7)', // Color para la primera barra
        'rgba(54, 162, 235, 0.7)', // Color para la segunda barra
        'rgba(255, 206, 86, 0.7)', // Color para la tercera barra
        'rgba(75, 192, 192, 0.7)', // Color para la cuarta barra
        'rgba(255, 159, 64, 0.7)'  // Color para la quinta barra
    ];

    // Colores de los bordes para cada barra del gráfico
    const borderColors = [
        'rgba(153, 102, 255, 0.9)', // Borde para la primera barra
        'rgba(54, 162, 235, 0.9)', // Borde para la segunda barra
        'rgba(255, 206, 86, 0.9)', // Borde para la tercera barra
        'rgba(75, 192, 192, 0.9)', // Borde para la cuarta barra
        'rgba(255, 159, 64, 0.9)'  // Borde para la quinta barra
    ];

    // Creación del gráfico de barras para mostrar las ventas por año
    ventasAnoChart = new Chart(ctx6, {
        type: 'bar', // Tipo de gráfico: barras
        data: {
            labels: Object.keys(ventasPorAno), // Etiquetas: los años
            datasets: [{
                label: 'Ventas por Año', // Título del conjunto de datos
                data: Object.values(ventasPorAno), // Datos: las ventas de cada año
                backgroundColor: backgroundColors, // Colores de fondo de las barras
                borderColor: borderColors, // Colores de los bordes de las barras
                borderWidth: 1 // Grosor del borde de las barras
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true, // El eje Y comienza en cero para mostrar correctamente las barras
                }
            }
        }
    });




    // Gráfico de Media de Ventas por Mes

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de la media de ventas
    const ctx7 = document.getElementById('mediaVentasChart').getContext('2d');

    // Si ya existe un gráfico (mediaVentasChart), lo destruimos para crear uno nuevo
    if (mediaVentasChart) {
        mediaVentasChart.destroy();
    }

    // Inicialización de un objeto vacío para almacenar los valores de la media por mes
    let mediaData = {};

    // Bucle que recorre las ventas por mes y calcula la media
    for (let mes in mediaVentas) {
        // Calculamos la suma de todas las ventas en el mes
        let sum = mediaVentas[mes].reduce((a, b) => a + b, 0);

        // Calculamos la media dividiendo la suma entre la cantidad de ventas
        mediaData[mes] = sum / mediaVentas[mes].length;
    }

    // Creación del gráfico de línea para mostrar la media de ventas por mes
    mediaVentasChart = new Chart(ctx7, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: Object.keys(mediaData), // Etiquetas: los meses
            datasets: [{
                label: 'Media de Ventas por Mes', // Título del conjunto de datos
                data: Object.values(mediaData), // Datos: la media de ventas por mes
                fill: false, // No se llena el área bajo la línea
                borderColor: 'rgba(255, 99, 132, 1)', // Color de la línea
                tension: 0.1 // Suavizado de la línea
            }]
        },
        options: {} // Opciones del gráfico (vacías en este caso)
    });

    // Gráfico de Mediana de Ventas por Mes

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de la mediana de ventas
    const ctx8 = document.getElementById('medianaVentasChart').getContext('2d');

    // Si ya existe un gráfico (medianaVentasChart), lo destruimos para crear uno nuevo
    if (medianaVentasChart) {
        medianaVentasChart.destroy();
    }

    // Inicialización de un objeto vacío para almacenar los valores de la mediana por mes
    let medianaData = {};

    // Bucle que recorre las ventas por mes y calcula la mediana
    for (let mes in medianaVentas) {
        // Ordenamos las ventas del mes de menor a mayor
        let sorted = medianaVentas[mes].sort((a, b) => a - b);

        // Calculamos el índice del valor medio
        let mid = Math.floor(sorted.length / 2);

        // Si el número de elementos es impar, tomamos el valor central. Si es par, tomamos el promedio de los dos valores centrales.
        medianaData[mes] = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    // Creación del gráfico de línea para mostrar la mediana de ventas por mes
    medianaVentasChart = new Chart(ctx8, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: Object.keys(medianaData), // Etiquetas: los meses
            datasets: [{
                label: 'Mediana de Ventas por Mes', // Título del conjunto de datos
                data: Object.values(medianaData), // Datos: la mediana de ventas por mes
                fill: false, // No se llena el área bajo la línea
                borderColor: 'rgba(54, 162, 235, 1)', // Color de la línea
                tension: 0.1 // Suavizado de la línea
            }]
        },
        options: {} // Opciones del gráfico (vacías en este caso)
    });




    // Gráfico de Moda de Ventas por Mes

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de la moda de ventas
    const ctx9 = document.getElementById('modaVentasChart').getContext('2d');

    // Si ya existe un gráfico (modaVentasChart), lo destruimos para crear uno nuevo
    if (modaVentasChart) {
        modaVentasChart.destroy();
    }

    // Inicialización de un objeto vacío para almacenar los valores de la moda por mes
    let modaData = {};

    // Bucle que recorre las ventas por mes y calcula la moda (valor más frecuente)
    for (let mes in modaVentas) {
        let maxCount = 0; // Contador para la frecuencia máxima
        let modaValue = 0; // Valor de la moda

        // Bucle para encontrar el valor más frecuente dentro de un mes
        for (let value in modaVentas[mes]) {
            if (modaVentas[mes][value] > maxCount) {
                maxCount = modaVentas[mes][value]; // Actualizamos la frecuencia máxima
                modaValue = parseFloat(value); // Actualizamos el valor de la moda
            }
        }

        // Guardamos el valor de la moda para ese mes
        modaData[mes] = modaValue;
    }

    // Creación del gráfico de línea para mostrar la moda de ventas por mes
    modaVentasChart = new Chart(ctx9, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: Object.keys(modaData), // Etiquetas: los meses
            datasets: [{
                label: 'Moda de Ventas por Mes', // Título del conjunto de datos
                data: Object.values(modaData), // Datos: los valores de la moda por mes
                fill: false, // No se llena el área bajo la línea
                borderColor: 'rgba(255, 206, 86, 1)', // Color de la línea
                tension: 0.1 // Suavizado de la línea
            }]
        },
        options: {} // Opciones del gráfico (vacías en este caso)
    });

    // Gráfico de Desviación Estándar de Ventas por Mes

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico de la desviación estándar de ventas
    const ctx10 = document.getElementById('desviacionVentasChart').getContext('2d');

    // Si ya existe un gráfico (desviacionVentasChart), lo destruimos para crear uno nuevo
    if (desviacionVentasChart) {
        desviacionVentasChart.destroy();
    }

    // Inicialización de un objeto vacío para almacenar los valores de la desviación estándar por mes
    let desviacionData = {};

    // Bucle que recorre las ventas por mes y calcula la desviación estándar
    for (let mes in desviacionVentas) {
        // Calculamos la media de las ventas en el mes
        let mean = desviacionVentas[mes].reduce((a, b) => a + b, 0) / desviacionVentas[mes].length;

        // Calculamos la varianza
        let variance = desviacionVentas[mes].reduce((a, b) => a + Math.pow(b - mean, 2), 0) / desviacionVentas[mes].length;

        // Calculamos la desviación estándar como la raíz cuadrada de la varianza
        desviacionData[mes] = Math.sqrt(variance);
    }

    // Creación del gráfico de línea para mostrar la desviación estándar de ventas por mes
    desviacionVentasChart = new Chart(ctx10, {
        type: 'line', // Tipo de gráfico: línea
        data: {
            labels: Object.keys(desviacionData), // Etiquetas: los meses
            datasets: [{
                label: 'Desviación Estándar de Ventas por Mes', // Título del conjunto de datos
                data: Object.values(desviacionData), // Datos: la desviación estándar por mes
                fill: false, // No se llena el área bajo la línea
                borderColor: 'rgba(75, 192, 192, 1)', // Color de la línea
                tension: 0.1 // Suavizado de la línea
            }]
        },
        options: {} // Opciones del gráfico (vacías en este caso)
    });

    // Función para calcular el diagrama de Pareto

    function calculatePareto(data) {
        // Ordenamos los datos de mayor a menor
        let sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

        // Inicialización de la suma acumulada y el array para almacenar el porcentaje acumulado
        let cumulativeSum = 0;
        let cumulativePercentage = [];

        // Bucle para calcular el porcentaje acumulado
        sortedData.forEach(item => {
            cumulativeSum += item[1]; // Suma acumulada
            cumulativePercentage.push((cumulativeSum / Object.values(data).reduce((a, b) => a + b, 0)) * 100); // Porcentaje acumulado
        });

        // Retornamos los datos ordenados y el porcentaje acumulado
        return {
            labels: sortedData.map(item => item[0]), // Etiquetas (productos, clientes, etc.)
            data: sortedData.map(item => item[1]), // Datos (ventas, cantidades, etc.)
            cumulativePercentage: cumulativePercentage // Porcentaje acumulado
        };
    }

    // Gráfico de Diagrama de Pareto por Producto

    // Llamada a la función para calcular el Diagrama de Pareto para las ventas por producto
    const paretoProducto = calculatePareto(ventasPorProducto);

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico para el producto
    const ctxParetoProducto = document.getElementById('paretoProductoChart').getContext('2d');

    // Si ya existe un gráfico (paretoProductoChart), lo destruimos para crear uno nuevo
    if (paretoProductoChart) {
        paretoProductoChart.destroy();
    }

    // Creación del gráfico de tipo 'bar' (barras) con la librería Chart.js
    paretoProductoChart = new Chart(ctxParetoProducto, {
        type: 'bar', // Tipo de gráfico (barras)
        data: {
            // Datos del gráfico
            labels: paretoProducto.labels, // Etiquetas para el eje X (productos)
            datasets: [{
                label: 'Ventas por Producto', // Título del conjunto de datos
                data: paretoProducto.data, // Datos de las ventas por producto
                backgroundColor: paretoProducto.cumulativePercentage.map(percent => {
                    // Asignación de color en base al porcentaje acumulado
                    if (percent <= 80) return 'rgba(75, 192, 192, 0.7)'; // Verde
                    if (percent <= 90) return 'rgba(255, 206, 86, 0.7)'; // Amarillo
                    return 'rgba(255, 99, 132, 0.7)'; // Rojo
                }),
                borderColor: 'rgba(75, 192, 192, 1)', // Color del borde de las barras
                borderWidth: 1 // Ancho del borde
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Configuración para que el eje Y comience en 0
                }
            }
        }
    });

    // Gráfico de Diagrama de Pareto por Cliente

    // Llamada a la función para calcular el Diagrama de Pareto para las ventas por cliente
    const paretoCliente = calculatePareto(ventasPorCliente);

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico para el cliente
    const ctxParetoCliente = document.getElementById('paretoClienteChart').getContext('2d');

    // Si ya existe un gráfico (paretoClienteChart), lo destruimos para crear uno nuevo
    if (paretoClienteChart) {
        paretoClienteChart.destroy();
    }

    // Creación del gráfico de tipo 'bar' (barras) con la librería Chart.js para las ventas por cliente
    paretoClienteChart = new Chart(ctxParetoCliente, {
        type: 'bar', // Tipo de gráfico (barras)
        data: {
            // Datos del gráfico
            labels: paretoCliente.labels, // Etiquetas para el eje X (clientes)
            datasets: [{
                label: 'Ventas por Cliente', // Título del conjunto de datos
                data: paretoCliente.data, // Datos de las ventas por cliente
                backgroundColor: paretoCliente.cumulativePercentage.map(percent => {
                    // Asignación de color en base al porcentaje acumulado
                    if (percent <= 80) return 'rgba(75, 192, 192, 0.7)'; // Verde
                    if (percent <= 90) return 'rgba(255, 206, 86, 0.7)'; // Amarillo
                    return 'rgba(255, 99, 132, 0.7)'; // Rojo
                }),
                borderColor: 'rgba(75, 192, 192, 1)', // Color del borde de las barras
                borderWidth: 1 // Ancho del borde
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Configuración para que el eje Y comience en 0
                }
            }
        }
    });

    // Gráfico de Diagrama de Pareto por Vendedor

    // Llamada a una función para calcular el Diagrama de Pareto para las ventas por vendedor
    const paretoVendedor = calculatePareto(ventasPorVendedor);

    // Obtención del contexto del lienzo (canvas) donde se dibujará el gráfico
    const ctxParetoVendedor = document.getElementById('paretoVendedorChart').getContext('2d');

    // Si ya existe un gráfico (paretoVendedorChart), lo destruimos para crear uno nuevo
    if (paretoVendedorChart) {
        paretoVendedorChart.destroy();
    }

    // Creación del gráfico de tipo 'bar' (barras) con la librería Chart.js
    paretoVendedorChart = new Chart(ctxParetoVendedor, {
        type: 'bar', // Tipo de gráfico (barras)
        data: {
            // Datos del gráfico
            labels: paretoVendedor.labels, // Etiquetas para el eje X (vendedores)
            datasets: [{
                label: 'Ventas por Vendedor', // Título del conjunto de datos
                data: paretoVendedor.data, // Datos de las ventas por vendedor
                backgroundColor: paretoVendedor.cumulativePercentage.map(percent => {
                    // Asignación de color en base al porcentaje acumulado
                    if (percent <= 80) return 'rgba(75, 192, 192, 0.7)'; // Verde
                    if (percent <= 90) return 'rgba(255, 206, 86, 0.7)'; // Amarillo
                    return 'rgba(255, 99, 132, 0.7)'; // Rojo
                }),
                borderColor: 'rgba(75, 192, 192, 1)', // Color del borde de las barras
                borderWidth: 1 // Ancho del borde
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Configuración para que el eje Y comience en 0
                }
            }
        }
    });

    // Gráfico de Diagrama de Pareto por Localidad

    // Llamada a la función para calcular el Diagrama de Pareto para las ventas por localidad
    const paretoLocalidad = calculatePareto(ventasPorLocalidad);

    // Obtención del contexto del lienzo (canvas) para el gráfico de localidad
    const ctxParetoLocalidad = document.getElementById('paretoLocalidadChart').getContext('2d');

    // Si ya existe un gráfico (paretoLocalidadChart), lo destruimos para crear uno nuevo
    if (paretoLocalidadChart) {
        paretoLocalidadChart.destroy();
    }

    // Creación del gráfico de tipo 'bar' (barras) con la librería Chart.js para las localidades
    paretoLocalidadChart = new Chart(ctxParetoLocalidad, {
        type: 'bar', // Tipo de gráfico (barras)
        data: {
            // Datos del gráfico
            labels: paretoLocalidad.labels, // Etiquetas para el eje X (localidades)
            datasets: [{
                label: 'Ventas por Localidad', // Título del conjunto de datos
                data: paretoLocalidad.data, // Datos de las ventas por localidad
                backgroundColor: paretoLocalidad.cumulativePercentage.map(percent => {
                    // Asignación de color en base al porcentaje acumulado
                    if (percent <= 80) return 'rgba(75, 192, 192, 0.7)'; // Verde
                    if (percent <= 90) return 'rgba(255, 206, 86, 0.7)'; // Amarillo
                    return 'rgba(255, 99, 132, 0.7)'; // Rojo
                }),
                borderColor: 'rgba(75, 192, 192, 1)', // Color del borde de las barras
                borderWidth: 1 // Ancho del borde
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Configuración para que el eje Y comience en 0
                }
            }
        }
    });

}


// Cargar datos JSON desde una URL externa (en este caso, un archivo .json en GitHub)
$.getJSON('https://raw.githubusercontent.com/JUANCITOPENA/RECURSOS-DE-BASE-DE-DATOS-Y-DATOS-CURSOS-SQL-SERVER-Y-ANALISIS-DE-DATOS/refs/heads/main/ventas_tecnologia.json', function (data) {
    // Inicializamos la variable 'filteredData' con todos los datos cargados
    let filteredData = data;

    // Obtener datos únicos para los filtros de cada propiedad
    let facturas = [...new Set(data.map(venta => venta.factura))];  // Listado único de facturas
    let productos = [...new Set(data.flatMap(venta => venta.productos.map(producto => producto.producto)))];  // Listado único de productos
    let clientes = [...new Set(data.map(venta => venta.cliente))];  // Listado único de clientes
    let vendedores = [...new Set(data.map(venta => venta.vendedor))];  // Listado único de vendedores
    let localidades = [...new Set(data.map(venta => venta.localidad))];  // Listado único de localidades

    // Llenar los filtros con los datos únicos de cada categoría
    // Agregar las opciones de factura en el filtro de la interfaz de usuario
    facturas.forEach(factura => {
        $('#facturaFilter').append(`<option value="${factura}">${factura}</option>`);
        $('#facturaFilterMobile').append(`<option value="${factura}">${factura}</option>`);
    });

    // Agregar las opciones de producto en el filtro de la interfaz de usuario
    productos.forEach(producto => {
        $('#productoFilter').append(`<option value="${producto}">${producto}</option>`);
        $('#productoFilterMobile').append(`<option value="${producto}">${producto}</option>`);
    });

    // Agregar las opciones de cliente en el filtro de la interfaz de usuario
    clientes.forEach(cliente => {
        $('#clienteFilter').append(`<option value="${cliente}">${cliente}</option>`);
        $('#clienteFilterMobile').append(`<option value="${cliente}">${cliente}</option>`);
    });

    // Agregar las opciones de vendedor en el filtro de la interfaz de usuario
    vendedores.forEach(vendedor => {
        $('#vendedorFilter').append(`<option value="${vendedor}">${vendedor}</option>`);
        $('#vendedorFilterMobile').append(`<option value="${vendedor}">${vendedor}</option>`);
    });

    // Agregar las opciones de localidad en el filtro de la interfaz de usuario
    localidades.forEach(localidad => {
        $('#localidadFilter').append(`<option value="${localidad}">${localidad}</option>`);
        $('#localidadFilterMobile').append(`<option value="${localidad}">${localidad}</option>`);
    });

    // Actualizar el dashboard con los datos filtrados (al principio, sin filtro)
    updateDashboard(filteredData);

    // Eventos para actualizar los datos filtrados cuando se cambian los filtros en la interfaz de usuario (escritorio)
    $('#facturaFilter, #productoFilter, #clienteFilter, #vendedorFilter, #localidadFilter').on('change', function () {
        const filters = {
            factura: $('#facturaFilter').val(),  // Obtener el valor del filtro de factura
            producto: $('#productoFilter').val(),  // Obtener el valor del filtro de producto
            cliente: $('#clienteFilter').val(),  // Obtener el valor del filtro de cliente
            vendedor: $('#vendedorFilter').val(),  // Obtener el valor del filtro de vendedor
            localidad: $('#localidadFilter').val()  // Obtener el valor del filtro de localidad
        };
        // Filtrar los datos basados en los filtros seleccionados
        filteredData = filterData(data, filters);
        // Actualizar el dashboard con los datos filtrados
        updateDashboard(filteredData);
    });

    // Eventos para actualizar los datos filtrados cuando se cambian los filtros en la interfaz de usuario (móvil)
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

    // Evento para limpiar los filtros en la versión de escritorio
    $('#clearFilters').on('click', function () {
        // Limpiar todos los filtros
        $('#facturaFilter, #productoFilter, #clienteFilter, #vendedorFilter, #localidadFilter').val('');
        filteredData = data;  // Restablecer los datos a los originales sin filtrado
        updateDashboard(filteredData);  // Actualizar el dashboard con todos los datos
    });

    // Evento para limpiar los filtros en la versión móvil
    $('#clearFiltersMobile').on('click', function () {
        // Limpiar todos los filtros móviles
        $('#facturaFilterMobile, #productoFilterMobile, #clienteFilterMobile, #vendedorFilterMobile, #localidadFilterMobile').val('');
        filteredData = data;  // Restablecer los datos a los originales sin filtrado
        updateDashboard(filteredData);  // Actualizar el dashboard con todos los datos
    });
});
