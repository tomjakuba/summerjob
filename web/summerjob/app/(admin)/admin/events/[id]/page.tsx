import ErrorPage404 from "lib/components/404/404";
import PageHeader from "lib/components/page-header/PageHeader";
import EventsHeader from "lib/components/summerjob-event/EventsHeader";
import { getSummerJobEventById } from "lib/data/summerjob-event";

type Props = {
  params: {
    id: string;
  };
};

export default async function SummerJobEventPage({ params }: Props) {
  const event = await getSummerJobEventById(params.id);
  if (!event) {
    return <ErrorPage404 message="Ročník nenalezen."></ErrorPage404>;
  }
  return (
    <>
      <PageHeader title={event.name} isFluid={false}>
        {}
      </PageHeader>
    </>
  );
}
