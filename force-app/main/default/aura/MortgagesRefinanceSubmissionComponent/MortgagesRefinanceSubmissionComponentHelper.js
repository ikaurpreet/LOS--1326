({
    getSubmission : function(component) {
        var submissionUuid = component.get('v.submissionUuid');
        var env = component.get('v.env');

        var promise = this.callServerMethod(component, 'getRefinanceSubmission', { env: env, submissionUuid: submissionUuid });
        promise.then((response) => {
            var data = JSON.parse(response);
            if (data.borrower) {
                data.borrower.fullName = this.buildFullName(data.borrower);
                data.borrower.answersHash = this.buildAnswersHash(data.borrower.answers); 
            }
            if (data.coBorrower) {
                data.coBorrower.fullName = this.buildFullName(data.coBorrower);
                data.coBorrower.answersHash = this.buildAnswersHash(data.coBorrower.answers);
            }
            if (data.realEstate) {
                this.buildRealEstate(data);
            }
            component.set("v.submission", data);
        }, (errors) => {});
    },
    buildRealEstate: function(data) {
        var realEstate = data.realEstate;
        var borrowerRealEstate = { properties: [] };
        var coBorrowerRealEstate = { properties: [] };
        realEstate.properties.forEach((item) => {
            var owners = item.owners.map((owner) => owner.uuid);
            if (realEstate.creditTrades) {
                var creditTrade = realEstate.creditTrades.find((trade) => trade.propertyUuid == item.uuid)
                if (creditTrade) {
                    item.creditTrade = creditTrade
                }
            }

            var costs = item.costs;
            if (costs && costs.length > 0) {
                var monthlyPayment = costs.find((item) => item.costType == 'monthlyPayment' )
                var taxesInsuranceHoa = costs.find((item) => item.costType == 'taxesInsuranceHoa' )
                if (monthlyPayment) {
                    item.monthlyPayment = monthlyPayment.amount;
                }
                if (taxesInsuranceHoa) {
                    item.taxesInsuranceHoa = taxesInsuranceHoa.amount;
                }
            }

            if (owners.length == 0 || owners.indexOf(data.borrower.uuid) !== -1) {
                borrowerRealEstate.properties.push(item);
            }

            if (data.coBorrower && owners.indexOf(data.coBorrower.uuid) !== -1) {
                coBorrowerRealEstate.properties.push(item);
            }
        })
        if (borrowerRealEstate.properties !== 0) {
            data.borrower.realEstate = borrowerRealEstate;
        }

        if (data.coBorrower &&  coBorrowerRealEstate.properties.length !== 0) {
            data.coBorrower.realEstate = coBorrowerRealEstate;
        }

        if (realEstate.creditTrades) {
            var creditTrade = realEstate.creditTrades.find((trade) => trade.propertyUuid == data.refinanceProperty.uuid)
            
            if (creditTrade) {
                data.refinanceProperty.creditTrade = creditTrade
            }
        }
    },
    buildFullName: function(participant) {
        if (participant.profile.firstName && participant.profile.lastName) {
            return participant.profile.firstName + ' ' + participant.profile.lastName;
        } else if (participant.profile.userUuid) {
            return participant.profile.userUuid;
        } else {
            return 'Unknown name';
        }
    },
    buildAnswersHash: function(answers) {
        if (!answers) return {};

        var answersHash = {};
        answers.forEach(answer => { answersHash[answer['answerType']] = answer['value'] });
        return answersHash;
    }
})