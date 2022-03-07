({
    getSubmission : function(component) {
        var submissionUuid = component.get('v.submissionUuid');
        var env = component.get('v.env');
        
        var promise = this.callServerMethod(component, 'getPurchaseSubmission', { env: env, submissionUuid: submissionUuid });
        promise.then((response) => {
            var data = JSON.parse(response);
            if (data.borrower) {
                data.borrower.fullName = this.buildFullName(data.borrower); 
                if (data.borrower.housing) {
                    this.buildPurchaseHousing(data.borrower.housing);
                }
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
            if (data.preApprovalLetters != null) {
                this.buildPreApprovalLettersTree(component, data.preApprovalLetters);
            }
        }, (errors) => {});
    },
    buildRealEstate: function(data) {
        var realEstate = data.realEstate;
        var borrowerRealEstate = { properties: [] };
        var coBorrowerRealEstate = { properties: [] };
        realEstate.properties.forEach((item) => {
            var owners = item.owners.map((owner) => owner.uuid);
            var creditTrade = realEstate.creditTrades.find((trade) => trade.propertyUuid == item.uuid)
            if (creditTrade) {
                item.creditTrade = creditTrade
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
        if (data.borrower.housing) {
            var creditTrade = realEstate.creditTrades.find((trade) => trade.propertyUuid == data.borrower.housing.uuid)
    
            if (creditTrade) {
                data.borrower.housing.creditTrade = creditTrade
            }
        }
    },
    buildPurchaseHousing: function(housing) {
        var costs = housing.costs;
        if (costs && costs.length > 0) {
            var monthlyPayment = costs.find((item) => item.costType == 'monthlyPayment' )
            var rentPayment = costs.find((item) => item.costType == 'rentPayment' )
            if (monthlyPayment) {
                housing.monthlyPayment = monthlyPayment.amount;
            }
            if (rentPayment) {
                housing.rentPayment = rentPayment.amount;
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
    buildPreApprovalLettersTree: function(component, letters) {
        var columns = [
            {
                type: 'text',
                fieldName: 'expiration',
                label: 'Expiration',
                initialWidth: 300
            },
            {
                type: 'text',
                fieldName: 'zipCode',
                label: 'Zip Code'
            },
            {
                type: 'text',
                fieldName: 'loanAmount',
                label: 'Loan Amount'
            },
            {
                type: 'text',
                fieldName: 'apr',
                label: 'APR',
            },
            {
                type: 'text',
                fieldName: 'letterLink',
                label: 'Pre Approval Letter',
            }
        ];

        component.set('v.preApprovalLettersColumns', columns);

        const data = letters.map((item) => {
            const fromApr = item.rates.offers[0];
            const toApr = item.rates.offers[item.rates.offers.length - 1];
            let apr = 'loading';
            if (fromApr && toApr) {
                apr = `${fromApr.apr} - ${toApr.apr}`;
            }
            return {
                uuid: item.uuid,
                expiration: item.expiration,
                zipCode: item.zipCode,
                loanAmount: item.loanAmount,
                apr: apr,
                letterLink: 'view letter'
            }
        });
        
        component.set('v.preApprovalLettersData', data);
    },
    buildAnswersHash: function(answers) {
        if (!answers) return {};

        var answersHash = {};
        answers.forEach(answer => { answersHash[answer['answerType']] = answer['value'] });
        return answersHash;
    }
})