var errorDictionary = {
  "Login forbidden": "accounts.error_login_forbidden",
  "You've been logged out by the server. Please log in again.": "accounts.error_logged_out_by_server",
  "Your session has expired. Please log in again.": "accounts.error_session_expired",
  "Username already exists.": "accounts.error_username_already_exist",
  "Email already exists.": "accounts.error_email_already_exist"
};

Accounts.urls.resetPassword = function(token) {
  return Meteor.absoluteUrl('reset-password/' + token);
};

Accounts.urls.verifyEmail = function (token) {
  return Meteor.absoluteUrl('verify-email/' + token);
};


AccountsEntry = {
  settings: {},
  config: function(appConfig) {
    return this.settings = _.extend(this.settings, appConfig);
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
      ex.reason = (errorDictionary[ex.reason]) ? errorDictionary[ex.reason] : ex.reason;
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

