const participantAddress = `
        id
        addressLine1
        unit
        city
        stateCode
        zipCode,
        startDate
        housingStatusType
    `,
    participantAddresses = `
        uuid
        address {
            ${participantAddress}
        }
        mailingAddress {
            ${participantAddress}
        }
        previousAddresses {
            address {
                ${participantAddress}
            }
        }
        sameMailingAddress
    `,
    submissionData = `
        borrower {
            ${participantAddresses}
        }
        coBorrower {
            ${participantAddresses}
        }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantAddresses($borrower: LosParticipantAddressesInput, $coBorrower: LosParticipantAddressesInput) {
    mortgageLosRefiUpdateParticipantAddresses(borrower: $borrower, coBorrower: $coBorrower){
        ${submissionData}
    }
}`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantAddresses($borrower: LosParticipantAddressesInput, $coBorrower: LosParticipantAddressesInput) {
    mortgageLosPurchaseUpdateParticipantAddresses(borrower: $borrower, coBorrower: $coBorrower) {
        ${submissionData}
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}