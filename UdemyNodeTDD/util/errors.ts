export class EmailError extends Error {
  name = "EmailError";
  
  constructor(message: string) {
    super(message);
  }
}
