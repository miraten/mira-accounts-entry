AccountsEntry.hashPassword = function(password) {
  return {
    digest: SHA256(password),
    algorithm: "sha-256"
  };
};

AccountsEntry.entrySignUpHelpers = {
  showEmail: function() {
    var fields;
    fields = AccountsEntry.settings.passwordSignupFields;
    return _.contains(['USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL', 'EMAIL_ONLY'], fields);
  },
  showUsername: function() {
    var fields;
    fields = AccountsEntry.settings.passwordSignupFields;
    return _.contains(['USERNAME_AND_EMAIL', 'USERNAME_AND_OPTIONAL_EMAIL', 'USERNAME_ONLY'], fields);
  },
  showSignupCode: function() {
    return AccountsEntry.settings.showSignupCode;
  },
  logo: function() {
    return AccountsEntry.settings.logo;
  },
  privacyUrl: function() {
    return AccountsEntry.settings.privacyUrl;
  },
  termsUrl: function() {
    return AccountsEntry.settings.termsUrl;
  },
  both: function() {
    return AccountsEntry.settings.privacyUrl && AccountsEntry.settings.termsUrl;
  },
  neither: function() {
    return !AccountsEntry.settings.privacyUrl && !AccountsEntry.settings.termsUrl;
  },
  emailIsOptional: function() {
    var fields;
    fields = AccountsEntry.settings.passwordSignupFields;
    return _.contains(['USERNAME_AND_OPTIONAL_EMAIL'], fields);
  },
  emailAddress: function() {
    return Session.get('email');
  }
};

AccountsEntry.entrySignUpEvents = {
  'submit #signUp': function(event, t) {
    var email, emailRequired, extraFields, fields, filteredExtraFields, formValues, password, passwordErrors, signupCode, trimInput, username, usernameRequired;
    event.preventDefault();
    username = t.find('input[name="username"]') ? t.find('input[name="username"]').value.toLowerCase() : void 0;
    if (username && AccountsEntry.settings.usernameToLower) {
      username = username.toLowerCase();
    }
    signupCode = t.find('input[name="signupCode"]') ? t.find('input[name="signupCode"]').value : void 0;
    trimInput = function(val) {
      return val.replace(/^\s*|\s*$/g, "");
    };
    email = t.find('input[type="email"]') ? trimInput(t.find('input[type="email"]').value) : void 0;
    if (AccountsEntry.settings.emailToLower && email) {
      email = email.toLowerCase();
    }
    formValues = SimpleForm.processForm(event.target);
    extraFields = _.pluck(AccountsEntry.settings.extraSignUpFields, 'field');
    filteredExtraFields = _.pick(formValues, extraFields);
    password = t.find('input[type="password"]').value;
    fields = AccountsEntry.settings.passwordSignupFields;
    passwordErrors = (function(password) {
      var errMsg, msg;
      errMsg = [];
      msg = false;
      if (password.length < 7) {
        errMsg.push(I18n.get("accounts.error.minChar"));
      }
      if (password.search(/[a-z]/i) < 0) {
        errMsg.push(I18n.get("accounts.error.pwOneLetter"));
      }
      if (password.search(/[0-9]/) < 0) {
        errMsg.push(I18n.get("accounts.error.pwOneDigit"));
      }
      if (errMsg.length > 0) {
        msg = "";
        errMsg.forEach(function(e) {
          return msg = msg.concat("" + e + "\r\n");
        });
        Session.set('entryError', msg);
        return true;
      }
      return false;
    })(password);
    if (passwordErrors) {
      return;
    }
    emailRequired = _.contains(['USERNAME_AND_EMAIL', 'EMAIL_ONLY'], fields);
    usernameRequired = _.contains(['USERNAME_AND_EMAIL', 'USERNAME_ONLY'], fields);
    if (usernameRequired && username.length === 0) {
      Session.set('entryError', I18n.get("accounts.error.usernameRequired"));
      return;
    }
    if (username && AccountsEntry.isStringEmail(username)) {
      Session.set('entryError', I18n.get("accounts.error.usernameIsEmail"));
      return;
    }
    if (emailRequired && email.length === 0) {
      Session.set('entryError', I18n.get("accounts.error.emailRequired"));
      return;
    }
    if (AccountsEntry.settings.showSignupCode && signupCode.length === 0) {
      Session.set('entryError', I18n.get("accounts.error.signupCodeRequired"));
      return;
    }
    return Meteor.call('entryValidateSignupCode', signupCode, function(err, valid) {
      var newUserData;
      if (valid) {
        newUserData = {
          username: username,
          email: email,
          password: AccountsEntry.hashPassword(password),
          profile: filteredExtraFields
        };
        return Meteor.call('entryCreateUser', newUserData, function(err, data) {
          var isEmailSignUp, userCredential;
          if (err) {
            console.log(err);
            I18NHelper.accountsError(err);
            return;
          }
          if (AccountsEntry.settings.twoPhaseSignUp) {
            $.SmartMessageBox({
              title : I18n.get('accounts.title_signup_done'),
              content : I18n.get('accounts.message.signUpVerifyEmailAddress'),
              buttons : '[' + I18n.get('accounts.command_ok') + ']'
            }, function(ButtonPressed) {
              if (ButtonPressed) {
                Router.go(AccountsEntry.settings.homeRoute);
              }
            });
            return;
          } else {
            isEmailSignUp = _.contains(['USERNAME_AND_EMAIL', 'EMAIL_ONLY'], AccountsEntry.settings.passwordSignupFields);
            userCredential = isEmailSignUp ? email : username;
            return Meteor.loginWithPassword(userCredential, password, function(error) {
              if (error) {
                console.log(err);
                return I18NHelper.accountsError(error);
              //} else if (Session.get('fromWhere')) {
              //  Router.go(Session.get('fromWhere'));
              //  return Session.set('fromWhere', void 0);
              } else {
                if (AccountsEntry.settings.twoPhaseSignUp) {
                  $.SmartMessageBox({
                    title : I18n.get('accounts.title_signup_done'),
                    content : I18n.get('accounts.message.signUpVerifyEmailAddress'),
                    buttons : '[' + I18n.get('accounts.command_ok') + ']'
                  }, function(ButtonPressed) {
                    if (ButtonPressed) {
                      Router.go(AccountsEntry.settings.homeRoute);
                    }
                  });
                  return;
                } else {
                  $.SmartMessageBox({
                    title : I18n.get('accounts.title_signup_done'),
                    content : I18n.get('accounts.message.signUpInformVerifyEmailAddress'),
                    buttons : '[' + I18n.get('accounts.command_ok') + ']'
                  }, function(ButtonPressed) {
                    if (ButtonPressed) {
                      Router.go(AccountsEntry.settings.homeRoute);
                    }
                  });
                  //return Router.go(AccountsEntry.settings.dashboardRoute);
                }
              }
            });
          }
        });
      } else {
        console.log(err);
        Session.set('entryError', I18n.get("accounts.error.signupCodeIncorrect"));
      }
    });
  },

  'click #facebookBtn': function(e) {
    e.preventDefault();

  }
};

Template.entrySignUp.helpers(AccountsEntry.entrySignUpHelpers);

Template.entrySignUp.events(AccountsEntry.entrySignUpEvents);
