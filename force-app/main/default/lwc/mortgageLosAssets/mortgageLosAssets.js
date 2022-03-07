import { api, track } from 'lwc';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { AssetsGroups, assetsTypeOptions } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';
import BaseComponent from 'c/baseComponent';

export default class MortgageLosAssets extends BaseComponent {
    @api role;
    @api recordId;
    @api showBothParticipants;
    @api isEditing = false;

    @track assets = [];
    @track totalAssetsWithMask;
    @track addingAsset = false;

    @track coBorrowerUuid = null;
    @track borrowerUuid = null;

    get showBorrower() {
        return this.role === "borrower" || this.showBothParticipants;
    }

    get showCoBorrower() {
        return this.role === "coBorrower" || this.showBothParticipants;
    }

    handleEdit = () => {
        this.isEditing = true;
    }

    handleInputChange = (key, field, value) => {
        let asset = null;
        this.assets.map(group => {
            asset = group.items.find(item => item.key == key);
            if (asset) {
                asset[field] = value;
                if (field === "ownerValue") {
                    if (value === "borrower") {
                        asset.owner = 'Borrower';
                        asset.ownerLabel = 'Borrower’s';
                    }
                    else if (value === "coBorrower") {
                        asset.owner = 'Co-Borrower';
                        asset.ownerLabel = 'Co-Borrower’s';
                    } else if (value === "both") {
                        asset.owner = 'Both';
                        asset.ownerLabel = 'Both';
                    }
                }
            }
        });
        const newAssets = this.getAssetsList();
        this.setAssets(newAssets);
    }

    handleCancel = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.addingAsset = false;
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    mutationCallback(result) {
        this.submissionCallback(result);
    }

    prepareParticipantAssets(assets, participant, participantUuid) {
        let participantAssets = [];
        assets.map(group => {
            const groupAssets = [...group.items, ...group.deletedAssets].map((item) => {
                if (item.ownerValue === participant && item.ownerValue !== 'both') {
                    const jointAccount = item.jointAccount.length > 0 ? item.jointAccount.map(account => {
                        return { ...account, delete: true }
                    }) : [];
                    return {
                        accountNumber: item.accountNumber || "",
                        amount: item.amount,
                        assetType: item.assetType,
                        institutionName: item.institutionName,
                        uuid: item.uuid,
                        delete: !!item.delete,
                        jointAccount: jointAccount,
                        participantUuid: participantUuid
                    }
                } else if (item.ownerValue === 'both' && participant === 'borrower') {
                    return {
                        accountNumber: item.accountNumber || "",
                        amount: item.amount,
                        assetType: item.assetType,
                        institutionName: item.institutionName,
                        uuid: item.uuid,
                        delete: !!item.delete,
                        jointAccount: [{ uuid: this.coBorrowerUuid }],
                        participantUuid: this.borrowerUuid
                    }
                }
            }).filter(Boolean);
            participantAssets = [...participantAssets].concat([...groupAssets]);
        });
        return { provedAssets: [...participantAssets] };
    }

    showAddModal = () => {
        this.handleEdit();
        this.addingAsset = true;
    }

    handleDeleteClick = (assetKey) => {
        const newAssets = [];
        [...this.assets].map((group) => {
            group.items.map((item) => {
                if (item.key == assetKey) {
                    const asset = { ...item, delete: true };
                    newAssets.push(asset);
                } else {
                    newAssets.push(item);
                }
            });
            group.deletedAssets.map((item) => {
                newAssets.push(item);
            })
        });
        this.setAssets(newAssets);
    }

    getAssetsList = () => {
        const assetsList = [];
        [...this.assets].map((group) => {
            group.items.map((item) => {
                assetsList.push(item);
            });
            group.deletedAssets.map((item) => {
                assetsList.push(item);
            })
        });
        return assetsList;
    }

    handleAddAsset = (asset) => {
        let newAssets = this.getAssetsList();
        newAssets.push(asset);
        this.setAssets(newAssets);
    }

    undoDeleted = (assetKey) => {
        const newAssets = [];
        [...this.assets].map((group) => {
            group.deletedAssets.map((item) => {
                if (item.key == assetKey) {
                    const asset = { ...item, delete: false };
                    newAssets.push(asset);
                } else {
                    newAssets.push(item);
                }
            });
            group.items.map((item) => {
                newAssets.push(item);
            })
        });
        this.setAssets(newAssets);
    }

