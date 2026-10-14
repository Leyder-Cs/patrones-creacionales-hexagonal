// Ejecutar en mongosh (después de seleccionar la base)
use('productosdb');
if (db.orders.countDocuments({}) === 0) {
  db.orders.insertOne({customer: 'Ana', total: 95000});
}
