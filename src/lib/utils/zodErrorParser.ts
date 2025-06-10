import { ZodError, ZodIssue } from "zod";

export type ParsedZodError = {
  field: string;
  message: string;
};

export function parseZodError(error: ZodError): ParsedZodError[] {
  return error.errors.map((issue: ZodIssue) => {
    return {
      field: issue.path.join(".") || "global",
      message: issue.message,
    };
  });
}
