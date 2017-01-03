module.exports.public = ({{MODEL}}) => {
    if ({{MODEL}}.toJSON) {{MODEL}} = {{MODEL}}.toJSON();
    
    return {
        id: {{MODEL}}.id{{SLUG}}
    };
};


module.exports.private = ({{MODEL}}) => {
    if ({{MODEL}}.toJSON) {{MODEL}} = {{MODEL}}.toJSON();
    
    return {{MODEL}};
};
