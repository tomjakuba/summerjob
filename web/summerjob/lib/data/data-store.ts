import { getActiveSummerJobEvent } from "./summerjob-event";

let activeSummerjobEventId: string | undefined = undefined;

export function setActiveSummerJobEventId(id: string) {
  activeSummerjobEventId = id;
}

export async function getActiveSummerJobEventId() {
  if (!activeSummerjobEventId) {
    const event = await getActiveSummerJobEvent();
    if (event) {
      setActiveSummerJobEventId(event.id);
    }
  }
  return activeSummerjobEventId;
}
