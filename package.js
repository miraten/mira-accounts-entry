Package.describe({
    summary: "Make signin and signout their own pages with routes.",
    name: "leesangwon:mira-accounts-entry",
    version: "0.1.0"
});

Package.on_use(function(api) {

  // CLIENT
  api.use([
    'deps',
    'service-configuration',
    'accounts-base',
    'underscore',
    'templating',
    'handlebars',
    'session',
    'sha']
  , 'client');


  api.add_files([
    'client/entry.js',
    'client/helpers.js',
    'client/views/signIn/signIn.html',
    'client/views/signIn/signIn.js',
    'client/views/signUp/signUp.html',
    'client/views/signUp/signUp.js',
    'client/views/signUp/extraSignUpFields.html',
    'client/views/signUp/extraSignUpFields.js',
    'client/views/forgotPassword/forgotPassword.html',
    'client/views/forgotPassword/forgotPassword.js',
    'client/views/resetPassword/resetPassword.html',
    'client/views/resetPassword/resetPassword.js',
    'client/views/social/social.html',
    'client/views/social/social.js',
    'client/views/error/error.html',
    'client/views/error/error.js',
    'client/views/accountButtons/accountButtons.html',
    'client/views/accountButtons/_wrapLinks.html',
    'client/views/accountButtons/signedIn.html',
    'client/views/accountButtons/accountButtons.js',
    'client/views/verifyEmail/verifyEmail.js'
  ], 'client');

  // SERVER
  api.use([
    'deps',
    'service-configuration',
    'accounts-password',
    'accounts-base',
    'underscore'
  ], 'server');

  api.add_files(['server/entry.js'], 'server');

  // CLIENT and SERVER
  api.imply('accounts-base', ['client', 'server']);
  api.imply('accounts-password', ['client', 'server']);
  api.use('iron:router@0.9.4', ['client', 'server']);
  api.use('leesangwon:mira-i18n@0.4.0', ['client', 'server']);
  
  api.add_files(['shared/router.js'], ['client', 'server']);

  api.export('AccountsEntry', ['client', 'server']);

});

Package.on_test(function (api) {
  api.use(['tinytest',
            'underscore',
            'handlebars',
            'test-helpers',
            'templating',
            'mongo-livedata',
            'iron-router']);
  api.use('leesangwon:mira-accounts-entry');

  api.add_files(['tests/route.js', 'tests/client.html', 'tests/client.js'], 'client');
})
