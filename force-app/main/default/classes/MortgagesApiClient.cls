global class MortgagesApiClient extends MortgagesApplicationClient {
    public MortgagesApiClient(MortgagesConstants.Env env) { super(env); }
    public MortgagesApiClient(MortgagesGraphQLClient client) { super(client); }
    public MortgagesApiClient(String graphqlUrl, String accessToken) { super(graphqlUrl, accessToken); }
    
    public String getRefinanceSubmission(String uuid) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'mortgagesSalesforceRefinanceSubmission';
        query.variables = new Map<String, Object> { 'submissionUuid' => uuid };
        query.body = 'query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {'
                      + 'mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {'
                        + 'id,'
                        + 'uuid,'
                        + 'createdAt,'
                        + 'cashOutAmount,'
                        + 'vertical,'
                        + 'debtPayoff {'
                          + 'monthlyStudentDebt,'
                          + 'monthlyOtherDebt,'
                        + '}'
                        + 'meta {'
                          + 'productsCreatedAt'
                        + '}'
                        + 'loanProcessor {'
                          + 'firstName,'
                          + 'lastName,'
                          + 'email,'
                          + 'nmls,'
                          + 'calendlyLink,'
                          + 'encompassUserId,'
                        + '}'
                        + 'loanOfficer {'
                          + 'firstName,'
                          + 'lastName,'
                          + 'email,'
                          + 'nmls,'
                          + 'calendlyLink,'
                          + 'encompassUserId,'
                        + '}'
                        + 'loanCoordinator {'
                          + 'firstName,'
                          + 'lastName,'
                          + 'email,'
                          + 'nmls,'
                          + 'calendlyLink,'
                          + 'encompassUserId,'
                        + '}'
                        + 'status,'
                        + 'previousNonArchivedStatus,'
                        // + 'tasks {'
                        //   + 'uuid,'
                        //   + 'participantRole,'
                        //   + 'items {'
                        //     + 'uuid,'
                        //     + 'status,'
                        //     + 'type,'
                        //     // + 'eSignDocument {'
                        //     //   + 'uuid,'
                        //     //   + 'signers {'
                        //     //     + 'uuid,'
                        //     //     + 'name,'
                        //     //     + 'status,'
                        //     //     + 'email,'
                        //     //     + 'role'
                        //     //   + '}'
                        //     // + '}'
                        //   + '}'
                        //   + 'taskGroup,'
                        //   + 'status,'
                        //   + 'title,'
                        //   + 'description,'
                        //   + 'requireUserAction,'
                        //   + 'lastStatusUpdate'
                        // + '}'
                        + 'selectedProduct {'
                          + 'id,'
                          + 'uuid,'
                          + 'externalProductId,'
                          + 'apr,'
                          + 'rate,'
                          + 'loanType,'
                          + 'amortizationType,'
                          + 'lockPeriod,'
                          + 'monthlyPayment,'
                          + 'principalInterest,'
                          + 'loanTerm,'
                          + 'armFixedTerm,'
                          + 'armSubsequentChangePeriod,'
                          + 'minRequiredAssets,'
                          + 'loanProductInfo {'
                            + 'id,'
                            + 'name,'
                            + 'lender {'
                              + 'name,'
                              + 'nmls,'
                              + 'slug,'
                            + '}'
                          + '}'
                          + 'underwritingFee,'
                          + 'otherLenderFee,'
                          + 'appraisalFee,'
                          + 'titleSettlementRecordingFee,'
                          + 'points,'
                          + 'closingCost,'
                          + 'totalCost,'
                          + 'totalLoanAmount,'
                          + 'bestProduct,'
                          + 'pmiMonthlyPayment,'
                          + 'rateLocked'
                        + '}'
                        + 'refinanceProperty {'
                          + 'uuid,'
                          + 'estimatedValue,'
                          + 'canaryEstimatedValue,'
                          + 'eligibilityValue,'
                          + 'loanBalance,'
                          + 'monthlyPayment,'
                          + 'monthlyTaxes,'
                          + 'monthlyInsuranceFee,'
                          + 'monthlyHomeownersFee,'
                          + 'propertyType,'
                          + 'numberOfUnits,'
                          + 'occupancyType,'
                          + 'address {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                        + '}'
                        + 'borrower {'
                          + 'uuid,'
                          + 'ssn,'
                          + 'profile {'
                            + 'email,'
                            + 'userUuid,'
                            + 'firstName,'
                            + 'lastName,'
                            + 'suffixType,'
                            + 'middleNameInitial,'
                            + 'dependentsAges,'
                            + 'phone,'  
                            + 'citizenship,'
                            + 'maritalType,'
                            + 'degreeType,'
                            + 'dob,'
                            + 'hasRelationship,'
                            + 'relationshipType,'
                            + 'relationshipDetails,'
                            + 'relationshipState'
                          + '}'
                          + 'housing {'
                            + 'status,'
                            + 'monthlyPayment,'
                            + 'taxes,'
                            + 'fees'
                          + '}'
                          + 'declaration {'
                            + 'outstandingJudgements,'
                            + 'outstandingJudgementsText,'
                            + 'declaredBankruptcy,'
                            + 'declaredBankruptcyText,'
                            + 'propertyForeclosure,'
                            + 'propertyForeclosureText,'
                            + 'partyToLawsuit,'
                            + 'partyToLawsuitText,'
                            + 'foreclosureTitleTransferInvolvement,'
                            + 'foreclosureTitleTransferInvolvementText,'
                            + 'delinquentLoans,'
                            + 'delinquentLoansText,'
                            + 'alimonyChildSupport,'
                            + 'alimonyChildSupportText,'
                            + 'comakerEndorser,'
                            + 'comakerEndorserText,'
                            + 'permanentResidence,'
                            + 'ownershipInterest,'
                            + 'ownershipType,'
                            + 'occupancyType,'
                            + 'bankruptcyChapters {'
                              + 'declaredBankruptcyPast7YearsChapter7,'
                              + 'declaredBankruptcyPast7YearsChapter11,'
                              + 'declaredBankruptcyPast7YearsChapter12,'
                              + 'declaredBankruptcyPast7YearsChapter13'
                            + '}'
                            + 'conveyedPropertyInLieuForeclosure,'
                            + 'partyToLawsuitPersonalLiability,'
                            + 'propertyForeclosedUpon7Years,'
                            + 'delinquentLoansFederalDebt,'
                            + 'cosignerOrGuarantor,'
                            + 'borrowMoneyFromAnotherParty,'
                            + 'borrowMoneyFromAnotherPartyAmount,'
                            + 'mortgageLoanOnAnotherProperty,'
                            + 'applyNewCredit,'
                            + 'priorityOverFirstMortgageLien,'
                            + 'preForeclosureSale'
                          + '}'
                          + 'answers {'
                            + 'value,'
                            + 'answerType'
                          + '}'
                          + 'address {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                          + 'mailingAddress {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                          + 'incomes {'
                            + 'amount,'
                            + 'incomeType,'
                            + 'paymentTermType'
                          + '}'
                          + 'assets{'
                            + 'amount,'
                            + 'assetType'
                          + '}'
                          + 'employments {'
                            + 'uuid,'
                            + 'position,'
                            + 'address {'
                               + 'addressLine1,'
                               + 'addressLine2,'
                               + 'unit,'
                               + 'city,'
                               + 'stateCode,'
                               + 'zipCode,'
                               + 'manually,'
                               + 'county {'
                                 + 'fipsCountyCode,'
                                 + 'name'
                               + '}'
                            + '}'
                            + 'businessPhone,'
                            + 'startedOn,'
                            + 'workExperience,'
                            + 'employerName,'
                            + 'employerType,'
                            + 'endDate,'
                            + 'frequentlyPaidType,'
                            + 'annualIncome,'
                            + 'isEmployerPartyToTransaction,'
                            + 'hasOwnershipShare,'
                            + 'ownershipShare,'
                            + 'monthlyShareIncome'
                          + '}'
                          + 'fairHousingAnswer {'
                            + 'raceAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'ethnicityAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'sexAnswerType {'
                              + 'name,'
                              + 'value'
                            + '}'
                          + '}'
                          + 'previousAddresses {'
                            + 'address {'
                              + 'id,'
                              + 'addressLine1,'
                              + 'addressLine2,'
                              + 'unit,'
                              + 'city,'
                              + 'stateCode,'
                              + 'zipCode,'
                              + 'manually,'
                              + 'county {'
                                + 'fipsCountyCode,'
                                + 'name'
                              + '}'
                            + '}'
                            + 'participantAddress {'
                              + 'uuid,'
                              + 'isPrevious,'
                              + 'startDate,'
                              + 'housingStatusType'
                            + '}'
                          + '}'
                          + 'provedAssets {'
                            + 'amount,'
                            + 'institutionName,'
                            + 'assetType'
                          + '}'
                          + 'militaryService {'
                            + 'isServed,'
                            + 'isCurrentlyServing,'
                            + 'expirationDate,'
                            + 'isRetired,'
                            + 'isReserve,'
                            + 'isSurvivingSpouse'
                          + '}'
                        + '}'
                        + 'coBorrower {'
                          + 'uuid,'
                          + 'ssn,'
                          + 'profile {'
                            + 'email,'
                            + 'userUuid,'
                            + 'firstName,'
                            + 'lastName,'
                            + 'suffixType,'
                            + 'middleNameInitial,'
                            + 'dependentsAges,'
                            + 'phone,'
                            + 'citizenship,'
                            + 'maritalType,'
                            + 'degreeType,'
                            + 'dob,'
                            + 'hasRelationship,'
                            + 'relationshipType,'
                            + 'relationshipDetails,'
                            + 'relationshipState'
                          + '}'
                          + 'declaration {'
                            + 'outstandingJudgements,'
                            + 'outstandingJudgementsText,'
                            + 'declaredBankruptcy,'
                            + 'declaredBankruptcyText,'
                            + 'propertyForeclosure,'
                            + 'propertyForeclosureText,'
                            + 'partyToLawsuit,'
                            + 'partyToLawsuitText,'
                            + 'foreclosureTitleTransferInvolvement,'
                            + 'foreclosureTitleTransferInvolvementText,'
                            + 'delinquentLoans,'
                            + 'delinquentLoansText,'
                            + 'alimonyChildSupport,'
                            + 'alimonyChildSupportText,'
                            + 'comakerEndorser,'
                            + 'comakerEndorserText,'
                            + 'permanentResidence,'
                            + 'ownershipInterest,'
                            + 'ownershipType,'
                            + 'occupancyType,'
                            + 'bankruptcyChapters {'
                              + 'declaredBankruptcyPast7YearsChapter7,'
                              + 'declaredBankruptcyPast7YearsChapter11,'
                              + 'declaredBankruptcyPast7YearsChapter12,'
                              + 'declaredBankruptcyPast7YearsChapter13'
                            + '}'
                            + 'conveyedPropertyInLieuForeclosure,'
                            + 'partyToLawsuitPersonalLiability,'
                            + 'propertyForeclosedUpon7Years,'
                            + 'delinquentLoansFederalDebt,'
                            + 'cosignerOrGuarantor,'
                            + 'borrowMoneyFromAnotherParty,'
                            + 'borrowMoneyFromAnotherPartyAmount,'
                            + 'mortgageLoanOnAnotherProperty,'
                            + 'applyNewCredit,'
                            + 'priorityOverFirstMortgageLien,'
                            + 'preForeclosureSale'
                          + '}'
                          + 'answers {'
                            + 'value,'
                            + 'answerType'
                          + '}'
                          + 'address {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                          + 'mailingAddress {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                              + '}'
                            + '}'
                          + 'incomes {'
                            + 'amount,'
                            + 'incomeType,'
                            + 'paymentTermType'
                          + '}'
                          + 'assets{'
                            + 'amount,'
                            + 'assetType'
                          + '}'
                          + 'employments {'
                            + 'uuid,'
                            + 'position,'
                            + 'address {'
                               + 'addressLine1,'
                               + 'addressLine2,'
                               + 'unit,'
                               + 'city,'
                               + 'stateCode,'
                               + 'zipCode,'
                               + 'manually,'
                               + 'county {'
                                 + 'fipsCountyCode,'
                                 + 'name'
                               + '}'
                            + '}'
                            + 'businessPhone,'
                            + 'startedOn,'
                            + 'workExperience,'
                            + 'employerName,'
                            + 'employerType,'
                            + 'endDate,'
                            + 'frequentlyPaidType,'
                            + 'annualIncome,'
                            + 'isEmployerPartyToTransaction,'
                            + 'hasOwnershipShare,'
                            + 'ownershipShare,'
                            + 'monthlyShareIncome'
                          + '}'
                          + 'fairHousingAnswer {'
                            + 'raceAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'ethnicityAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'sexAnswerType {'
                              + 'name,'
                              + 'value'
                            + '}'
                          + '}'
                          + 'previousAddresses {'
                            + 'address {'
                              + 'id,'
                              + 'addressLine1,'
                              + 'addressLine2,'
                              + 'unit,'
                              + 'city,'
                              + 'stateCode,'
                              + 'zipCode,'
                              + 'manually,'
                              + 'county {'
                                + 'fipsCountyCode,'
                                + 'name'
                              + '}'
                            + '}'
                            + 'participantAddress {'
                              + 'uuid,'
                              + 'isPrevious,'
                              + 'startDate,'
                              + 'housingStatusType'
                            + '}'
                          + '}'
                          + 'provedAssets {'
                            + 'amount,'
                            + 'institutionName,'
                            + 'assetType'
                          + '}'
                          + 'militaryService {'
                            + 'isServed,'
                            + 'isCurrentlyServing,'
                            + 'expirationDate,'
                            + 'isRetired,'
                            + 'isReserve,'
                            + 'isSurvivingSpouse'
                          + '}'
                        + '}'
                        + 'realEstate {'
                          + 'properties {'
                            + 'uuid,'
                            + 'occupancyType,'
                            + 'address {'
                              + 'addressLine1,'
                              + 'addressLine2,'
                              + 'unit,'
                              + 'city,'
                              + 'stateCode,'
                              + 'zipCode,'
                              + 'county {'
                                + 'fipsCountyCode,'
                                + 'name'
                              + '}'
                            + '}'
                            + 'numberOfUnits,'
                            + 'propertyType,'
                            + 'costs {'
                              + 'amount,'
                              + 'costType'
                            + '}'
                            + 'owners {'
                              + 'uuid'
                            + '}'
                        + '}'
                        + 'creditTrades {'
                            + 'uuid,'
                            + 'propertyUuid,'
                            + 'name,'
                            + 'additionalInfo,'
                            + 'monthlyPayment,'
                            + 'loanBalance,'
                            + 'notRecognize,'
                            + 'originationDate'
                         + '}'
                       + '}'
                     + '}'
                   + '}';
        MortgagesGraphQLClient.Results results = client.query(query);        
        processErrors(results);   
        
        return (String)results.data;
    }

    public String getRefinanceProducts(String eligibilityUuid, 
                                      Integer limitRecords, 
                                      Integer offsetRecords, 
                                      Boolean onlyBest, 
                                      Set<String> lenders, 
                                      String loanType,
                                      String monthlyPayment,
                                      String apr,
                                      String rate,
                                      String order) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceRefinanceProducts';
      query.variables = new Map<String, Object> { 'eligibilityUuid' => eligibilityUuid, 
                                                  'limit' => limitRecords, 
                                                  'offset' => offsetRecords, 
                                                  'onlyBest' => onlyBest, 
                                                  'lenders' => lenders, 
                                                  'loanType' => loanType,
                                                  'monthlyPayment' => monthlyPayment,
                                                  'apr' => apr,
                                                  'rate' => rate,
                                                  'order' => order
                                                };
      query.body = 'query mortgagesSalesforceRefinanceProducts($eligibilityUuid: String!, $lenders: [String], $loanType: String, $onlyBest: Boolean, $monthlyPayment: String, $rate: String, $apr: String, $order: String, $limit: Int, $offset: Int) { mortgagesSalesforceRefinanceProducts(eligibilityUuid: $eligibilityUuid, lenders: $lenders, loanType: $loanType, onlyBest: $onlyBest, monthlyPayment: $monthlyPayment, rate: $rate, apr: $apr, order: $order, limit: $limit, offset: $offset) {totalCount, items {id, uuid, externalProductId, apr, rate, loanType, amortizationType, lockPeriod, monthlyPayment, principalInterest, loanTerm, armFixedTerm, armSubsequentChangePeriod, minRequiredAssets, loanProductInfo {id, name, lender {name, nmls, slug,}} underwritingFee, otherLenderFee, appraisalFee, titleSettlementRecordingFee, points, closingCost, totalCost, totalLoanAmount, bestProduct, pmiMonthlyPayment,}  } }';
      
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results); 

      return (String)results.data;
    }

    public String getPurchaseProducts(String eligibilityUuid, 
                                      Integer limitRecords, 
                                      Integer offsetRecords, 
                                      Boolean onlyBest, 
                                      Set<String> lenders, 
                                      String loanType,
                                      String monthlyPayment,
                                      String apr,
                                      String rate,
                                      String order) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforcePurchaseProducts';
      query.variables = new Map<String, Object> { 'eligibilityUuid' => eligibilityUuid, 
                                                  'limit' => limitRecords, 
                                                  'offset' => offsetRecords, 
                                                  'onlyBest' => onlyBest, 
                                                  'lenders' => lenders, 
                                                  'loanType' => loanType,
                                                  'monthlyPayment' => monthlyPayment,
                                                  'apr' => apr,
                                                  'rate' => rate,
                                                  'order' => order
                                                };
      query.body = 'query mortgagesSalesforcePurchaseProducts($eligibilityUuid: String!, $lenders: [String], $loanType: String, $onlyBest: Boolean, $monthlyPayment: String, $rate: String, $apr: String, $order: String, $limit: Int, $offset: Int) { mortgagesSalesforcePurchaseProducts(eligibilityUuid: $eligibilityUuid, lenders: $lenders, loanType: $loanType, onlyBest: $onlyBest, monthlyPayment: $monthlyPayment, rate: $rate, apr: $apr, order: $order, limit: $limit, offset: $offset) {totalCount, items {id, uuid, externalProductId, apr, rate, loanType, amortizationType, lockPeriod, monthlyPayment, principalInterest, loanTerm, armFixedTerm, armSubsequentChangePeriod, minRequiredAssets, loanProductInfo {id, name, lender {name, nmls, slug,}} underwritingFee, otherLenderFee, appraisalFee, titleSettlementRecordingFee, points, closingCost, totalCost, totalLoanAmount, bestProduct, pmiMonthlyPayment, splitFees {transferTaxes {buyer, seller,} ownersTitle {buyer, seller,} other {buyer, seller,}} totalUpfront,}  } }';
      
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results); 

      return (String)results.data;
    }

    public String getPurchaseSubmission(String uuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'mortgagesSalesforcePurchaseSubmission';
        query.variables = new Map<String, Object> { 'submissionUuid' => uuid };
        query.body = 'query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {'
                      + 'mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {'
                        + 'id,'
                        + 'uuid,'
                        + 'createdAt,'
                        + 'cashOutAmount,'
                        + 'vertical,'
                        + 'meta {'
                          + 'productsCreatedAt,'
                          + 'isNoContract'
                        + '}'
                        + 'status,'
                        + 'previousNonArchivedStatus,'
                        // + 'tasks {'
                        //   + 'uuid,'
                        //   + 'participantRole,'
                        //   + 'items {'
                        //     + 'uuid,'
                        //     + 'status,'
                        //     + 'type,'
                        //     // + 'eSignDocument {'
                        //     //   + 'uuid,'
                        //     //   + 'signers {'
                        //     //     + 'uuid,'
                        //     //     + 'name,'
                        //     //     + 'status,'
                        //     //     + 'email,'
                        //     //     + 'role'
                        //     //   + '}'
                        //     // + '}'
                        //   + '}'
                        //   + 'taskGroup,'
                        //   + 'status,'
                        //   + 'title,'
                        //   + 'description,'
                        //   + 'requireUserAction,'
                        //   + 'lastStatusUpdate'
                        // + '}'
                        + 'selectedProduct {'
                          + 'id,'
                          + 'uuid,'
                          + 'externalProductId,'
                          + 'apr,'
                          + 'rate,'
                          + 'loanType,'
                          + 'amortizationType,'
                          + 'lockPeriod,'
                          + 'monthlyPayment,'
                          + 'principalInterest,'
                          + 'loanTerm,'
                          + 'armFixedTerm,'
                          + 'armSubsequentChangePeriod,'
                          + 'minRequiredAssets,'
                          + 'loanProductInfo {'
                            + 'id,'
                            + 'name,'
                            + 'lender {'
                              + 'name,'
                              + 'nmls,'
                              + 'slug,'
                            + '}'
                          + '}'
                          + 'underwritingFee,'
                          + 'otherLenderFee,'
                          + 'appraisalFee,'
                          + 'titleSettlementRecordingFee,'
                          + 'points,'
                          + 'closingCost,'
                          + 'totalCost,'
                          + 'totalLoanAmount,'
                          + 'bestProduct,'
                          + 'pmiMonthlyPayment,'
                          + 'splitFees {'
                            + 'transferTaxes {'
                              + 'buyer,'
                              + 'seller,'
                            + '}'
                            + 'ownersTitle {'
                              + 'buyer,'
                              + 'seller,'
                            + '}'
                            + 'other {'
                              + 'buyer,'
                              + 'seller,'
                            + '}'
                          + '}'
                          + 'rateLocked'
                        + '}'
                        + 'preApprovalLetters {'
                          + 'uuid,'
                          + 'downPayment,'
                          + 'loanAmount,'
                          + 'loanType,'
                          + 'productType,'
                          + 'zipCode,'
                          + 'documentUuid,'
                          + 'expiration,'
                          + 'createdAt,'
                          + 'rates {'
                            + 'expired,'
                            + 'offers {'
                              + 'term,'
                              + 'interestRate,'
                              + 'apr,'
                              + 'estimatedClosingCost,'
                              + 'points,'
                              + 'slug,'
                            + '}'
                            + 'status,'
                            + 'createdAt,'
                          + '}'
                          + 'aggregatedMonthlyPayment,'
                          + 'taxesPayment,'
                          + 'principalAndInterestPayment,'
                          + 'privateMortgagesInsurancePayment,'
                          + 'insurancePayment,'
                          + 'hoaPayment,'
                          + 'maxLoanAmount,'
                          + 'purchasePrice,'
                          + 'percentDownPayment,'
                        + '}'
                        + 'purchaseProperty {'
                          + 'uuid,'
                          + 'estimatedValue,'
                          + 'estimatedClosingDate,'
                          + 'downPayment,'
                          + 'downPaymentSource,'
                          + 'downPaymentFromAssets,'
                          + 'propertyType,'
                          + 'numberOfUnits,'
                          + 'homeownersFee,'
                          + 'occupancyType,'
                          + 'address {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                              + 'fipsCountyCode,'
                              + 'name,'
                            + '}'
                          + '}'
                          + 'realEstateAgent {'
                            + 'firstName,'
                            + 'lastName,'
                            + 'email,'
                            + 'phoneNumber,'
                          + '}'
                          + 'contractAcceptedDate,'
                          + 'ltv,'
                          + 'monthlyTaxes,'
                          + 'monthlyInsurance,'
                          + 'prepaidsCost,'
                          + 'escrowsCost,'
                        + '}'
                        + 'borrower {'
                          + 'uuid,'
                          + 'ssn,'
                          + 'profile {'
                            + 'email,'
                            + 'userUuid,'
                            + 'firstName,'
                            + 'lastName,'
                            + 'suffixType,'
                            + 'middleNameInitial,'
                            + 'dependentsAges,'
                            + 'phone,'
                            + 'citizenship,'
                            + 'maritalType,'
                            + 'degreeType,'
                            + 'dob,'
                            + 'hasRelationship,'
                            + 'relationshipType,'
                            + 'relationshipDetails,'
                            + 'relationshipState'
                          + '}'
                          + 'housing {'
                            + 'uuid,'
                            + 'housingStatusType,'
                            + 'futureOccupancyType,'
                            + 'costs {'
                              + 'amount,'
                              + 'costType'
                            + '}'
                          + '}'
                          + 'declaration {'
                            + 'outstandingJudgements,'
                            + 'outstandingJudgementsText,'
                            + 'declaredBankruptcy,'
                            + 'declaredBankruptcyText,'
                            + 'propertyForeclosure,'
                            + 'propertyForeclosureText,'
                            + 'partyToLawsuit,'
                            + 'partyToLawsuitText,'
                            + 'foreclosureTitleTransferInvolvement,'
                            + 'foreclosureTitleTransferInvolvementText,'
                            + 'delinquentLoans,'
                            + 'delinquentLoansText,'
                            + 'alimonyChildSupport,'
                            + 'alimonyChildSupportText,'
                            + 'comakerEndorser,'
                            + 'comakerEndorserText,'
                            + 'permanentResidence,'
                            + 'ownershipInterest,'
                            + 'ownershipType,'
                            + 'occupancyType,'
                            + 'bankruptcyChapters {'
                              + 'declaredBankruptcyPast7YearsChapter7,'
                              + 'declaredBankruptcyPast7YearsChapter11,'
                              + 'declaredBankruptcyPast7YearsChapter12,'
                              + 'declaredBankruptcyPast7YearsChapter13'
                            + '}'
                            + 'conveyedPropertyInLieuForeclosure,'
                            + 'partyToLawsuitPersonalLiability,'
                            + 'propertyForeclosedUpon7Years,'
                            + 'delinquentLoansFederalDebt,'
                            + 'cosignerOrGuarantor,'
                            + 'borrowMoneyFromAnotherParty,'
                            + 'borrowMoneyFromAnotherPartyAmount,'
                            + 'mortgageLoanOnAnotherProperty,'
                            + 'applyNewCredit,'
                            + 'priorityOverFirstMortgageLien,'
                            + 'preForeclosureSale,'
                            + 'relationshipWithSeller'
                          + '}'
                          + 'answers {'
                            + 'value,'
                            + 'answerType'
                          + '}'
                          + 'address {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                          + 'mailingAddress {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                          + 'incomes {'
                            + 'amount,'
                            + 'incomeType,'
                            + 'paymentTermType'
                          + '}'
                          + 'assets{'
                            + 'amount,'
                            + 'assetType'
                          + '}'
                          + 'employments {'
                            + 'uuid,'
                            + 'position,'
                            + 'address {'
                               + 'addressLine1,'
                               + 'addressLine2,'
                               + 'unit,'
                               + 'city,'
                               + 'stateCode,'
                               + 'zipCode,'
                               + 'manually,'
                               + 'county {'
                                 + 'fipsCountyCode,'
                                 + 'name'
                               + '}'
                            + '}'
                            + 'businessPhone,'
                            + 'startedOn,'
                            + 'workExperience,'
                            + 'employerName,'
                            + 'employerType,'
                            + 'endDate,'
                            + 'frequentlyPaidType,'
                            + 'annualIncome,'
                            + 'isEmployerPartyToTransaction,'
                            + 'hasOwnershipShare,'
                            + 'ownershipShare,'
                            + 'monthlyShareIncome'
                          + '}'
                          + 'fairHousingAnswer {'
                            + 'raceAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'ethnicityAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'sexAnswerType {'
                              + 'name,'
                              + 'value'
                            + '}'
                          + '}'
                          + 'previousAddresses {'
                            + 'address {'
                              + 'id,'
                              + 'addressLine1,'
                              + 'addressLine2,'
                              + 'unit,'
                              + 'city,'
                              + 'stateCode,'
                              + 'zipCode,'
                              + 'manually,'
                              + 'county {'
                                + 'fipsCountyCode,'
                                + 'name'
                              + '}'
                            + '}'
                            + 'participantAddress {'
                              + 'uuid,'
                              + 'isPrevious,'
                              + 'startDate,'
                              + 'housingStatusType'
                            + '}'
                          + '}'
                          + 'provedAssets {'
                            + 'amount,'
                            + 'institutionName,'
                            + 'assetType'
                          + '}'
                          + 'militaryService {'
                            + 'isServed,'
                            + 'isCurrentlyServing,'
                            + 'expirationDate,'
                            + 'isRetired,'
                            + 'isReserve,'
                            + 'isSurvivingSpouse'
                          + '}'
                        + '}'
                        + 'coBorrower {'
                          + 'uuid,'
                          + 'ssn,'
                          + 'profile {'
                            + 'email,'
                            + 'userUuid,'
                            + 'firstName,'
                            + 'lastName,'
                            + 'suffixType,'
                            + 'middleNameInitial,'
                            + 'dependentsAges,'
                            + 'phone,'
                            + 'citizenship,'
                            + 'maritalType,'
                            + 'degreeType,'
                            + 'dob,'
                            + 'hasRelationship,'
                            + 'relationshipType,'
                            + 'relationshipDetails,'
                            + 'relationshipState'
                          + '}'
                          + 'declaration {'
                            + 'outstandingJudgements,'
                            + 'outstandingJudgementsText,'
                            + 'declaredBankruptcy,'
                            + 'declaredBankruptcyText,'
                            + 'propertyForeclosure,'
                            + 'propertyForeclosureText,'
                            + 'partyToLawsuit,'
                            + 'partyToLawsuitText,'
                            + 'foreclosureTitleTransferInvolvement,'
                            + 'foreclosureTitleTransferInvolvementText,'
                            + 'delinquentLoans,'
                            + 'delinquentLoansText,'
                            + 'alimonyChildSupport,'
                            + 'alimonyChildSupportText,'
                            + 'comakerEndorser,'
                            + 'comakerEndorserText,'
                            + 'permanentResidence,'
                            + 'ownershipInterest,'
                            + 'ownershipType,'
                            + 'occupancyType,'
                            + 'bankruptcyChapters {'
                              + 'declaredBankruptcyPast7YearsChapter7,'
                              + 'declaredBankruptcyPast7YearsChapter11,'
                              + 'declaredBankruptcyPast7YearsChapter12,'
                              + 'declaredBankruptcyPast7YearsChapter13'
                            + '}'
                            + 'conveyedPropertyInLieuForeclosure,'
                            + 'partyToLawsuitPersonalLiability,'
                            + 'propertyForeclosedUpon7Years,'
                            + 'delinquentLoansFederalDebt,'
                            + 'cosignerOrGuarantor,'
                            + 'borrowMoneyFromAnotherParty,'
                            + 'borrowMoneyFromAnotherPartyAmount,'
                            + 'mortgageLoanOnAnotherProperty,'
                            + 'applyNewCredit,'
                            + 'priorityOverFirstMortgageLien,'
                            + 'preForeclosureSale,'
                            + 'relationshipWithSeller'
                          + '}'
                          + 'answers {'
                            + 'value,'
                            + 'answerType'
                          + '}'
                          + 'address {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                            + '}'
                          + '}'
                          + 'mailingAddress {'
                            + 'id,'
                            + 'addressLine1,'
                            + 'addressLine2,'
                            + 'unit,'
                            + 'city,'
                            + 'stateCode,'
                            + 'zipCode,'
                            + 'manually,'
                            + 'county {'
                               + 'fipsCountyCode,'
                               + 'name'
                              + '}'
                            + '}'
                          + 'incomes {'
                            + 'amount,'
                            + 'incomeType,'
                            + 'paymentTermType'
                          + '}'
                          + 'assets{'
                            + 'amount,'
                            + 'assetType'
                          + '}'
                          + 'employments {'
                            + 'uuid,'
                            + 'position,'
                            + 'address {'
                               + 'addressLine1,'
                               + 'addressLine2,'
                               + 'unit,'
                               + 'city,'
                               + 'stateCode,'
                               + 'zipCode,'
                               + 'manually,'
                               + 'county {'
                                 + 'fipsCountyCode,'
                                 + 'name'
                               + '}'
                            + '}'
                            + 'businessPhone,'
                            + 'startedOn,'
                            + 'workExperience,'
                            + 'employerName,'
                            + 'employerType,'
                            + 'endDate,'
                            + 'frequentlyPaidType,'
                            + 'annualIncome,'
                            + 'isEmployerPartyToTransaction,'
                            + 'hasOwnershipShare,'
                            + 'ownershipShare,'
                            + 'monthlyShareIncome'
                          + '}'
                          + 'fairHousingAnswer {'
                            + 'raceAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'ethnicityAnswer {'
                              + 'name,'
                              + 'value'
                            + '}'
                            + 'sexAnswerType {'
                              + 'name,'
                              + 'value'
                            + '}'
                          + '}'
                          + 'previousAddresses {'
                            + 'address {'
                              + 'id,'
                              + 'addressLine1,'
                              + 'addressLine2,'
                              + 'unit,'
                              + 'city,'
                              + 'stateCode,'
                              + 'zipCode,'
                              + 'manually,'
                              + 'county {'
                                + 'fipsCountyCode,'
                                + 'name'
                              + '}'
                            + '}'
                            + 'participantAddress {'
                              + 'uuid,'
                              + 'isPrevious,'
                              + 'startDate,'
                              + 'housingStatusType'
                            + '}'
                          + '}'
                          + 'provedAssets {'
                            + 'amount,'
                            + 'institutionName,'
                            + 'assetType'
                          + '}'
                          + 'militaryService {'
                            + 'isServed,'
                            + 'isCurrentlyServing,'
                            + 'expirationDate,'
                            + 'isRetired,'
                            + 'isReserve,'
                            + 'isSurvivingSpouse'
                          + '}'
                        + '}'
                        + 'realEstate {'
                          + 'properties {'
                            + 'uuid,'
                            + 'occupancyType,'
                            + 'address {'
                              + 'addressLine1,'
                              + 'addressLine2,'
                              + 'unit,'
                              + 'city,'
                              + 'stateCode,'
                              + 'zipCode,'
                              + 'county {'
                                + 'fipsCountyCode,'
                                + 'name'
                              + '}'
                            + '}'
                            + 'numberOfUnits,'
                            + 'propertyType,'
                            + 'costs {'
                              + 'amount,'
                              + 'costType'
                            + '}'
                            + 'owners {'
                              + 'uuid'
                            + '}'
                        + '}'
                        + 'creditTrades {'
                            + 'uuid,'
                            + 'propertyUuid,'
                            + 'name,'
                            + 'additionalInfo,'
                            + 'monthlyPayment,'
                            + 'loanBalance,'
                            + 'notRecognize,'
                            + 'originationDate'
                         + '}'
                       + '}'
                     + '}'
                   + '}';
        MortgagesGraphQLClient.Results results = client.query(query);
        processErrors(results);   
        
        return (String)results.data;
    }
    
    public Boolean fireSubmissionEvent(String uuid, String event) {
        MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceFireSubmissionEvent';
        mutation.variables = new Map<String, Object> { 'uuid' => uuid, 'event' => event };
        mutation.body = 'mutation salesforceFireSubmissionEvent($uuid: ID!, $event: SalesforceSubmissionEventEnum!) {' +
                          + 'salesforceFireSubmissionEvent(uuid: $uuid, event: $event)'
                      + '}';
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }

    public static final String QREGISTRATION_TASK_REQUIRED_FIELDS =
      'uuid,'
      + 'status,'
      + 'error,'
      + 'lender,'
      + 'loan {'
        + 'loanNumber,'
        + 'loanId,'
        + 'url,'
        + 'status,'
        + 'error'
      + '}';

    public static final String MUTATION_MORTGAGES_REFISTRATION_CREATE_TASK =
        'mutation mortgagesRegistrationCreateTask($submissionUuid: ID!, $vertical: MortgageRegistrationVerticalEnum!, $lender: MortgagesRegistrationLenderEnum!) {'
          + 'mortgagesRegistrationCreateTask(submissionUuid: $submissionUuid, vertical: $vertical, lender: $lender ) {'
            + QREGISTRATION_TASK_REQUIRED_FIELDS
          + '}'
        + '}';
        

    public String mortgagesRegistrationCreateTask(String submissionUuid, String vertical, String lender) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'mortgagesRegistrationCreateTask';
      mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'vertical' => vertical, 'lender' => lender };
      mutation.body = MUTATION_MORTGAGES_REFISTRATION_CREATE_TASK;

      MortgagesGraphQLClient.Results results = client.mutation(mutation);
      processErrors(results);
      
      return (String)results.data;
    }

    public static final String QUERY_MORTGAGES_REFISTRATION_FIND_TASK =
    'query mortgagesRegistrationFindTask($submissionUuid: ID!) {' 
      + 'mortgagesRegistrationFindTask(submissionUuid: $submissionUuid) {'
        + QREGISTRATION_TASK_REQUIRED_FIELDS
      + '}'
    + '}';

    public String mortgagesRegistrationFindTask(String submissionUuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesRegistrationFindTask';
      query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid};
      query.body = QUERY_MORTGAGES_REFISTRATION_FIND_TASK;

      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);
      
      return (String)results.data;
    }

    public static final String MUTATION_MORTGAGES_REGISTRATION_FIRE_TASK_EVENT =
    'mutation mortgagesRegistrationFireTaskEvent($submissionUuid: ID!, $event: String!) {' 
      + 'mortgagesRegistrationFireTaskEvent(submissionUuid: $submissionUuid, event: $event) {'
        + QREGISTRATION_TASK_REQUIRED_FIELDS
      + '}'
    + '}';

    public String mortgagesRegistrationFireTaskEvent(String submissionUuid, String event) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'mortgagesRegistrationFireTaskEvent';
      mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'event' => event };
      mutation.body = MUTATION_MORTGAGES_REGISTRATION_FIRE_TASK_EVENT;

      MortgagesGraphQLClient.Results results = client.mutation(mutation);
      processErrors(results);
      
      return (String)results.data;
    }

    public static final String MUTATION_MORTGAGES_REGISTRATION_UPDATE_TASK =
    'mutation mortgagesRegistrationUpdateTask($submissionUuid: ID!, $token: String!) {' 
      + 'mortgagesRegistrationUpdateTask(submissionUuid: $submissionUuid, token: $token) {'
        + QREGISTRATION_TASK_REQUIRED_FIELDS
      + '}'
    + '}';

    public String mortgagesRegistrationUpdateTask(String submissionUuid, String token) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'mortgagesRegistrationUpdateTask';
      mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'token' => token };
      mutation.body = MUTATION_MORTGAGES_REGISTRATION_UPDATE_TASK;

      MortgagesGraphQLClient.Results results = client.mutation(mutation);
      processErrors(results);
      
      return (String)results.data;
    }
  
    public Boolean archiveSubmission(String uuid) {
        MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceArchiveSubmission';
        mutation.variables = new Map<String, Object> { 'uuid' => uuid };
        mutation.body = 'mutation salesforceArchiveSubmission($uuid: ID!) {' +
                          + 'salesforceArchiveSubmission(uuid: $uuid)'
                      + '}';
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }

    public Boolean unarchiveSubmission(String uuid) {
        MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceUnarchiveSubmission';
        mutation.variables = new Map<String, Object> { 'uuid' => uuid };
        mutation.body = 'mutation salesforceUnarchiveSubmission($uuid: ID!) {' +
                          + 'salesforceUnarchiveSubmission(uuid: $uuid) '
                      + '}';
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }

    public String salesforceSync(String uuid, String type) {
      MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'salesforceSync';
      mutation.variables = new Map<String, Object> { 'uuid' => uuid, 'type' => type };
      mutation.body = 'mutation salesforceSync($uuid: ID!, $type: SalesforceEntityType!) {'+
                        + 'salesforceSync(uuid: $uuid, type: $type) {'
                          + 'elapsedTime,'
                          + 'error,'
                          + 'message,'
                          + 'success,'
                          + 'items {'
                            + 'state,'
                            + 'success,'
                            + 'error,'
                            + 'id,'
                          + '}'
                        + '}'
                      + '}';
      MortgagesGraphQLClient.Results results = client.mutation(mutation);
      processErrors(results);
      
      return (String)results.data;
    }
    public class TestException extends Exception {}

    public class PaginationSubmission {
      public string uuid { get; set; }
      public string status { get; set; }
      public string vertical { get; set; }
      public string createdAt { get; set; }
      public string opportunityId { get; set; }
      public string coBorrowerLeadId { get; set; }
      public string borrowerLeadId { get; set; }
      public Map<String, Map<String, String>> borrower { get; set; }

    }
    public class SubmissionsPaginationType {
      public Integer totalCount { get; set; }
      public List<PaginationSubmission> items { get; set; }
    }
    
    public static final Map<String, String> SF_TO_API_ROLES_MAP = new Map<String, String> {	
      'Loan Officer' => 'loanOfficer',	
      'Loan Processor' => 'loanProcessor',	
      'Loan Officer Coordinator' => 'loanCoordinator',	
      'Closing Coordinator' => 'loanCloser'	
    };
    
    public class MortgageTeamMemberType {
      public MortgageTeamMemberType() {}

      public MortgageTeamMemberType (String firstName,
                                     String lastName,
                                     String email,
                                     String role,
                                     String userId,
                                     Integer nmls,
                                     String calendlyLink,
                                     String licensedStates,
                                     String branch,
                                     String phone,
                                     String loanCoordinatorId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.calendlyLink = calendlyLink;
        this.role = role;
        this.nmls = nmls;
        this.userId = userId;
        this.licensedStates = licensedStates;
        this.branch = branch;
        this.phone = phone;
        this.loanCoordinatorId = loanCoordinatorId;
      }

      public String calendlyLink { get; set; }
      public String email { get; set; }
      public String firstName { get; set; }
      public String lastName { get; set; }
      public String loanCoordinatorId { get; set; }
      public Integer nmls { get; set; }
      public String role { get; set; }
      public String userId { get; set; }
      public String licensedStates { get; set; }
      public String branch { get; set; }
      public String phone { get; set; }
      public String salesforceName { get; set; }
      public String salesforceId { get; set; }
      public Boolean shouldSync { get; set; }
    }

    public class MortgageTeamMemberTypePaginationType {
      public Integer totalCount { get; set; }
      public List<MortgageTeamMemberType> items { get; set; }
    }

    public SubmissionsPaginationType searchSubmissions(String searchQuery, String vertical, String status, String order, Integer limitRecords, Integer offsetRecords) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceSubmissions';
      query.variables = new Map<String, Object> { 'query' => searchQuery, 'status' => status, 'vertical' => vertical, 'order' => order, 'limit' => limitRecords, 'offset' => offsetRecords };
      query.body = 'query mortgagesSalesforceSubmissions($query: String, $vertical: String, $status: String, $order: String, $limit: Int, $offset: Int) { mortgagesSalesforceSubmissions(query: $query, vertical: $vertical, status: $status, order: $order, limit: $limit, offset: $offset) {totalCount, items {id, uuid, status, vertical, createdAt, borrower {profile {firstName, lastName, email, citizenship } } } } }';
      
      MortgagesGraphQLClient.Results results = client.query(query, SubmissionsPaginationType.class);
      processErrors(results);   
      
      return (SubmissionsPaginationType)results.data;
    }

    public MortgageTeamMemberTypePaginationType getMortgageTeamMembers(String searchQuery, String role, String order, String orderDirection, Integer limitRecords, Integer offsetRecords) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceMortgageTeamMembers';
      query.variables = new Map<String, Object> { 'query' => searchQuery, 'role' => role, 'orderField' => order,'orderDirection' => orderDirection, 'limit' => limitRecords, 'offset' => offsetRecords };
      query.body = 'query mortgagesSalesforceMortgageTeamMembers($limit: Int, $offset: Int, $orderDirection: SalesforceOrderDirectionEnum, $orderField: SalesforceMortgageTeamOrderFieldEnum, $query: String,  $role: SalesforceMortgageTeamRoleEnum) { mortgagesSalesforceMortgageTeamMembers(limit: $limit, offset: $offset, orderDirection: $orderDirection, orderField: $orderField, query: $query,  role: $role) {totalCount, items {calendlyLink, email, firstName, lastName, loanCoordinatorId, nmls, role, userId, phone, branch, licensedStates } } }';

      MortgagesGraphQLClient.Results results = client.query(query, MortgageTeamMemberTypePaginationType.class);
      processErrors(results);   
      
      return (MortgageTeamMemberTypePaginationType)results.data;
    }


    public MortgageTeamMemberType getMortgageTeamMember(String userId) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgageSalesforceMortgageTeamMember';
      query.variables = new Map<String, Object> { 'userId' => userId };
      query.body = 'query mortgageSalesforceMortgageTeamMember($userId: String) { mortgageSalesforceMortgageTeamMember(userId: $userId) { calendlyLink, email, firstName, lastName, loanCoordinatorId, nmls, role, userId, phone, branch, licensedStates } }';

      MortgagesGraphQLClient.Results results = client.query(query, MortgageTeamMemberType.class);
      processErrors(results);   
      
      return (MortgageTeamMemberType)results.data;
    }

    public Boolean createOrUpdateMortgageTeamMember(MortgageTeamMemberType teamMember) {
      MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'salesforceCreateOrUpdateMortgageTeamMember';
      Map<String, Object> payload = new Map<String, Object> {	
        'firstName' => teamMember.firstName,	
        'lastName' => teamMember.lastName,	
        'email' => teamMember.email,	
        'role' => SF_TO_API_ROLES_MAP.get(teamMember.role),	
        'userId' => teamMember.userId,	
        'nmls' => teamMember.nmls,	
        'calendlyLink' => teamMember.calendlyLink,	
        'licensedStates' => teamMember.licensedStates,	
        'branch' => teamMember.branch,	
        'phone' => teamMember.phone	
      };
      mutation.variables = new Map<String, Object> { 'input' => payload };	
      mutation.body = 'mutation salesforceCreateOrUpdateMortgageTeamMember($input: SalesforceMortgageTeamMemberInput) { salesforceCreateOrUpdateMortgageTeamMember(input: $input) }';

      MortgagesGraphQLClient.Results results = client.mutation(mutation, MortgageTeamMemberType.class);
      processErrors(results);   
      
      return (Boolean)results.data;
    }


    public String getEligibility(String uuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceEligibility';
      query.variables = new Map<String, Object> { 'uuid' => uuid };
      query.body = 'query mortgagesSalesforceEligibility($uuid: ID!) {'
                    + 'mortgagesSalesforceEligibility(uuid: $uuid) {'
                      + 'uuid,'
                      + 'status,'
                      + 'createdAt,'
                      + 'expired,'
                      + 'vertical,'
                      + 'outcome,'
                      + 'failedReasons,'
                      + 'withCoBorrower,'
                      + 'declineReasons,'
                      + 'representativeFico,'
                      + 'loanTypes {'
                        + 'label,'
                        + 'slug'
                      + '}'
                      + 'lenders {'
                        + 'name,'
                        + 'slug'
                      + '}'
                    + '}'
                  + '}';

      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);

      return (String)results.data;
    }

    public String getSelectedProductHistory(String uuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceRefinanceSelectedProductHistory';
      query.variables = new Map<String, Object> { 'submissionUuid' => uuid };
      query.body = 'query mortgagesSalesforceRefinanceSelectedProductHistory($submissionUuid: ID!) {'
                    + 'mortgagesSalesforceRefinanceSelectedProductHistory(submissionUuid: $submissionUuid) {'
                      + 'dashboardProduct {'
                        + 'loanType,'
                        + 'loanTerm,'
                        + 'amortizationType,'
                        + 'lockPeriod,'
                        + 'armFixedTerm,'
                        + 'armSubsequentChangePeriod,'
                        + 'loanProductInfo {'
                          + 'name,'
                          + 'lender {'
                            + 'name'
                          + '}'
                        + '}'
                      + 'cashOutAmount,'
                      + 'loanBalance,'
                      + 'subordinateMortgage {'
                        + 'subordinateMortgageBalance,'
                        + 'refinance'
                      + '}'
                      + 'rolledCost,'
                      + 'totalLoanAmount,'
                      + 'monthlyPayment,'
                      + 'monthlyTaxes,'
                      + 'monthlyInsurance,'
                      + 'principalInterest,'
                      + 'pmiMonthlyPayment,'
                      + 'monthlyHomeownersFee,'
                      + 'discount,'
                      + 'lenderFees,'
                      + 'thirdPartyFees,'
                      + 'appraisalFee,'
                      + 'prepaidForNewLoan,'
                      + 'payOffForPreviousLoan,'
                      + 'escrowDeposit,'
                      + 'isEncompassProduct,'
                      + 'totalClosingCost,'
                    + '}'
                    + 'rateLockProduct {'
                      + 'loanType,'
                      + 'loanTerm,'
                      + 'amortizationType,'
                      + 'lockPeriod,'
                      + 'armFixedTerm,'
                      + 'armSubsequentChangePeriod,'
                      + 'loanProductInfo {'
                        + 'name,'
                        + 'lender {'
                          + 'name'
                        + '}'
                      + '}'
                      + 'cashOutAmount,'
                      + 'loanBalance,'
                      + 'subordinateMortgage {'
                        + 'subordinateMortgageBalance,'
                        + 'refinance'
                      + '}'
                      + 'rolledCost,'
                      + 'totalLoanAmount,'
                      + 'monthlyPayment,'
                      + 'monthlyTaxes,'
                      + 'monthlyInsurance,'
                      + 'principalInterest,'
                      + 'pmiMonthlyPayment,'
                      + 'monthlyHomeownersFee,'
                      + 'discount,'
                      + 'lenderFees,'
                      + 'thirdPartyFees,'
                      + 'appraisalFee,'
                      + 'prepaidForNewLoan,'
                      + 'payOffForPreviousLoan,'
                      + 'escrowDeposit,'
                      + 'isEncompassProduct,'
                      + 'totalClosingCost,'
                    + '}'
                    + 'finalProduct {'
                      + 'loanType,'
                      + 'loanTerm,'
                      + 'amortizationType,'
                      + 'lockPeriod,'
                      + 'armFixedTerm,'
                      + 'armSubsequentChangePeriod,'
                      + 'loanProductInfo {'
                        + 'name,'
                        + 'lender {'
                          + 'name'
                        + '}'
                      + '}'
                      + 'cashOutAmount,'
                      + 'loanBalance,'
                      + 'subordinateMortgage {'
                        + 'subordinateMortgageBalance,'
                        + 'refinance'
                      + '}'
                      + 'rolledCost,'
                      + 'totalLoanAmount,'
                      + 'monthlyPayment,'
                      + 'monthlyTaxes,'
                      + 'monthlyInsurance,'
                      + 'principalInterest,'
                      + 'pmiMonthlyPayment,'
                      + 'monthlyHomeownersFee,'
                      + 'discount,'
                      + 'lenderFees,'
                      + 'thirdPartyFees,'
                      + 'appraisalFee,'
                      + 'prepaidForNewLoan,'
                      + 'payOffForPreviousLoan,'
                      + 'escrowDeposit,'
                      + 'isEncompassProduct,'
                      + 'totalClosingCost,'
                    + '}'
                  + '}'
                + '}';
      
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);

      return (String)results.data;
    }
    
    public String getEligibilityField(String uuid, String field) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceEligibility';
      query.variables = new Map<String, Object> { 'uuid' => uuid };
      query.body = 'query mortgagesSalesforceEligibility($uuid: ID!) {'
                    + 'mortgagesSalesforceEligibility(uuid: $uuid) {'
                      + field
                    + '}'
                  + '}';
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);        

      return (String)results.data;
    }

    public Boolean rerunEligibility(string submissionUuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgageSalesforceRerunEligibility';
      query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
      query.body = 'mutation mortgageSalesforceRerunEligibility($submissionUuid: ID!){' +
                    'mortgageSalesforceRerunEligibility(submissionUuid: $submissionUuid)}';

      MortgagesGraphQLClient.Results results = client.mutation(query, Boolean.class);
      processErrors(results);

      return (Boolean)results.data;
    }

    public Boolean changeProduct(String submissionUuid, Integer productId) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgageSalesforceChangeProduct';
      query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'productId' => productId };
      query.body = 'mutation mortgageSalesforceChangeProduct($submissionUuid: ID!, $productId: Int!) {'
                    + 'mortgageSalesforceChangeProduct(submissionUuid: $submissionUuid, productId: $productId)'
                  + '}';

      MortgagesGraphQLClient.Results results = client.query(query, Boolean.class);
      processErrors(results);

      return (Boolean)results.data;
    }

    public String getEligibilities(string submissionUuid) { 
      return getEligibilities(submissionUuid, null, null);
    }

    public String getEligibilities(string submissionUuid, Integer limitRecords, Integer offset) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceEligibilities';
      query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'limit' => limitRecords, 'offset' => offset };
      query.body = 'query mortgagesSalesforceEligibilities($submissionUuid: ID!, $limit: Int, $offset: Int) {'
                    + 'mortgagesSalesforceEligibilities(submissionUuid: $submissionUuid, limit: $limit, offset: $offset) {'
                      + 'uuid,'
                      + 'status,'
                      + 'createdAt,'
                      + 'expired,'
                      + 'vertical,'
                      + 'outcome,'
                      + 'failedReasons,'
                    + '}'
                  + '}';

      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);

      return (String)results.data;
    }

    public static final String MUTATION_SALESFORCE_ASSIGN_LOAN_OFFICER =
        'mutation salesforceAssignLoanOfficer($submissionUuid: ID!, $userId: String!) {' +
            + 'salesforceAssignLoanOfficer(submissionUuid: $submissionUuid, userId: $userId)'
            + '}';
        
    public Boolean assignLoanOfficer(String submissionUuid, String userId) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceAssignLoanOfficer';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'userId' => userId };
        mutation.body = MUTATION_SALESFORCE_ASSIGN_LOAN_OFFICER;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }

    public static final String MUTATION_SALESFORCE_ASSIGN_LOAN_COORDINATOR =
        'mutation salesforceAssignLoanCoordinator($submissionUuid: ID!, $userId: String!) {' +
            + 'salesforceAssignLoanCoordinator(submissionUuid: $submissionUuid, userId: $userId)'
            + '}';
        
    public Boolean assignLoanCoordinator(String submissionUuid, String userId) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceAssignLoanCoordinator';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'userId' => userId };
        mutation.body = MUTATION_SALESFORCE_ASSIGN_LOAN_COORDINATOR;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }

    public static final String MUTATION_SALESFORCE_ASSIGN_LOAN_PROCESSOR =
        'mutation salesforceAssignLoanProcessor($submissionUuid: ID!, $userId: String!) {' +
            + 'salesforceAssignLoanProcessor(submissionUuid: $submissionUuid, userId: $userId)'
            + '}';
        
    public Boolean assignLoanProcessor(String submissionUuid, String userId) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceAssignLoanProcessor';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'userId' => userId };
        mutation.body = MUTATION_SALESFORCE_ASSIGN_LOAN_PROCESSOR;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }

    public static final String MUTATION_SALESFORCE_ASSIGN_LOAN_CLOSER =
        'mutation salesforceAssignLoanCloser($submissionUuid: ID!, $userId: String!) {' +
            + 'salesforceAssignLoanCloser(submissionUuid: $submissionUuid, userId: $userId)'
            + '}';
        
    public Boolean assignLoanCloser(String submissionUuid, String userId) {
      MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'salesforceAssignLoanCloser';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'userId' => userId };
        mutation.body = MUTATION_SALESFORCE_ASSIGN_LOAN_CLOSER;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
      
        return (Boolean)results.data;
    }
    
    public static final String QUERY_MORTGAGES_SALESFORCE_APPLICATION_CONFIG =
        'query mortgagesSalesforceApplicationConfig {'
            + 'mortgagesSalesforceApplicationConfig {'
                + 'states {'
                    + 'name,'
                    + 'code,'
                    + 'taxRate,'
                    + 'approved,'
                + '}'
            + '}'
        + '}';
    
    public String getApplicationConfig() {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'mortgagesSalesforceApplicationConfig';
      query.body = QUERY_MORTGAGES_SALESFORCE_APPLICATION_CONFIG;
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);

      return (String)results.data;
    }
    
    public static final String MUTATION_SALESFORCE_UPDATE_APPLICATION_CONFIG =
        'mutation salesforceUpdateApplicationConfig($states: [SalesforceStateConfigInput]) {'
            + 'salesforceUpdateApplicationConfig(states: $states) {'
                + 'states {'
                    + 'name,'
                    + 'code,'
                    + 'taxRate,'
                    + 'approved,'
                    + '}'
                + '}'
            + '}';

    public String updateApplicationConfig(String stateCode, Boolean approved) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'salesforceUpdateApplicationConfig';
      List<Map<String, Object>> states = new List<Map<String, Object>>{ new Map<String, Object> { 'code' => stateCode, 'approved' => approved } };
      query.variables = new Map<String, Object> { 'states' => states };
      query.body = MUTATION_SALESFORCE_UPDATE_APPLICATION_CONFIG;
      
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);

      return (String)results.data;
    }

    public String getSpruceOrderPayload(String submissionUuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'spruceOrderPayload';
      query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
      query.body = 'query spruceOrderPayload($submissionUuid: ID!) {'
                    + 'salesforceUpdateApplicationConfig(submissionUuid: $submissionUuid) {'
                      + 'name,'
                      + 'address,'
                      + 'loanNumber,'
                      + 'estimatedClosingDate,'
                      + 'loanAmount,'
                      + 'phoneNumber,'
                      + 'email'
                    + '}'
                  + '}';
      
      MortgagesGraphQLClient.Results results = client.query(query);
      processErrors(results);

      return (String)results.data;
    }

    public class SpruceDocumentType {
      public String documentUuid { get; set; }
      public String documentType { get; set; } 
      public String status { get; set; }

      public SpruceDocumentType(String documentUuid, String documentType, String status) {
        this.documentUuid = documentUuid;
        this.documentType = documentType;
        this.status = status;
      }
    }

    public class OrderType {
      public String uuid { get; set; }
      public String status { get; set; }
      public String orderedDate { get; set; } 
      public List<SpruceDocumentType> documents { get; set; }

      public OrderType() {}

      public OrderType(String uuid, String status, String orderedDate, List<SpruceDocumentType> documents) {
        this.uuid = uuid;
        this.status = status;
        this.orderedDate = orderedDate;
        this.documents = documents;
      }
    }
    
    public static final String MUTATION_CREATE_INITIAL_SPRUCE_ORDER =
        'mutation createInitialSpruceOrder($submissionUuid: ID!) {'
            + 'createInitialSpruceOrder(submissionUuid: $submissionUuid) {'
                +'uuid,'    
                +'status,'
                +'documents {'
                  +'documentUuid,'
                  +'documentType,'
                  +'status'
                +'}'
            + '}'
          + '}';
    
    public OrderType createInitialSpruceOrder(String submissionUuid) {
      MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'createInitialSpruceOrder';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
        mutation.body = MUTATION_CREATE_INITIAL_SPRUCE_ORDER;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, OrderType.class);
        processErrors(results);
      
        return (OrderType)results.data;
    }

    public static final String MUTATION_CREATE_SPRUCE_ORDER =
        'mutation createSpruceOrder($submissionUuid: ID!) {'
            + 'createSpruceOrder(submissionUuid: $submissionUuid) {'
                +'uuid,'    
                +'status,'
                +'documents {'
                  +'documentUuid,'
                  +'documentType,'
                  +'status'
                +'}'
              + '}'
            + '}';
        
    public OrderType createSpruceOrder(String submissionUuid) {
      MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'createSpruceOrder';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
        mutation.body = MUTATION_CREATE_SPRUCE_ORDER;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, OrderType.class);
        processErrors(results);
      
        return (OrderType)results.data;
    }

    public static final String QUERY_GET_SPRUCE_ORDER = 
                'query spruceLocalOrder($submissionUuid: ID!) {'
                    +'spruceLocalOrder(submissionUuid: $submissionUuid) {'
                      +'uuid,'    
                      +'status,'
                      +'orderedDate,'
                      +'documents {'
                        +'documentUuid,'
                        +'documentType,'
                        +'status'
                      +'}'
                    +'}'
                  +'}';

    public OrderType getSpruceOrder(String submissionUuid) {
      MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
      query.operationName = 'spruceLocalOrder';
      query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
      query.body = QUERY_GET_SPRUCE_ORDER;
        
        MortgagesGraphQLClient.Results results = client.query(query, OrderType.class);	
        processErrors(results);
        
        OrderType spruceOrder = (OrderType)results.data;	
        return spruceOrder;	    
  }

  public Boolean addSpruceDocument(String orderUuid, String documentUuid, String documentType) {
    MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
    mutation.variables = new Map<String, Object> { 'orderUuid' => orderUuid,
                                                   'documentUuid' => documentUuid,
                                                   'documentType' => documentType };	
    mutation.operationName = 'addSpruceDocument';
    mutation.body = 'mutation addSpruceDocument($orderUuid: ID!, $documentUuid: ID!, $documentType: String!) {'
                  +'addSpruceDocument(orderUuid: $orderUuid, documentUuid: $documentUuid, documentType: $documentType) }';
      
      MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);	
      processErrors(results);
      return (Boolean)results.data;
}

