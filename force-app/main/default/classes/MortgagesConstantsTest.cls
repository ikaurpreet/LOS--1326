@isTest
public with sharing class MortgagesConstantsTest {
    @isTest
    public static void getEnv() {
        System.assertEquals(MortgagesConstants.Env.TEST, MortgagesConstants.getEnv('TEST'));
    }

    @isTest
    public static void getVertical() {
        System.assertEquals(MortgagesConstants.Vertical.MortgageRefi, MortgagesConstants.getVertical('MortgageRefi'));
        System.assertEquals(MortgagesConstants.Vertical.MortgageRefi, MortgagesConstants.getVertical('refinance'));
        System.assertEquals(MortgagesConstants.Vertical.HomePurchase, MortgagesConstants.getVertical('purchase'));
    }
}