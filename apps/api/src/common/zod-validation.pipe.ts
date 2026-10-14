import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { z } from "zod";
import { erreurApi } from "./erreur-api";

/** Valida o corpo de um pedido com um schema de @camille/shared; devolve 400 com a lista de problemas. */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        ...erreurApi("requete_invalide", "Pedido inválido."),
        problemas: result.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        })),
      });
    }
    return result.data;
  }
}
