  Template.entryForgotPassword.helpers({
    error: function() {
      return I18n.get(Session.get('accounts.entryError'));
    },
    logo: function() {
      return AccountsEntry.settings.logo;
    }
  });

  Template.entryForgotPassword.events({
    'submit #forgotPassword': function(event) {
      event.preventDefault();
      Session.set('email', $('input[name="forgottenEmail"]').val());
      if (Session.get('email').length === 0) {
        Session.set('entryError', I18n.get('accounts.error_email_required'));
        return;
      }
      
      // spin
      var spinner = new Spinner().spin();
      document.body.appendChild(spinner.el);
  
      return Accounts.forgotPassword({
        email: Session.get('email')
      }, function(error) {
        
        spinner.stop();
        
        if (error) {
          return Session.set('entryError', error.reason);
        } else {
          $.SmartMessageBox({
            title : I18n.get('accounts.title_mail_sent'),
            content : I18n.get('accounts.message.mailedResetPassword'),
            buttons : '[' + I18n.get('accounts.command_ok') + ']'
          }, function(ButtonPressed) {
            if (ButtonPressed) {
              Router.go(AccountsEntry.settings.homeRoute);
            }
          });
          return;
        }
      });
    }
  });

