public with sharing class StringBuilder {

  private List<String> buffer = new List<String>();

  public StringBuilder() {
  }

  public StringBuilder(List<String> stringList) {
    add(stringList);
  }

  public StringBuilder(String stringValue) {
    add(stringValue);
  }

  public void add(String stringValue) {
    buffer.add(stringValue);
  }

  public void add(List<String> stringList) {
    buffer.addAll(stringList);
  }

  public override String toString() {
    return String.join(buffer, '');
  }
}