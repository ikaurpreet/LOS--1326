@isTest

private class StringBuilderTest {

  @isTest
  static void withEmptyConstructor() {
    String firstString = 'first string';
    String secondString = 'second string';
    StringBuilder builder = new StringBuilder();

    builder.add(firstString);
    builder.add(new List<String> { secondString });

    String result = builder.toString();

    system.assertEquals(result, firstString + secondString);
  }

  @isTest
  static void whenInitializedByString() {
    String firstString = 'first string';
    String secondString = 'second string';
    StringBuilder builder = new StringBuilder(firstString);

    builder.add(secondString);

    String result = builder.toString();

    system.assertEquals(result, firstString + secondString);
  }

  @isTest
  static void whenInitializedByStringList() {
    String firstString = 'first string';
    String secondString = 'second string';
    String thirdString = 'third string';
    StringBuilder builder = new StringBuilder(new List<String> { firstString, secondString });

    builder.add(thirdString);

    String result = builder.toString();

    system.assertEquals(result, firstString + secondString + thirdString);
  }
}