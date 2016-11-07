const Lab = require('lab');
const React = require('react');
const { shallow } = require('enzyme');
const Sinon = require('sinon');

const Testing = require('../Testing');

const expect = require('code').expect;
const lab = exports.lab = Lab.script();

const {{CLASS_NAME}} = require('app/client/components/{{FILE_NAME}}');


lab.experiment("{{CLASS_NAME}}:", () => {
    lab.test('it renders', (done) => {
        let item = shallow(<{{CLASS_NAME}} />);
        
        expect(item.html()).to.contain('Find me');
        
        done();
    });
});