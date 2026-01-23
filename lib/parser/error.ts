import { ParseError } from "@/types";

export class ErrorHandler {
  protected errors: ParseError[] = [];

  public addError(error: ParseError) {
    this.errors.push(error);
  }
  public clearErrors() {
    this.errors = [];
  }
  public getErrors() {
    return structuredClone(this.errors);
  }
}
