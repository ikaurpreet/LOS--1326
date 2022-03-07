const SSNMask = (val) => {
    if (val) {
        const x = val.replace(/\D+/g, '').match(/(\d{0,3})(\d{0,2})(\d{0,4})/);
        return !x[2] ? x[1] : `${x[1]}-${x[2]}` + (x[3] ? `-${x[3]}` : ``);
    }
    return val;
};

const phoneMask = (val) => {
    if (val) {
        const x = val.replace(/\D+/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        return !x[2] ? x[1] : `(${x[1]}) ${x[2]}` + (x[3] ? `-${x[3]}` : ``);
    }
    return val;
};

const moneyMask = (value, decimalPlaces = 2) => {
    let result = '';
    if (value) {
        value = value.toString().replace('.', '').replace(',', '').replace(/\D/g, '')
        const options = { minimumFractionDigits: decimalPlaces }
        result = new Intl.NumberFormat('en-US', options).format(
            parseFloat(value) / 100
        )
    }

    return result
}

export { SSNMask, phoneMask, moneyMask }