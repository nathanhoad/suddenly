const React = require('react');

const styles = require('app/assets/styles/{{FILE_NAME}}.css');


class {{CLASS_NAME}} extends React.Component {
    render () {
        return (
            <div className={styles.wrapper}>
                Find me in <strong>app/client/components/{{FILE_NAME}}.js</strong>
            </div>
        );
    }
}



module.exports = {{CLASS_NAME}};