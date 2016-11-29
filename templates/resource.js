module.exports.public = ({{MODEL}}) => {
    if ({{MODEL}}.toJSON) {{MODEL}} = {{MODEL}}.toJSON();
    
    return {
        id: {{MODEL}}.id
    };
};