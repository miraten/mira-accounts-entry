var setCustomStyle = function() {
  $('html').attr('id', 'extr-page');
};

var resetCustomStyle = function() {
  $('html').attr('id', '');
}

Router.map(function() {
  this.route("entrySignIn", {
    path: "/sign-in",
    layoutTemplate: "layoutEntry",
    onBeforeAction: function() {
      setCustomStyle();

      $('body').addClass('animated');
      $('body').addClass('fadeInDown');

      Session.set('entryError', void 0);
      Session.set('buttonText', 'in');
      this.next();
      return Session.set('fromWhere', Router.current().path);
    },
    onStop: function() {
      resetCustomStyle();
    },

    onRun: function() {
      var pkgRendered, userRendered;
      if (Meteor.userId()) {
        Router.go(AccountsEntry.settings.dashboardRoute);
      }
      if (AccountsEntry.settings.signInTemplate) {
        this.template = AccountsEntry.settings.signInTemplate;
        pkgRendered = Template.entrySignIn.rendered;
        userRendered = Template[this.template].rendered;
        if (userRendered) {
          Template[this.template].rendered = function() {
            pkgRendered.call(this);
            return userRendered.call(this);
          };
        } else {
          Template[this.template].rendered = pkgRendered;
        }
        Template[this.template].events(AccountsEntry.entrySignInEvents);
        this.next();
        return Template[this.template].helpers(AccountsEntry.entrySignInHelpers);
      }
    }
  });

  this.route("entrySignUp", {
    path: "/sign-up",
    layoutTemplate: "layoutEntry",
    onBeforeAction: function() {
      setCustomStyle();
      Session.set('entryError', void 0);
      this.next();
      return Session.set('buttonText', 'up');
    },
    onStop: function() {
      resetCustomStyle();
    },
    onRun: function() {
      var pkgRendered, userRendered;
      if (AccountsEntry.settings.signUpTemplate) {
        this.template = AccountsEntry.settings.signUpTemplate;
        pkgRendered = Template.entrySignUp.rendered;
        userRendered = Template[this.template].rendered;
        if (userRendered) {
          Template[this.template].rendered = function() {
            pkgRendered.call(this);
            return userRendered.call(this);
          };
        } else {
          Template[this.template].rendered = pkgRendered;
        }
        Template[this.template].events(AccountsEntry.entrySignUpEvents);
        this.next();
        return Template[this.template].helpers(AccountsEntry.entrySignUpHelpers);
      }
    },
    data: function() {
      return {
        timer: {}
      };
    }
  });
  this.route("entryForgotPassword", {
    path: "/forgot-password",
    layoutTemplate: "layoutEntry",
    onBeforeAction: function() {
      setCustomStyle();
      $('body').addClass('animated');
      $('body').addClass('fadeInDown');
      this.next();
      return Session.set('entryError', void 0);
    },
    onStop: function() {
      resetCustomStyle();
    }
  });
  this.route('entrySignOut', {
    path: '/sign-out',
    onBeforeAction: function() {
      Session.set('entryError', void 0);
      if (AccountsEntry.settings.homeRoute) {
        if (Meteor.userId())
          Meteor.logout(function() {
            return Router.go(AccountsEntry.settings.homeRoute);
          });
        else
          Router.go(AccountsEntry.settings.homeRoute);
      }
      this.next();
    }
  });
  this.route('entryResetPassword', {
    path: 'reset-password/:resetToken',
    layoutTemplate: "layoutEntry",
    onBeforeAction: function() {
      setCustomStyle();

      Session.set('entryError', void 0);
      this.next();
      return Session.set('resetToken', this.params.resetToken);
    },
    onStop: function() {
      resetCustomStyle();
    }
  });
  return this.route('entryVerifyEmail', {
    path: 'verify-email/:verifyEmailToken',
    layoutTemplate: "layoutEntry",
    onBeforeAction: function() {
      setCustomStyle();

      Accounts.verifyEmail(this.params.verifyEmailToken, function(error) {
        if (error) {
          Session.set('entryError', error.reason);
        } else {
          console.log('Email verified');
          Accounts._enableAutoLogin();
        }
      });
      this.next();
    },
    onStop: function() {
      resetCustomStyle();
    }
  });
});

