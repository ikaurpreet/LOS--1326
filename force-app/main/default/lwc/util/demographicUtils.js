export class DemographicConstants {

    // Ethnicity Constants
    static HISPANIC_OR_LATINO = 'hispanicOrLatino';
    static HISPANIC_OR_LATINO_UI = 'Hispanic or Latino';
    static NOT_HISPANIC_OR_LATINO = 'notHispanicOrLatino';
    static NOT_HISPANIC_OR_LATINO_UI = 'Not Hispanic or Latino';
    static MEXICAN = 'mexican';
    static MEXICAN_UI = 'Mexican';
    static PUERTO_RICAN = 'puertoRican';
    static PUERTO_RICAN_UI = 'Puerto Rican';
    static CUBAN = 'cuban';
    static CUBAN_UI = 'Cuban';
    static OTHER_ETHNICITY = 'otherEthnicity';
    static OTHER_ETHNICITY_UI = 'Other Hispanic or Latino';
    static DO_NOT_WISH_TO_PROVIDE = 'dontWishToProvide';
    static DO_NOT_WISH_TO_PROVIDE_UI = 'I do not wish to provide this information';

    //Race Constants
    static AMERICAN_INDIAN = 'americanIndianOrAlaskaNative';
    static AMERICAN_INDIAN_UI = 'American Indian or Alaska Native';
    static ASIAN_INDIAN = 'asianIndian';
    static ASIAN_INDIAN_UI = 'Asian Indian';
    static CHINESE = 'chinese';
    static CHINESE_UI = 'Chinese';
    static FILIPINO = 'filipino';
    static FILIPINO_UI = 'Filipino';
    static JAPANESE = 'japanese';
    static JAPANESE_UI = 'Japanese';
    static KOREAN = 'korean';
    static KOREAN_UI = 'Korean';
    static VIETNAMESE = 'vietnamese';
    static VIETNAMESE_UI = 'Vietnamese';
    static ASIAN = 'asian';
    static ASIAN_UI = 'Asian';
    static AFRICAN_AMERICAN = 'blackOrAfricanAmerican';
    static AFRICAN_AMERICAN_UI = 'Black or African American';
    static NATIVE_HAWAIIAN = 'nativeHawaiian';
    static NATIVE_HAWAIIAN_UI = 'Native Hawaiian';
    static GUAMANIAN = 'guamanianOrChamorro';
    static GUAMANIAN_UI = 'Guamanian or Chamorro';
    static SAMOAN = 'samoan';
    static SAMOAN_UI = 'Samoan';
    static PACIFIC_ISLANDER = 'nativeHawaiianOrPacificIslander';
    static PACIFIC_ISLANDER_UI = 'Native Hawaiian or Pacific Islander';
    static WHITE = 'white';
    static WHITE_UI = 'White';
    static OTHER_ASIAN = 'otherAsian';
    static OTHER_ASIAN_UI = 'Other Asian';
    static OTHER_HAWAIIAN = 'otherHawaiian';
    static OTHER_HAWAIIAN_UI = 'Other Pacific Islander';

    //Sex Constants
    static MALE = 'male';
    static MALE_UI = 'Male';
    static FEMALE = 'female';
    static FEMALE_UI = 'Female';

    //Other Constants
    static INDENT_CHECKBOX_CLASS = 'demoIndentCheckbox';
    static OTHER_TEXT_BOX_CLASS = 'demoOtherTextBox';
    static ETHNICITY = 'ethnicity';
    static RACE = 'race';
    static SEX = 'sex';
}

