const Immutable = require('immutable');
const { Provider } = require('react-redux');
const Lab = require('lab');
const React = require('react');
const { mount } = require('enzyme');
const Sinon = require('sinon');

const Testing = require('../testing');
Testing.mockAssets();
Testing.mockDom();

const expect = require('code').expect;
const lab = exports.lab = Lab.script();

const {{CLASS_NAME}} = require('app/client/components/{{FILE_NAME}}');


lab.experiment("{{CLASS_NAME}}:", () => {
    lab.test('it renders', (done) => {
        let store = Testing.mockStore(Immutable.fromJS({
            // Enter the minimum store properties
        }));
        
        let item = mount(
            <Provider store={store}>
                <{{CLASS_NAME}} />
            </Provider>
        );
        
        expect(item.html()).to.contain('Find me');
        
        done();
    });
});