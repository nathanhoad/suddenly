module.exports = {
    up (knex, Promise) {
        return knex.schema.createTable('{{TABLE}}', (table) => {
            table.uuid('id').primary();
            {{DEFINE_SLUG}}// TODO: add other fields
            
            table.timestamps();
            
            table.index('created_at');
            table.index('updated_at');{{SLUG_INDEX}}
        });
    },


    down (knex, Promise) {
        return knex.schema.dropTable('{{TABLE}}');
    }
};
