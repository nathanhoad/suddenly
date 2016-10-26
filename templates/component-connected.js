const React = require('react');
const ReactRedux = require('react-redux');

const styles = require('app/styles/{{FILE_NAME}}.css');


class {{CLASS_NAME}} extends React.Component {
    render () {
        return (
            <div className={styles.wrapper}>
                Find me in <strong>app/client/components/{{FILE_NAME}}.js</strong>
            </div>
        )
    }
}


const mapStateToProps = (state, props) => {
    return {}
};


const mapDispatchToProps = (dispatch, props) => {
    return {}
};


module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)({{CLASS_NAME}});
module.exports.{{CLASS_NAME}} = {{CLASS_NAME}};