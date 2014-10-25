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

var sendVerificationEmail = function(userId, address) {
  // XXX Also generate a link using which someone can delete this
  // account if they own said address but weren't those who created
  // this account.

  // Make sure the user exists, and address is one of their addresses.
  var user = Meteor.users.findOne(userId);
  if (!user)
    throw new Error("Can't find user");
  // pick the first unverified address if we weren't passed an address.
  if (!address) {
    var email = _.find(user.emails || [],
                       function (e) { return !e.verified; });
    address = (email || {}).address;
  }
  // make sure we have a valid address
  if (!address || !_.contains(_.pluck(user.emails || [], 'address'), address))
    throw new Error("No such email address for user.");


  var tokenRecord = {
    token: Random.secret(),
    address: address,
    when: new Date()};
  Meteor.users.update(
    {_id: userId},
    {$push: {'services.email.verificationTokens': tokenRecord}});

  // before passing to template, update user object with new token
  Meteor._ensure(user, 'services', 'email');
  if (!user.services.email.verificationTokens) {
    user.services.email.verificationTokens = [];
  }
  user.services.email.verificationTokens.push(tokenRecord);

  var verifyEmailUrl = Meteor.absoluteUrl('verify-email/' + tokenRecord.token);

  var options = {
    to: address,
    from: Accounts.emailTemplates.from,
    subject: Accounts.emailTemplates.verifyEmail.subject(user),
    text: Accounts.emailTemplates.verifyEmail.text(user, verifyEmailUrl)
  };

  if (typeof Accounts.emailTemplates.verifyEmail.html === 'function')
    options.html =
      Accounts.emailTemplates.verifyEmail.html(user, verifyEmailUrl);

  Email.send(options);
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
//      return Accounts.sendVerificationEmail(userId, attributes.email);
      return sendVerificationEmail(userId, attributes.email);
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

