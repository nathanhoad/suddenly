const Lab = require('lab');
const Server = require('app/server');
const Testing = require('../testing');

const expect = require('code').expect;

const lab = exports.lab = Lab.script();


lab.experiment('{{ROUTE}}-routes', () => {
    var user;
    var headers;
    
    
    lab.beforeEach((done) => {
        Helpers.resetDatabase().then((session) => {
            user = session.user;
            headers = { authorization: session.token };
            done();
        });
    });
    
    
    lab.suite('GET /{{ROUTE}}', () => {
        lab.test('returns a message', (done) => {
            Server.inject({ method: 'get', url: '/{{ROUTE}}' }, (response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.contain('Find me in app/server/routes');
                
                done();
            });
        });
    });
});