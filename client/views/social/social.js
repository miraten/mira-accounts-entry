var capitalize;

Template.entrySocial.helpers({
  buttonText: function() {
    var buttonText;
    buttonText = Session.get('buttonText');
    if (buttonText === 'up') {
      return I18n.get('accounts.signUp');
    } else {
      return I18n.get('accounts.signIn');
    }
  },
  unconfigured: function() {
    return ServiceConfiguration.configurations.find({
      service: this.toString()
    }).fetch().length === 0;
  },
  google: function() {
    if (this[0] === 'g' && this[1] === 'o') {
      return true;
    }
  },
  icon: function() {
    switch (this.toString()) {
      case 'google':
        return 'google-plus';
      case 'meteor-developer':
        return 'rocket';
      default:
        return this;
    }
  }
});

Template.entrySocial.events({
  'click .btn': function(event) {
    var callback, loginWithService, options, serviceName;
    event.preventDefault();
    serviceName = $(event.target).attr('id').split('-')[1];
    callback = function(err) {
      if (!err) {
        if (Session.get('fromWhere')) {
          Router.go(Session.get('fromWhere'));
          return Session.set('fromWhere', void 0);
        } else {
          return Router.go(AccountsEntry.settings.dashboardRoute);
        }
      } else if (err instanceof Accounts.LoginCancelledError) {

      } else if (err instanceof ServiceConfiguration.ConfigError) {
        return Accounts._loginButtonsSession.configureService(serviceName);
      } else {
        return Accounts._loginButtonsSession.errorMessage(err.reason || I18n.get("accounts.error.unknown"));
      }
    };
    if (serviceName === 'meteor') {
      loginWithService = Meteor["loginWithMeteorDeveloperAccount"];
    } else {
      loginWithService = Meteor["loginWith" + capitalize(serviceName)];
    }
    options = {};
    if (Accounts.ui._options.requestPermissions[serviceName]) {
      options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
    }
    if (Accounts.ui._options.requestOfflineToken && Accounts.ui._options.requestOfflineToken[serviceName]) {
      options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
    }
    return loginWithService(options, callback);
  }
});

capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

