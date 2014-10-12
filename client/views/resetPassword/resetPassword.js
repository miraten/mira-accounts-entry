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

      passwordErrors = (function(password, passwordConfirm) {
        var errMsg, msg;
        errMsg = [];
        msg = false;
        if (password === passwordConfirm) {
          if (password.length < 7) {
            errMsg.push(I18n.get("accounts.error.minChar"));
          }
          if (password.search(/[a-z]/i) < 0) {
            errMsg.push(I18n.get("accounts.error.pwOneLetter"));
          }
          if (password.search(/[0-9]/) < 0) {
            errMsg.push(I18n.get("accounts.error.pwOneDigit"));
          }
        } else {
          errMsg.push(I18n.get("accounts.error.passwordConfirmFail"));
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
      })(password, passwordConfirm);
      if (passwordErrors) {
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