export const demoLabelMap = {
    [DemographicConstants.NOT_HISPANIC_OR_LATINO]: DemographicConstants.NOT_HISPANIC_OR_LATINO_UI,
    [DemographicConstants.HISPANIC_OR_LATINO]: DemographicConstants.HISPANIC_OR_LATINO_UI,
    [DemographicConstants.MEXICAN]: DemographicConstants.MEXICAN_UI,
    [DemographicConstants.PUERTO_RICAN]: DemographicConstants.PUERTO_RICAN_UI,
    [DemographicConstants.CUBAN]: DemographicConstants.CUBAN_UI,
    [DemographicConstants.OTHER_ETHNICITY]: DemographicConstants.OTHER_ETHNICITY_UI,
    [DemographicConstants.DO_NOT_WISH_TO_PROVIDE]: DemographicConstants.DO_NOT_WISH_TO_PROVIDE_UI,
    [DemographicConstants.AMERICAN_INDIAN]: DemographicConstants.AMERICAN_INDIAN_UI,
    [DemographicConstants.ASIAN_INDIAN]: DemographicConstants.ASIAN_INDIAN_UI,
    [DemographicConstants.CHINESE]: DemographicConstants.CHINESE_UI,
    [DemographicConstants.FILIPINO]: DemographicConstants.FILIPINO_UI,
    [DemographicConstants.JAPANESE]: DemographicConstants.JAPANESE_UI,
    [DemographicConstants.KOREAN]: DemographicConstants.KOREAN_UI,
    [DemographicConstants.VIETNAMESE]: DemographicConstants.VIETNAMESE_UI,
    [DemographicConstants.ASIAN]: DemographicConstants.ASIAN_UI,
    [DemographicConstants.AFRICAN_AMERICAN]: DemographicConstants.AFRICAN_AMERICAN_UI,
    [DemographicConstants.NATIVE_HAWAIIAN]: DemographicConstants.NATIVE_HAWAIIAN_UI,
    [DemographicConstants.GUAMANIAN]: DemographicConstants.GUAMANIAN_UI,
    [DemographicConstants.SAMOAN]: DemographicConstants.SAMOAN_UI,
    [DemographicConstants.PACIFIC_ISLANDER]: DemographicConstants.PACIFIC_ISLANDER_UI,
    [DemographicConstants.WHITE]: DemographicConstants.WHITE_UI,
    [DemographicConstants.OTHER_ASIAN]: DemographicConstants.OTHER_ASIAN_UI,
    [DemographicConstants.OTHER_HAWAIIAN]: DemographicConstants.OTHER_HAWAIIAN_UI,
    [DemographicConstants.DO_NOT_WISH_TO_PROVIDE]: DemographicConstants.DO_NOT_WISH_TO_PROVIDE_UI,
    [DemographicConstants.MALE]: DemographicConstants.MALE_UI,
    [DemographicConstants.FEMALE]: DemographicConstants.FEMALE_UI,
    [DemographicConstants.DO_NOT_WISH_TO_PROVIDE]: DemographicConstants.DO_NOT_WISH_TO_PROVIDE_UI
}

export const otherTextBoxes = [
    DemographicConstants.AMERICAN_INDIAN,
    DemographicConstants.OTHER_ETHNICITY,
    DemographicConstants.OTHER_ASIAN,
    DemographicConstants.OTHER_HAWAIIAN
]

export const allEthnicities = [
    DemographicConstants.HISPANIC_OR_LATINO,
    DemographicConstants.MEXICAN,
    DemographicConstants.PUERTO_RICAN,
    DemographicConstants.CUBAN,
    DemographicConstants.OTHER_ETHNICITY,
    DemographicConstants.NOT_HISPANIC_OR_LATINO,
    DemographicConstants.DO_NOT_WISH_TO_PROVIDE
]

export const allRaces = [
    DemographicConstants.AMERICAN_INDIAN,
    DemographicConstants.ASIAN,
    DemographicConstants.ASIAN_INDIAN,
    DemographicConstants.CHINESE,
    DemographicConstants.FILIPINO,
    DemographicConstants.JAPANESE,
    DemographicConstants.KOREAN,
    DemographicConstants.VIETNAMESE,
    DemographicConstants.OTHER_ASIAN,
    DemographicConstants.AFRICAN_AMERICAN,
    DemographicConstants.PACIFIC_ISLANDER,
    DemographicConstants.NATIVE_HAWAIIAN,
    DemographicConstants.GUAMANIAN,
    DemographicConstants.SAMOAN,
    DemographicConstants.OTHER_HAWAIIAN,
    DemographicConstants.WHITE,
    DemographicConstants.DO_NOT_WISH_TO_PROVIDE
]

export const allSexes = [
    DemographicConstants.MALE,
    DemographicConstants.FEMALE,
    DemographicConstants.DO_NOT_WISH_TO_PROVIDE
]