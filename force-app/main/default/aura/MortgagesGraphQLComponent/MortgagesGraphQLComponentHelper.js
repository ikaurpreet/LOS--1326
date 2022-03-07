({
    callServerMethod: function(cmp, name, params, successHandler, errorHandler) {
        return this.createCallServerMethod(true)(cmp, name, params, successHandler, errorHandler);
    },

    callServerMethodWithoutLoading: function(cmp, name, params, successHandler, errorHandler) {
        return this.createCallServerMethod(false)(cmp, name, params, successHandler, errorHandler);
    },
    createCallServerMethod: function(withLoading) {
        return (cmp, name, params, successHandler, errorHandler) => {
            var promise = new Promise((resolve, reject) => {
                var action = cmp.get('c.' + name);
                if (withLoading) { 
                    cmp.set("v.loading", true);
                }
                if (params) {
                    action.setParams(params)
                }
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        if(successHandler) { successHandler(response.getReturnValue()); }
                        resolve(response.getReturnValue());
                    } else {
                        if(errorHandler) { errorHandler(response.getError()); }
                        reject(response.getError());
                    }
                    if (withLoading) {
                        cmp.set("v.loading", false);
                    }
                });
                $A.enqueueAction(action);
            });
            
            promise.catch((errors) => {
                var error = errors[0]
                switch(error.exceptionType) {
                    case 'MortgagesNamedCredentialsGraphQLClient.TokenExpiredException':
                        cmp.set('v.authErrorMessage', 'Your session is expired, please walk through sign-in process')
                        cmp.set('v.authId', error.message);
                        break;
                    case 'MortgagesNamedCredentialsGraphQLClient.NoTokenException':
                        cmp.set('v.authErrorMessage', 'Your session was not found, please create it by going through the sign-in process')
                        cmp.set('v.authId', error.message);
                        break;
                    case 'MortgagesNamedCredentialsGraphQLClient.NoExternalSourceException':
                        cmp.set('v.authErrorMessage', 'Your authentication settings was not found, please create it going through the sign-in process')
                        cmp.set('v.authId', error.message);
                        break;
                    case 'MortgagesNamedCredentialsGraphQLClient.NoNamedCredentialsException':
                        cmp.set('v.authErrorMessage', error.message);
                        break;
                    default:
                        cmp.set('v.error', error.message);
                }
            });
            return promise; 
        }
    },
    _openAuthPage: function(cmp) {
        var authUrl = cmp.get('v.authId'); 
        window.open('/' + authUrl + '/e', 'Enter Login Details', 'width=900,height=600');
        cmp.set('v.authId', null);
        cmp.set('v.authErrorMessage', 'Please, refresh page');
    }
})