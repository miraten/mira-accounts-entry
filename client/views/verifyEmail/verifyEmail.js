Meteor.startup(function () {
  if (Accounts._verifyEmailToken) {
    Accounts.verifyEmail(Accounts._verifyEmailToken, function(error) {
      Accounts._enableAutoLogin();
      if (! error)
        console.log('email Verified.');
        //loginButtonsSession.set('justVerifiedEmail', true);
      // XXX show something if there was an error.
    });
  }
});

