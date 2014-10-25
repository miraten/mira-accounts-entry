  Template.entryResetPassword.helpers({
    error: function() {
      return Session.get('entryError');
    },
    logo: function() {
      return AccountsEntry.settings.logo;
    }
  });

  Template.entryResetPassword.events({
    'submit #resetPassword': function(event) {
      var password, passwordConfirm, passwordErrors;
      event.preventDefault();
      password = $('input[name="password"]').val();
      passwordConfirm = $('input[name="password-confirm"]').val();

      // validation
      if (! password) {
        Session.set('entryError', I18n.get('error_out_of_range'));
        return;
      }
      if (password && password !== passwordConfirm) {
        Session.set('entryError', I18n.get('accounts.error.password_confirm_fail'));
        return;
      }
      var response = AccountsEntry.settings.validator.resetPassword(password);
      if (response.errors().length > 0) {
        _.each(response.errors(), function(error) {
          var translated = "";
          _.each(error.messages, function(message) {
            translated += I18n.get(message);
          });
          Session.set('entryError', translated);
        });

        return;
      }

      return Accounts.resetPassword(Session.get('resetToken'), password, function(error) {
        if (error) {
          return Session.set('entryError', error.reason || "Unknown error");
        } else {
          Session.set('resetToken', null);
          return Router.go(AccountsEntry.settings.dashboardRoute);
        }
      });
    }
  });

