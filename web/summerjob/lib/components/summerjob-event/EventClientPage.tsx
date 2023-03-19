"use client";
import { Serialized } from "lib/types/serialize";
import {
  deserializeSummerJobEvent,
  SummerJobEventComplete,
} from "lib/types/summerjob-event";
import { useRouter } from "next/navigation";
import EditBox from "../forms/EditBox";
import DeleteEventButton from "./DeleteEventButton";
import SetEventActiveButton from "./SetEventActiveButton";

interface EventClientPageProps {
  sEvent: Serialized<SummerJobEventComplete>;
}

export default function EventClientPage({ sEvent }: EventClientPageProps) {
  const event = deserializeSummerJobEvent(sEvent);

  const router = useRouter();
  const onEventActive = () => {
    router.refresh();
  };

  const onEventDeleted = () => {
    router.replace("/admin/events");
    router.refresh();
  };
  return (
    <>
      <section>
        <div className="container">
          <EditBox>
            <h4 className="mb-3">Základní nastavení</h4>
            <div className="d-flex justify-content-between align-items-center flex-sm-row flex-column">
              <div className="d-flex flex-column">
                <label className="fs-5">Nastavit ročník jako aktivní</label>
                <p className="text-muted">
                  Úpravy na ostatních stránkách probíhají pouze na aktivním
                  ročníku.
                </p>
              </div>
              <SetEventActiveButton
                smjEvent={event}
                onSuccess={onEventActive}
              />
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-center mt-3 flex-sm-row flex-column">
              <div className="d-flex flex-column flex-wrap">
                <label className="fs-5">Odstranit ročník</label>
                <p className="text-muted">
                  Odstranit ročník z databáze. Dojde ke smazání všech informací
                  souvisejících s tímto ročníkem. Tato akce je nevratná.
                </p>
              </div>
              <DeleteEventButton smjEvent={event} onSuccess={onEventDeleted} />
            </div>
          </EditBox>
          <EditBox>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-3">Oblasti</h4>
              <button className="btn btn-light pt-2 pb-2 align-self-start">
                <i className="fas fa-plus me-2"></i>
                Přidat oblast
              </button>
            </div>
            <ul className="list-group mt-3">
              <AreaRow />
              <AreaRow />
              <AreaRow />
              <AreaRow />
              <AreaRow />
            </ul>
          </EditBox>
        </div>
      </section>
    </>
  );
}

function AreaRow() {
  return (
    <li className="list-group-item list-group-item-action">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex flex-column">
          <label className="fs-5">Praha</label>
          <p className="text-muted">Doprava nutná: Ano.</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <i className="fas fa-edit me-2"></i>
          <i className="fas fa-trash-alt me-2"></i>
        </div>
      </div>
    </li>
  );
}
