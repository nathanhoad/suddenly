const Bookshelf = require('app/server/bookshelf');
const Gimmea = require('gimmea');


module.exports = Bookshelf.model('{{MODEL}}', {
    tableName: '{{TABLE}}',


    initialize () {
        Bookshelf.Model.prototype.initialize.apply(this, arguments);
        
        this.on('creating', () => {
            this.attributes.id = this.attributes.id || Gimmea.uuid();
        });
    }
});