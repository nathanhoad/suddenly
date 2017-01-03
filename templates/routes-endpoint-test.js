const Lab = require('lab');
const Server = require('app/server');
const Testing = require('../testing');

const expect = require('code').expect;

const lab = exports.lab = Lab.script();


lab.experiment('{{ROUTE}}-routes', () => {
    var user;
    var headers;
    
    
    lab.beforeEach((done) => {
        Testing.resetDatabase().then((session) => {
            user = session.user;
            headers = { authorization: session.token };
            done();
        });
    });
    
    
    lab.suite('GET /app/{{ROUTE}}', () => {
        lab.beforeEach((done) => {
            Promise.all([
                Testing.create{{MODEL_CLASS}}(),
                Testing.create{{MODEL_CLASS}}(),
                Testing.create{{MODEL_CLASS}}()
            ]).then(() => {
                done();
            });
        });
        
        
        lab.test('gets a list of {{MODELS_LOWERCASE}}', (done) => {
            Server.inject({ method: 'get', url: '/app/{{ROUTE}}' }, (response) => {
                expect(response.statusCode).to.equal(200);
                
                let {{MODELS_LOWERCASE}} = response.result;
                expect({{MODELS_LOWERCASE}}).to.be.an.array();
                expect({{MODELS_LOWERCASE}}.length).to.equal(3);
                expect({{MODELS_LOWERCASE}}[0]).to.contain(['id']);
                
                done();
            });
        });
    });
    
    
    lab.suite('GET /app/{{ROUTE}}/{{{MODEL_LOWERCASE}}}', () => {
        var existing_{{MODEL_LOWERCASE}};
        
        lab.beforeEach((done) => {
            Testing.create{{MODEL_CLASS}}().then(({{MODEL_LOWERCASE}}) => {
                existing_{{MODEL_LOWERCASE}} = {{MODEL_LOWERCASE}};
                done();
            });
        });
        
        
        lab.test('fails when the {{MODEL_LOWERCASE}} doesn\'t exist', (done) => {
            Server.inject({ method: 'get', url: '/app/{{ROUTE}}/not-a-real-slug' }, (response) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });
        
        
        lab.test('gets a single {{MODEL_LOWERCASE}}', (done) => {
            Server.inject({ method: 'get', url: `/app/{{ROUTE}}/${existing_{{MODEL_LOWERCASE}}.get('slug')}` }, (response) => {
                expect(response.statusCode).to.equal(200);
                
                let {{MODEL_LOWERCASE}} = response.result;
                expect({{MODEL_LOWERCASE}}).to.be.an.object();
                expect({{MODEL_LOWERCASE}}).to.contain(['id', 'slug']);
                expect({{MODEL_LOWERCASE}}.id).to.equal(existing_{{MODEL_LOWERCASE}}.id);
                
                done();
            });
        });
    });
    
    
    lab.suite('POST /app/{{ROUTE}}', () => {
        lab.test('fails when not authenticated', (done) => {
            Server.inject({ method: 'post', url: '/app/{{ROUTE}}', payload: {}}, (response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });
        
        
        lab.test('can create a new {{MODEL_LOWERCASE}}', (done) => {
            Server.inject({ method: 'post', url: '/app/{{ROUTE}}', payload: {}, headers: headers }, (response) => {
                expect(response.statusCode).to.equal(200);
                
                let {{MODEL_LOWERCASE}} = response.result;
                expect({{MODEL_LOWERCASE}}).to.contain(['id', 'slug']);
                
                done();
            });
        });
    });
    
    
    lab.suite('PUT /app/{{ROUTE}}/{{{MODEL_LOWERCASE}}}', () => {
        let existing_{{MODEL_LOWERCASE}};
        
        lab.beforeEach((done) => {
            Testing.create{{MODEL_CLASS}}().then(({{MODEL_LOWERCASE}}) => {
                existing_{{MODEL_LOWERCASE}} = {{MODEL_LOWERCASE}};
                done();
            });
        });
        
        
        lab.test('fails when not authenticated', (done) => {
            Server.inject({ method: 'put', url: `/app/{{ROUTE}}/${existing_{{MODEL_LOWERCASE}}.get('slug')}` }, (response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });
        
        
        lab.test('fails when the given {{MODEL_LOWERCASE}} doesn\'t exist', (done) => {
            Server.inject({ method: 'put', url: '/app/{{ROUTE}}/not-a-real-slug', payload: {}, headers: headers }, (response) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });
        
        
        lab.test('can update a given {{MODEL_LOWERCASE}}', (done) => {
            let updating_to = {
                slug: 'new-slug'
            };
            
            Server.inject({ method: 'put', url: `/app/{{ROUTE}}/${existing_{{MODEL_LOWERCASE}}.get('slug')}`, payload: updating_to, headers: headers }, (response) => {
                expect(response.statusCode).to.equal(200);
                
                let {{MODEL_LOWERCASE}} = response.result;
                expect({{MODEL_LOWERCASE}}).to.be.an.object();
                expect({{MODEL_LOWERCASE}}.slug).to.equal(updating_to.slug);
                
                done();
            });
        });
    });
    
    
    lab.suite('DELETE /app/{{ROUTE}}/{{{MODEL_LOWERCASE}}}', () => {
        let existing_{{MODEL_LOWERCASE}};
        
        
        lab.beforeEach((done) => {
            Testing.create{{MODEL_CLASS}}().then(({{MODEL_LOWERCASE}}) => {
                existing_{{MODEL_LOWERCASE}} = {{MODEL_LOWERCASE}};
                done();
            });
        });
        
        
        lab.test('fails when not authenticated', (done) => {
            Server.inject({ method: 'delete', url: `/app/{{ROUTE}}/${existing_{{MODEL_LOWERCASE}}.get('slug')}` }, (response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });
        
        
        lab.test('fails when the given {{MODEL_LOWERCASE}} doesn\'t exist', (done) => {
            Server.inject({ method: 'delete', url: `/app/{{ROUTE}}/not-a-real-slug`, headers: headers }, (response) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });
        
        
        lab.test('deletes the given {{MODEL_LOWERCASE}}', (done) => {
            Server.inject({ method: 'delete', url: `/app/{{ROUTE}}/${existing_{{MODEL_LOWERCASE}}.get('slug')}`, headers: headers }, (response) => {
                expect(response.statusCode).to.equal(200);
                
                existing_{{MODEL_LOWERCASE}}.refresh().then(({{MODEL_LOWERCASE}}) => {
                    expect({{MODEL_LOWERCASE}}).to.be.null();
                    done();
                });
            });
        });
    });
});
