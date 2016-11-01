const Lab = require('lab');
const expect = require('code').expect;

const lab = exports.lab = Lab.script();

const Suddenly = require('..');

const Log = require('../log');
// Log.silent = true;


lab.experiment('Suddenly', () => {
    var suddenly;
    
    
    lab.beforeEach((done) => {
        suddenly = new Suddenly.Instance();
        
        done();
    });
    
    
    lab.suite('tasks', () => {
        lab.test('adds tasks', (done) => {
            let given_config = {};
            let given_args = [];
            
            let doThing = (config, args) => {
                return new Promise((resolve, reject) => {
                    given_config = config;
                    given_args = args;
                    resolve();
                });
            };
            
            suddenly.task('do:thing', doThing, false);
            
            expect(suddenly.tasks).to.contain(['do:thing']);
            
            suddenly.handleTasks({}, [null, null, 'do:thing', 'argument']).then(() => {
                expect(given_config).to.contain(['APP_ROOT']);
                expect(given_args).to.contain(['argument']);
                
                done();
            });
        });
    });
});