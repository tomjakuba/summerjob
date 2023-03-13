"use client";
import { useAPIPlansCreate } from "lib/fetcher/plan";
import { useState } from "react";
import SimpleDatePicker from "../date-picker/date-picker";

interface NewPlanFormProps {
  initialDate: Date;
  onCompleted: () => void;
  from: Date;
  to: Date;
}

export default function NewPlanForm({
  initialDate,
  onCompleted,
  from,
  to,
}: NewPlanFormProps) {
  const [date, setDate] = useState(initialDate);
  const onDateChanged = (newDate: Date) => {
    setDate(newDate);
  };

  const { trigger, isMutating, error, reset } = useAPIPlansCreate();

  const onSubmit = () => {
    reset();
    trigger(
      { date: date.toUTCString() },
      {
        onSuccess: () => {
          onCompleted();
        },
      }
    );
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-1"></div>
        <div className="col">
          <SimpleDatePicker initialDate={date} onDateChanged={onDateChanged} />
        </div>
        <div className="col-1"></div>
      </div>
      {error && (
        <div className="row">
          <div className="col-1"></div>
          <div className="col text-danger">
            {error.reason ?? "Invalid input data."}
          </div>
          <div className="col-1"></div>
        </div>
      )}
      {(date > to || date < from) && (
        <div className="row">
          <div className="col-1"></div>
          <div className="col text-danger text-center">
            Tento den je mimo rozsah plánu.
          </div>
          <div className="col-1"></div>
        </div>
      )}
      <div className="row">
        <div className="col">
          <button
            className="btn btn-warning mt-2 float-end pt-2 pb-2"
            type="submit"
            onClick={onSubmit}
            disabled={isMutating}
          >
            Přidat
          </button>
        </div>
      </div>
    </div>
  );
}
