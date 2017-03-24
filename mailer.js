const Path = require('path');
const Handlebars = require('handlebars');
const NodeMailer = require('nodemailer');
const SES = require('nodemailer-ses-transport');
const FS = require('fs');

const APP_ROOT = require('app-root-path').toString();


const Mailer = function (config) {
    let mailer = this;
    
    config.APP_ROOT = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    mailer.config = config || {};
    
    mailer.transporter = NodeMailer.createTransport(SES({
        accessKeyId: mailer.config.AWS_ACCESS_KEY,
        secretAccessKey: mailer.config.AWS_SECRET_KEY
    }));
};


/*
    Render an email template
*/
Mailer.prototype.render = function (filename, locals) {
    let mailer = this;
    
    locals = locals || {};
    
    let path = `${mailer.config.APP_ROOT}/app/server/notifications/${filename}`;
    let view = Handlebars.compile(FS.readFileSync(path, 'utf8'));
    
    return view(locals);
};


/*
    Send an email
*/
Mailer.prototype.send = function (to, subject, template, locals, callback) {
    if (process.env.NODE_ENV == 'test') return callback && callback();
    
    let mailer = this;
    
    locals = locals || {};
    locals.config = mailer.config;
    
    let options = {
        from: mailer.config.AWS_SES_FROM,
        to: to,
        subject: `[${mailer.config.APP_NAME}] ${subject}`,
        html: mailer.render(`${template}.html`, locals)
    };
    
    mailer.transporter.sendMail(options, (err, info) => {
        if (err) {
            console.log(err.stack);
            return callback && callback(err);
        }
        
        callback && callback(null, info);
    });
}


module.exports = Mailer;
module.exports.create = function (config) {
    /* 
        Wrap the Mailer in a Proxy so we can have magic template methods
    */
    return new Proxy(new Mailer(config), {
        get: (mailer, method) => {
            if (method in mailer) {
                return mailer[method];
            } else {
                // Convert the method name to the template file name
                let template = method.replace('_', '-').replace(/[^a-zA-Z\-]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                return (to, subject, locals, callback) => {
                    mailer.send(to, subject, template, locals, callback);
                }
            }
        }
    });
};

module.exports.Handlebars = Handlebars;
