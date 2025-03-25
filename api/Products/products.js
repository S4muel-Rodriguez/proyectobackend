const mongoosePaginate = require('mongoose-paginate-v2');
productSchema.plugin(mongoosePaginate);


router.get('/', async (req, res) => {
    try {
        // Obtener parámetros de consulta
        const { page = 1, limit = 10, sort = 'name', order = 'asc', filterBy, filterValue } = req.query;

        // Construir criterios de filtro
        const filter = filterBy && filterValue ? { [filterBy]: filterValue } : {};

        // Construir opciones de paginación y ordenamiento
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sort]: order === 'asc' ? 1 : -1 },
        };

        // Realizar la consulta con paginación, ordenamiento y filtros
        const products = await Product.paginate(filter, options);

        // Responder con los datos paginados
        res.json({
            success: true,
            data: products.docs,
            pagination: {
                totalDocs: products.totalDocs,
                totalPages: products.totalPages,
                currentPage: products.page,
                hasNextPage: products.hasNextPage,
                hasPrevPage: products.hasPrevPage,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener los productos' });
    }
});
