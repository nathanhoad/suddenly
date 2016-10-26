const Lab = require('lab');
const expect = require('code').expect;
const Path = require('path');
const FS = require('fs-extra');

const lab = exports.lab = Lab.script();

const Mailer = require('../mailer');


lab.experiment('Mailer', () => {
    var mailer;
    
    
    lab.beforeEach((done) => {
        mailer = Mailer.create({ APP_ROOT: Path.resolve(`${__dirname}/../tmp`) });
        
        // Empty the project folder
        FS.remove(`${__dirname}/../tmp/*`, () => {
            done();
        });
    });
    
    
    lab.suite('render', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/mailer`, `${__dirname}/../tmp`, (err) => {
                    done();
                });
            });
        });
        
        
        lab.test('can render a template', (done) => {
            let rendered_email = mailer.render('hello.html', { name: 'Nathan' });
            
            expect(rendered_email).to.contain('This is a notification for Nathan');
            
            done();
        });
    });
});