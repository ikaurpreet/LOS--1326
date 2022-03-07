global class MortgagesConstants {
    public enum Env {TEST, PRODUCTION}
    public enum Vertical {MortgageRefi, HomePurchase}
    public static String PURCHASE_PREFIX = 'HomePurchase';
    public static String REFINANCE_PREFIX = 'MortgageRefi';

    public static MortgagesConstants.Env getEnv(String env) {
        MortgagesConstants.Env enumEnv;
        for (MortgagesConstants.Env item: MortgagesConstants.Env.values()) {
            if (item.name() == env) {
                enumEnv = item;
                break;
            }
        }

        return enumEnv;
    }

    public static MortgagesConstants.Vertical getVertical(String vertical) {
        MortgagesConstants.Vertical enumVertical;
        if (vertical == 'refinance') {
            return MortgagesConstants.Vertical.MortgageRefi;
        }

        if (vertical == 'purchase') {
            return MortgagesConstants.Vertical.HomePurchase;
        }

        for (MortgagesConstants.Vertical item: MortgagesConstants.Vertical.values()) {
            if (item.name() == vertical) {
                enumVertical = item;
                break;
            }
        }

        return enumVertical;
    }
}