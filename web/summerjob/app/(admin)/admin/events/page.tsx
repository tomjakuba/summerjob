import EventsHeader from "lib/components/summerjob-event/EventsHeader";
import { getSummerJobEvents } from "lib/data/summerjob-event";
import { formatDateShort } from "lib/helpers/helpers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SummerJobEventsPage() {
  const events = await getSummerJobEvents();
  return (
    <>
      <EventsHeader />
      <section>
        <div className="container">
          <div className="list-group">
            {events.map((event) => (
              <Link
                className="list-group-item list-group-item-action"
                href={`/admin/events/${event.id}`}
                key={event.id}
              >
                <div className="row">
                  <div className="col">
                    <h5>{event.name}</h5>
                    <p>
                      {formatDateShort(event.startDate)} -{" "}
                      {formatDateShort(event.endDate)}
                    </p>
                  </div>
                  <div className="col d-flex justify-content-end align-items-center gap-3">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
