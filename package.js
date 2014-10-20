Package.describe({
  name: "leesangwon:mira-accounts-entry",
  summary: "Accounts-ui package, modified version of Accounts-entry package ",
  version: "0.4.0",
  git: "https://github.com/miraten/mira-accounts-entry"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3.1');

  api.use([
    'accounts-base',
    'accounts-password',
    'underscore',
    'iron:router@0.9.4',
    'leesangwon:mira-i18n@0.4.0',
    'leesangwon:mira-validator@0.3.0'
  ], ['client', 'server']);

  api.use([
    'blaze',
    'service-configuration',
    'sha',
    'spacebars',
    'templating'
  ], 'client');

  api.addFiles([
    'shared/router.js'
  ], ['client', 'server']);

  api.addFiles([
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
    'client/views/verifyEmail/verifyEmail.js',
  ], 'client');

  api.addFiles([
    'server/entry.js'
  ], 'server');

  api.export('AccountsEntry');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('leesangwon:mira-accounts-entry');

  api.addFiles([
    'tests/route.js',
    'tests/client.html',
    'tests/client.js'
  ], 'client');

});