    handleSaveClick = () => {
        const assetsEditMode = this.template.querySelector('c-mortgage-los-assets-edit-mode');
        if (assetsEditMode.validate) {
            this.addingAsset = false;
            this.sectionController.hideContent();
            this.isEditing = false;
            let variables = {
                borrower: null
            }
            variables["borrower"] = {
                ...this.prepareParticipantAssets(this.assets, "borrower", this.borrowerUuid)
            };
            variables["coBorrower"] = {
                ...this.prepareParticipantAssets(this.assets, "coBorrower", this.coBorrowerUuid)
            };
            this.updateParticipant(this.mutationCallback.bind(this), variables, { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION });
        }
    }

    setAssets = (allAssets) => {
        if (allAssets && allAssets.length > 0) {
            let totalAssets = 0;
            const otherAssetTypes = allAssets.map((asset) => asset.assetType)
                .filter((assetType) => !AssetsGroups.find((assetGroup) => assetGroup.assetTypes.includes(assetType)));

            this.assets = AssetsGroups.map((assetGroup) => {
                let assetGroupTypes = assetGroup.assetTypes;
                if (assetGroup.label == 'Other assets') {
                    assetGroupTypes = otherAssetTypes;
                }
                const items = allAssets.filter((asset) => assetGroupTypes.includes(asset.assetType) && !asset.delete)
                    .map((asset) => {
                        return {
                            ...asset,
                            key: asset.uuid || asset.key || Math.random(),
                            assetTypeLabel: assetsTypeOptions.find((el) => el.value == asset.assetType)?.label,
                            amountWithMask: `$${moneyMask(asset.amount.toFixed(2))}`
                        }
                    }).sort((asset1, asset2) => {
                        return asset2.amount - asset1.amount;
                    });

                const deletedItems = allAssets.filter((asset) => assetGroupTypes.includes(asset.assetType) && asset.delete)
                    .map((asset) => {
                        return {
                            ...asset,
                            key: asset.uuid || asset.key || Math.random(),
                            assetTypeLabel: assetsTypeOptions.find((el) => el.value == asset.assetType)?.label,
                            amountWithMask: `$${moneyMask(asset.amount.toFixed(2))}`
                        }
                    }).sort((asset1, asset2) => {
                        return asset2.amount - asset1.amount;
                    });

                if (items.length === 0 && deletedItems.length === 0) {
                    return null;
                }
                const totalValue = items.length > 0 ? items.map(el => el.amount).reduce((prev, curr) => (prev + curr)) : 0;
                totalAssets += totalValue;
                return {
                    ...assetGroup,
                    deletedAssets: deletedItems,
                    items: items,
                    totalWithMask: `$${moneyMask(totalValue.toFixed(2))}`
                };
            }).filter((assetGroup) => assetGroup !== null);
            this.totalAssetsWithMask = `$${moneyMask(totalAssets.toFixed(2))}`;
        } else {
            this.assets = [];
        }
    }

    submissionCallback = (result) => {
        if (result) {
            let allAssets = []
            this.coBorrowerUuid = result.coBorrower?.uuid;
            this.borrowerUuid = result.borrower?.uuid;
            if (this.showCoBorrower) {
                allAssets = allAssets.concat(result.coBorrower.provedAssets.map((asset) => {
                    return {
                        owner: (asset.jointAccount.length > 0) ? 'Both' : 'Co-Borrower',
                        ownerLabel: (asset.jointAccount.length > 0) ? 'Both' : 'Co-Borrower’s',
                        ownerValue: (asset.jointAccount.length > 0) ? 'both' : 'coBorrower',
                        ...asset,
                    };
                }));
            }
            if (this.showBorrower) {
                allAssets = allAssets.concat(result.borrower.provedAssets.map((asset) => {
                    return {
                        owner: (asset.jointAccount.length > 0) ? 'Both' : 'Borrower',
                        ownerLabel: (asset.jointAccount.length > 0) ? 'Both' : 'Borrower’s',
                        ownerValue: (asset.jointAccount.length > 0) ? 'both' : 'borrower',
                        ...asset,
                    };
                }));
            }
            this.setAssets(allAssets);
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    loadSubmissionData() {
        this.getSubmission(this.submissionCallback, { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    render() {
        return this.isEditing ? editMode : viewMode;
    }
}