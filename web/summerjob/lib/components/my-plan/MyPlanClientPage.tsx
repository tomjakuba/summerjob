"use client";
import { useAPIMyPlans } from "lib/fetcher/my-plan";
import { formatDateLong } from "lib/helpers/helpers";
import { translateAllergies } from "lib/types/allergy";
import { deserializeMyPlans, MyPlan } from "lib/types/my-plan";
import { Serialized } from "lib/types/serialize";
import { useMemo, useState } from "react";
import SimpleDatePicker from "../date-picker/date-picker";
import EditBox from "../forms/EditBox";
import PageHeader from "../page-header/PageHeader";
import MyPlanBrowser from "./MyPlanBrowser";
import MyPlanEmpty from "./MyPlanEmpty";

interface MyPlanProps {
  sPlan: Serialized<MyPlan[]>;
}

export default function MyPlanClientPage({ sPlan }: MyPlanProps) {
  const plans = deserializeMyPlans(sPlan);
  const { data, error, isLoading } = useAPIMyPlans({
    fallbackData: plans,
  });

  return (
    <>
      {data && data.length > 0 && <MyPlanBrowser plans={data} />}
      {(!data || data.length === 0) && <MyPlanEmpty />}
    </>
  );
}
