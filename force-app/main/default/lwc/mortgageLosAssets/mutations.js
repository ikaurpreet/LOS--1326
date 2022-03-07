const participantData = `
    uuid
    provedAssets {
        assetType
        accountNumber
        institutionName
        amount
        jointAccount {
            uuid
        }
        uuid
    }
    `,
    submissionData = `
        borrower {
            ${participantData}
        }
        coBorrower {
            ${participantData}
        }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantProvedAssets($borrower: LosParticipantProvedAssetsInput, $coBorrower: LosParticipantProvedAssetsInput) {
    mortgageLosRefiUpdateParticipantProvedAssets(borrower: $borrower, coBorrower: $coBorrower){
        ${submissionData}
    }
}`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantProvedAssets($borrower: LosParticipantProvedAssetsInput, $coBorrower: LosParticipantProvedAssetsInput) {
        mortgageLosPurchaseUpdateParticipantProvedAssets(borrower: $borrower, coBorrower: $coBorrower) {
        ${submissionData}
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}