Accounts.urls.resetPassword = function(token) {
  return Meteor.absoluteUrl('reset-password/' + token);
};

AccountsEntry = {
  settings: {},
  config: function(appConfig) {
    return this.settings = _.extend(this.settings, appConfig);
  }
};

var validateAccount = function(attributes) {

  var validator = new AccountValidator();
  validator.validateUsername(attributes.username);
  validator.validateEmail(attributes.email);
  validator.validatePassword(attributes.password);

  if (validator.errors().length > 0) {
    Logger.info('error: ' + validator.errorsToString());
    throw new Match.Error(validator.errorsToString());
  } else {
    return true;
  }
};

Meteor.methods({
  entryCreateUser: function(attributes) {
    try {
      check(attributes, Match.Where(matchAccountNew));
      check(attributes, Match.Where(matchAccountNewServer));
    } catch (ex) {
      Logger.info('error: ' + JSON.stringify(ex));
      return new Meteor.Error('Match.Error', ex.message, JSON.stringify(ex.sanitizedError));
    }

    try {
      var profile = AccountsEntry.settings.defaultProfile || {};

      var userId = Accounts.createUser({
        username: attributes.username,
        email: attributes.email,
        password: attributes.password,
        profile: profile
      });
    } catch (ex) {
      throw new Meteor.Error(ex.error, ex.reason, ex.message);
    }

    if (Accounts._options.sendVerificationEmail) {
      return Accounts.sendVerificationEmail(userId, attributes.email);
    }
  },

  entryCheckUsername: function(attributes) {
    check(attributes, { input: String });

    var user = Meteor.users.findOne({ username: attributes.input });

    if (user)
      return false;
    else
      return true;
  }
});

