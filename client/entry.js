AccountsEntry = {
  settings: {
    wrapLinks: true,
    homeRoute: '/home',
    dashboardRoute: '/dashboard',
    passwordSignupFields: 'EMAIL_ONLY',
    emailToLower: true,
    usernameToLower: false,
    entrySignUp: '/sign-up',
    extraSignUpFields: [],
    showOtherLoginServices: true,
    layoutTemplate: 'layoutEntry'
  },

  isStringEmail: function(email) {
    var emailPattern;
    emailPattern = /^([\w.-]+)@([\w.-]+)\.([a-zA-Z.]{2,6})$/i;
    if (email.match(emailPattern)) {
      return true;
    } else {
      return false;
    }
  },

  config: function(appConfig) {
    var signUpRoute;
    this.settings = _.extend(this.settings, appConfig);

    if (appConfig.signUpTemplate) {
      signUpRoute = Router.routes['entrySignUp'];
      return signUpRoute.options.template = appConfig.signUpTemplate;
    }
  },
  signInRequired: function(router, pause, extraCondition) {
    if (extraCondition == null) {
      extraCondition = true;
    }
    if (!Meteor.loggingIn()) {
      if (!(Meteor.user() && extraCondition)) {
        Session.set('fromWhere', router.path);
        Router.go('/sign-in');
        Session.set('entryError', I18n.get('accounts.error.signInRequired'));
        return pause.call();
      }
    }
  }
};

this.AccountsEntry = AccountsEntry;

this.I18NHelper = (function() {
  function I18NHelper() {}

  I18NHelper.translate = function(code) {
    var result = I18n.get(code);
    return (result) ? result : code;
  };

  I18NHelper.accountsError = function(err) {
    return Session.set('entryError', this.translate(err.reason));
  };

  return I18NHelper;

})();

