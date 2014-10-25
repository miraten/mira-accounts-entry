AccountsEntry.entrySignInHelpers = {
  subjectType: function() {
    if (AccountsEntry.settings.passwordSignupFields === 'EMAIL_ONLY') {
      return 'email';
    } else {
      return 'string';
    }
  },
  subject: function() {
    var fields;
    fields = AccountsEntry.settings.passwordSignupFields;
    if (_.contains(['USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL'], fields)) {
      return I18n.get("accounts.usernameOrEmail");
    } else if (fields === "USERNAME_ONLY") {
      return I18n.get("accounts.username");
    }
    return I18n.get("accounts.email");
  },
  logo: function() {
    return AccountsEntry.settings.logo;
  },
  isUsernameOnly: function() {
    return AccountsEntry.settings.passwordSignupFields === 'USERNAME_ONLY';
  }
};

AccountsEntry.entrySignInEvents = {
  'submit #signIn': function(event) {
    var email;
    event.preventDefault();
    email = $('input[name="email"]').val();
    if ((AccountsEntry.isStringEmail(email) && AccountsEntry.settings.emailToLower) || (!AccountsEntry.isStringEmail(email) && AccountsEntry.settings.usernameToLower)) {
      email = email.toLowerCase();
    }
    Session.set('email', email);
    Session.set('password', $('input[name="password"]').val());

    // spin
    var spinner = new Spinner().spin();
    document.body.appendChild(spinner.el);

    return Meteor.loginWithPassword(Session.get('email'), Session.get('password'), function(error) {
      Session.set('password', void 0);

      spinner.stop();

      if (error) {
        return I18NHelper.accountsError(error);
/*      } else if (Session.get('fromWhere')) {
        Router.go(Session.get('fromWhere'));
        return Session.set('fromWhere', void 0);
*/      } else {
        return Router.go(AccountsEntry.settings.dashboardRoute);
      }
    });
  }
};

Template.entrySignIn.helpers(AccountsEntry.entrySignInHelpers);

Template.entrySignIn.events(AccountsEntry.entrySignInEvents);

