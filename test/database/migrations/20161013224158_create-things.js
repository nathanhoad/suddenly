module.exports = { 
    up (knex, Promise) {
        return knex.schema.createTable('things', (table) => {
            table.string('name');
        });
    },
    
    
    down (knex, Promise) {
        return knex.schema.dropTable('things');
    }    
};