public Boolean removeSpruceDocument(String orderUuid, String documentType) {
  MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
  mutation.operationName = 'removeSpruceDocument';
  mutation.variables = new Map<String, Object> { 'orderUuid' => orderUuid, 'documentType' => documentType };
  mutation.body = 'mutation removeSpruceDocument($orderUuid: ID!, $documentType: String!) {'
                +'removeSpruceDocument(orderUuid: $orderUuid, documentType: $documentType) {'
                  +'uuid,'    
                  +'status'
                  +'}'
                +'}';
    
  MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);	
  processErrors(results);
  	
  return (Boolean)results.data;	    
}

  public class DocumentType {
    public String uuid { get; set; }
    public String status { get; set; }
    public String ownerUuid { get; set; }
    public String reference { get; set; }
    public Map<String, String> metadata { get; set;}

    public DocumentType(String uuid, String status, String ownerUuid, String reference, Map<String, String> metadata) {
      this.uuid = uuid;
      this.status = status;
      this.ownerUuid = ownerUuid;
      this.reference = reference;
      this.metadata = metadata;
    }
  }

    public static final String MUTATION_MORTGAGE_REFI_SUBMISSION_STATUS_CHANGER =
        'mutation mortgageRefiSubmissionStatusChanger($uuid: ID!, $status: SubmissionStatusTypeEnum) {' +
            + 'mortgageRefiSubmissionStatusChanger(uuid: $uuid, status: $status) {'
                + 'uuid'
            + '}'
            + '}';

    public String updateSubmissionStatus(String submissionUuid, String submissionStatus) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'mortgageRefiSubmissionStatusChanger';
        mutation.variables = new Map<String, Object> { 'uuid' => submissionUuid, 'status' => submissionStatus };
        mutation.body = MUTATION_MORTGAGE_REFI_SUBMISSION_STATUS_CHANGER;

        MortgagesGraphQLClient.Results results = client.mutation(mutation);
        processErrors(results);
        return (String)results.data;
    }
    
    public static final String QUERY_ENCOMPASS_SCHEDULE_CLOSING_COSTS_UPDATE =
        'query encompassScheduleClosingCostsUpdate($submissionUuid: String!) {' +
            'encompassScheduleClosingCostsUpdate(submissionUuid: $submissionUuid) {' +
            'status' +
            '} }';
    
    public String updateClosingCosts(String submissionUuid) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'encompassScheduleClosingCostsUpdate';
        query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
        query.body = QUERY_ENCOMPASS_SCHEDULE_CLOSING_COSTS_UPDATE;
        
        MortgagesGraphQLClient.Results results = client.query(query);
        processErrors(results);
        return (String)results.data;
    }
    
    public static final String MUTATION_ENCOMPASS_UPDATE_LOAN =
        'mutation encompassSystemUpdateLoan($loanData: EncLoanInput) {'
            + 'encompassSystemUpdateLoan(loanData: $loanData) {'
            + 'status'
            + '}}';
    
    public Boolean updateLoan(MR_Loan loan) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'encompassSystemUpdateLoan';
        mutation.variables = new Map<String, Object> { 'loanData' => loan };
        mutation.body = MUTATION_ENCOMPASS_UPDATE_LOAN;
    
        MortgagesGraphQLClient.Results results = client.mutation(mutation);
        processErrors(results);
        String result = (String) results.data;
        if (null == result || !result.contains('"status":"success"')) {
            return false;
        }
        return true;
    }

    public static final String MUTATION_MORTGAGE_REFI_ENCOMPASS_SELECT_PRODUCT = 
      'mutation mortgageRefiEncompassSelectProduct($input: EncompassSelectedProduct) {' +
        'mortgageRefiEncompassSelectProduct(input: $input) }';

    public String mortgageRefiEncompassSelectProduct(String submissionUuid, Datetime rateLock, Boolean rateLocked) {
      MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'mortgageRefiEncompassSelectProduct';
      
      Map<String, Object> payload = new Map<String, Object> {	
        'submissionUuid' => submissionUuid,	
        'rateLock' => rateLock,
        'rateLocked' => rateLocked
      };

      mutation.variables = new Map<String, Object> { 'input' => payload };
      mutation.body = MUTATION_MORTGAGE_REFI_ENCOMPASS_SELECT_PRODUCT;
      
      MortgagesGraphQLClient.Results results = client.mutation(mutation);
      processErrors(results);
      return (String)results.data;
    }
    
    public static final String MUTATION_MORTGAGE_ADMIN_SAVE_LENDER_LOAN_NUMBER =
        'mutation mortgageAdminSaveLenderLoanNumber($submissionUuid: ID!, $lenderLoanNumber: String!){mortgageAdminSaveLenderLoanNumber(submissionUuid: $submissionUuid, lenderLoanNumber: $lenderLoanNumber)}';
    
    public Boolean saveLenderLoanNumber(String submissionUuid, String lenderLoanNumber) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'mortgageAdminSaveLenderLoanNumber';
        mutation.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'lenderLoanNumber' => lenderLoanNumber };
        mutation.body = MUTATION_MORTGAGE_ADMIN_SAVE_LENDER_LOAN_NUMBER;
    
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);
        return (Boolean)results.data;
    }

    public static final String MUTATION_MORTGAGE_ENCOMPASS_UPDATE_TASKS =
      'mutation mortgageEncompassUpdateTasks($input: UpdateTasksInput) {' +
        'mortgageEncompassUpdateTasks(input: $input) }';

    public Boolean mortgageEncompassUpdateTasks(String submissionUuid, Datetime lockExpirationDate) {
      MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
      mutation.operationName = 'mortgageEncompassUpdateTasks';
      Map<String, Object> lockExpirationDateInput = new Map<String, Object> { 'type' => 'lockExpirationDate', 'value' => lockExpirationDate };
      Object[] tasks = new Object[] { lockExpirationDateInput };
      Map<String, Object> payload = new Map<String, Object>{ 'submissionUuid' => submissionUuid, 'tasks' => tasks };
      mutation.variables = new Map<String,Object> { 'input' => payload };
      mutation.body = MUTATION_MORTGAGE_ENCOMPASS_UPDATE_TASKS;

      MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
      processErrors(results);
      return (Boolean)results.data;
    }
}