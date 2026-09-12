import { describe, it, expect, vi } from "vitest";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  handleDatabaseError,
} from "@/lib/errors";
import { withTransaction } from "@/db/transaction";
import { db } from "@/db/client";
import { getAttemptById } from "@/db/queries/attempts";
import { getJournalEntryById } from "@/db/queries/journal";
import { getRevisionById } from "@/db/queries/revisions";
import { getDailyTaskById } from "@/db/queries/scheduling";
import { attemptRepository } from "@/db/repositories/attempt-repository";

describe("Error Hierarchy & Database Error Handler", () => {
  it("creates specific error classes with correct status codes and names", () => {
    const notFound = new NotFoundError("Problem not found");
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");
    expect(notFound.message).toBe("Problem not found");

    const conflict = new ConflictError("Task slot already assigned");
    expect(conflict.statusCode).toBe(409);
    expect(conflict.code).toBe("CONFLICT");

    const unauthorized = new UnauthorizedError();
    expect(unauthorized.statusCode).toBe(401);

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);

    const validation = new ValidationError("Invalid format", { field: "slug" });
    expect(validation.statusCode).toBe(400);
    expect(validation.details).toEqual({ field: "slug" });
  });

  it("maps PostgreSQL unique violation (23505) to ConflictError", () => {
    const pgError = { code: "23505", message: "duplicate key value violates unique constraint" };
    expect(() => handleDatabaseError(pgError, "Create Journal")).toThrowError(ConflictError);
  });

  it("maps PostgreSQL foreign key violation (23503) to NotFoundError", () => {
    const pgError = { code: "23503", message: "insert or update on table violates foreign key constraint" };
    expect(() => handleDatabaseError(pgError, "Create Attempt")).toThrowError(NotFoundError);
  });

  it("maps PostgreSQL check violation (23514) to ValidationError", () => {
    const pgError = { code: "23514", message: "check constraint violation" };
    expect(() => handleDatabaseError(pgError, "Validate Attempt")).toThrowError(ValidationError);
  });

  it("maps PostgreSQL not null violation (23502) to ValidationError", () => {
    const pgError = { code: "23502", message: "null value in column violates not-null constraint" };
    expect(() => handleDatabaseError(pgError, "Insert Task")).toThrowError(ValidationError);
  });

  it("maps generic unexpected error to DatabaseError", () => {
    const genericErr = new Error("Connection terminated unexpectedly");
    expect(() => handleDatabaseError(genericErr, "Query")).toThrowError(DatabaseError);
  });

  it("re-throws existing AppError instances without double-wrapping", () => {
    const appErr = new NotFoundError("Custom not found");
    expect(() => handleDatabaseError(appErr, "Query")).toThrow(appErr);
  });
});

describe("withTransaction Helper & Rollback Safety", () => {
  it("executes the callback within db.transaction and returns the result", async () => {
    const mockTx = { isTx: true };
    const txSpy = vi.spyOn(db, "transaction").mockImplementation(async (callback: any) => {
      return await callback(mockTx as any);
    });

    const result = await withTransaction(async (tx) => {
      expect(tx).toBe(mockTx);
      return "transaction_success";
    });

    expect(result).toBe("transaction_success");
    expect(txSpy).toHaveBeenCalled();
    txSpy.mockRestore();
  });

  it("reuses existing transaction context if provided", async () => {
    const existingTx = { existing: true } as any;
    const txSpy = vi.spyOn(db, "transaction");

    const result = await withTransaction(async (tx) => {
      expect(tx).toBe(existingTx);
      return "nested_success";
    }, existingTx);

    expect(result).toBe("nested_success");
    expect(txSpy).not.toHaveBeenCalled();
    txSpy.mockRestore();
  });

  it("handles and translates transaction callback errors cleanly", async () => {
    const txSpy = vi.spyOn(db, "transaction").mockImplementation(async (callback: any) => {
      return await callback({} as any);
    });

    await expect(
      withTransaction(async () => {
        throw new Error("Failure inside transaction");
      })
    ).rejects.toThrowError(DatabaseError);

    txSpy.mockRestore();
  });
});

describe("Ownership Isolation Verification", () => {
  it("strictly rejects accessing another user's attempt", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // Return empty array because userId doesn't match owner!
    } as any;

    const result = await getAttemptById("user-attacker", "attempt-victim-1", mockClient);
    expect(result).toBeNull();
  });

  it("strictly rejects accessing another user's journal entry", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    } as any;

    const result = await getJournalEntryById("user-attacker", "journal-victim-1", mockClient);
    expect(result).toBeNull();
  });

  it("strictly rejects accessing another user's revision item", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    } as any;

    const result = await getRevisionById("user-attacker", "revision-victim-1", mockClient);
    expect(result).toBeNull();
  });

  it("strictly rejects accessing another user's daily task", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    } as any;

    const result = await getDailyTaskById("user-attacker", "task-victim-1", mockClient);
    expect(result).toBeNull();
  });

  it("addMistakesToAttempt throws NotFoundError if target attempt does not belong to user", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // Attempt not found for attacker user!
    } as any;

    const txSpy = vi.spyOn(db, "transaction").mockImplementation(async (callback: any) => {
      return await callback(mockClient);
    });

    await expect(
      attemptRepository.addMistakesToAttempt("user-attacker", "attempt-victim-1", ["m1"])
    ).rejects.toThrowError(NotFoundError);

    txSpy.mockRestore();
  });
});
