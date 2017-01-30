const TRY_TOKEN = { mode: 'try', strategy: 'jwt' };


module.exports = [
    {
        method: 'GET',
        path: '/{{ROUTE}}',
        config: {
            auth: TRY_TOKEN,
            handler (request, reply) {
                reply('Find me in app/server/routes/{{ROUTE}}-routes.js');
            }
        }
    }
];
