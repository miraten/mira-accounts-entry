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
  },
  termsOfUseLink: function() {
    return '<a href="#" data-toggle="modal" data-target="#modalTermsOfUse">' + I18n.get('accounts.label_terms_of_use') + '</a>'
  },
  privacyPolicyLink: function() {
    return '<a href="#" data-toggle="modal" data-target="#modalPrivacyPolicy">' + I18n.get('accounts.label_privacy_policy') + '</a>'
  }
};

AccountsEntry.checkUsername = function(element) {

  var attributes = {
    input: $(element).val()
  };

  var icon = $(element).next();

  console.log('begin spinner...');
  icon.attr('class', '');
  icon.addClass('fa fa-circle-o-notch fa-spin');

  Meteor.call('entryCheckUsername', attributes, function(error, result) {
    if (error) {
      throwError(error.reason);
    }

    icon.attr('class', '');
    if (result) {
      icon.addClass('fa fa-check');
    } else {
      icon.addClass('fa fa-times');
    }
  });

};

AccountsEntry.entrySignUpEvents = {
/*
  'input [name=username]': function(e, instance) {
    e.preventDefault();

    var element = e.currentTarget;

    instance.data.timer = LazyExec(function() {
      AccountsEntry.checkUsername(element);
    }, instance.data.timer);
  },
*/
  'submit #signUp': function(e, t) {
    e.preventDefault();

    var agreements =  $(e.target).find('[name=agreements]:checked').val();
    if (! agreements) {
      Session.set('entryError', I18n.get("accounts.error.agreements_required"));
      return;
    }

    var attributes = {
      username: $(e.target).find('[name=username]').val(),
      email: $(e.target).find('[name=email]').val(),
      password: $(e.target).find('[name=password]').val()
    };

    // validation
    var response = AccountsEntry.settings.validator.signUp(attributes);
    if (response.errors().length > 0) {
      $('input').parent().removeClass('status-error');

      _.each(response.errors(), function(error) {
        switch (error.attribute) {
          case 'username':
            var translated = "";
            _.each(error.messages, function(message) {
              translated += I18n.get(message);
            });
            var element = $(e.target).find('[name=username]').parent();
            element.addClass('state-error');
            element.next().html(translated);
            break;
          case 'email':
            var translated = "";
            _.each(error.messages, function(message) {
              translated += I18n.get(message);
            });
            var element = $(e.target).find('[name=email]').parent();
            element.addClass('state-error');
            element.next().html(translated);
            break;
          case 'password':
            var translated = "";
            _.each(error.messages, function(message) {
              translated += I18n.get(message);
            });
            var element = $(e.target).find('[name=password]').parent();
            element.addClass('state-error');
            element.next().html(translated);
            break;
          default:
        }
      });

      return;
    }

    // spin
    var spinner = new Spinner().spin();
    document.body.appendChild(spinner.el);

    Meteor.call('entryCreateUser', attributes, function(error, result) {
      if (error) {
        console.log('client error: ' + JSON.stringify(error));

        I18NHelper.accountsError(error);

        spinner.stop();
        return;
      }

      var isEmailSignUp, userCredential;

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
        spinner.stop();
        return;
      } else {
        isEmailSignUp = _.contains(['USERNAME_AND_EMAIL', 'EMAIL_ONLY'], AccountsEntry.settings.passwordSignupFields);
        userCredential = isEmailSignUp ? attributes.email : attributes.username;

        return Meteor.loginWithPassword(userCredential, attributes.password, function(error) {
          if (error) {
            console.log('client error: ' + JSON.stringify(error));
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
          spinner.stop();
        });
      }

    });
  },

  'click #facebookBtn': function(e) {
    e.preventDefault();

  }
};

Template.entrySignUp.helpers(AccountsEntry.entrySignUpHelpers);

Template.entrySignUp.events(AccountsEntry.entrySignUpEvents);
