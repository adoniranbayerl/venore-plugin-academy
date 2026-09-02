import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { deleteLessonExample, findLessonExampleById } from "./store";
import type { DeleteLessonExampleCommand, DeleteLessonExampleResult } from "./types";

export async function deleteLessonExampleService(command: DeleteLessonExampleCommand): Promise<DeleteLessonExampleResult> {
  const handle = beginOperation({
    useCase: "academy.delete-lesson-example",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const example = await findLessonExampleById(command.id);
  if (!example) {
    const error = { code: "academy.lesson_examples.not_found", message: `Exemplo "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteLessonExample(example.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: example.id } };
}
