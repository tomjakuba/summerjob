import { ActiveJobNoPlan } from "lib/types/active-job";

interface AddRideButtonProps {
  job: ActiveJobNoPlan;
}

export default function AddRideButton({ job }: AddRideButtonProps) {
  return <i className="fas fa-square-plus text-warning fs-4" />;
}
