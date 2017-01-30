# Suddenly

[![CircleCI](https://circleci.com/gh/nathanhoad/suddenly.svg?style=svg)](https://circleci.com/gh/nathanhoad/suddenly)

A bunch of tools to help with Suddenly apps.

To generate a new Suddenly app, check out: [suddenly-cli](https://www.npmjs.com/package/suddenly-cli)


## Usage

### Builder

Sets up Webpack with some common settings.

* `clean (config)` - Cleans the build directory.
* `build (config, args)` - Builds a project. Pass 'hot' as an arg to build with Webpack Dev Server.
* `run (config, args)` - Runs a Webpack Dev Server with the latest build (alongside a Hapi server).
* `buildAndRun (config)` - Compiles a hot reload build and then runs `run()`


### Database

Handles database migrations.

* `migration (config, args)` - Generates a migration named from `args[0]`.
* `model (config, args)` - Generates a model and model migration named from `args[0]`. Pass 'no-migration' to skip the migration. Pass 'no-model' to only generate the model.
* `migrate (config)` - Runs any pending migrations
* `rollback (config)` - Rolls back the latest batch of migrations
* `version (config)` - Gets the schema version
* `schema (config, args)` - Gets information about the current schema. Pass a table name at `args[0]` to get just that table's schema.


### Generate

Generates bootstrap files for the project.

* `routes (config, args)` - Generates a routes file and tests named from `args[0]`. Pass 'no-tests' to skip creating tests.
* `resource (config, args)` - Generates a resources file named from `args[0]`
* `notification (config, args)` - Generates a notification email template and notification method named from `args[0]`
* `actions (config, args)`- Generates an actions file and tests named from `args[0]`. Pass 'no-tests' to skip creating tests.
* `reducer (config, args)` - Generates a reducer file and tests named from `args[0]`. Pass 'no-tests' to skip creating tests.
* `redux (config, args)` - Shortcut for generating an actions and a reducer at the same time.
* `component (config, args)` - Generates a React component and tests named from `args[0]`. Pass 'no-tests' to skip creating tests. Pass 'connected' to generate a Redux connected component. Pass `no-style` to skip generating a stylesheet. Pass `with-provider` to include a provider setup in the tests.
* `style (config, args)` - Generates a stylesheet.


### Mailer

* `create (config)` - Creates a Mailer proxy for sending emails
  * `mailer.* (to, subject, locals, callback)` - Call `mailer.send()` with the method name as the template.
  * `mailer.send (to, subject, template, locals, callback)` - Sends an email
  * `mailer.render (filename, locals)` - Render an email template


### Server

* `routes (server, config)` - Attaches routes found in `<APP_ROOT>/app/server/routes` to the `server`
* `run (config, args)` - Runs the server.


## Testing

Create a database called `suddenly_test` and then run `npm test`
