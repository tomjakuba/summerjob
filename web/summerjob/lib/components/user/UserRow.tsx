"use client";
import { useAPIUserUpdate } from "lib/fetcher/user";
import { UserComplete } from "lib/types/user";
import { useState } from "react";
import ConfirmationModal from "../modal/ConfirmationModal";
import { SimpleRow } from "../table/SimpleRow";

interface UserRowProps {
  user: UserComplete;
  onUpdate: () => void;
}

export default function UserRow({ user, onUpdate }: UserRowProps) {
  const { trigger, error } = useAPIUserUpdate(user.id, {
    onSuccess: () => onUpdate(),
  });
  const toggleLocked = () => {
    trigger({ blocked: !user.blocked });
  };

  return <SimpleRow data={formatUserRow(user, toggleLocked)} />;
}

function formatUserRow(user: UserComplete, toggleLocked: () => void) {
  const permissions = user.permissions;
  // TODO: translate permissions
  const permissionString = permissions.join(", ");
  return [
    `${user.lastName}, ${user.firstName}`,
    user.email,
    permissionString,
    <span
      key={`actions-${user.id}`}
      className="d-flex align-items-center gap-3"
    >
      <i
        className="fas fa-edit smj-action-edit cursor-pointer"
        title="Upravit role"
      ></i>
      <LockIcon locked={user.blocked} onConfirm={toggleLocked} />
    </span>,
  ];
}

function LockIcon({
  locked,
  onConfirm,
}: {
  locked: boolean;
  onConfirm: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onDialogConfirmed = () => {
    setDialogOpen(false);
    onConfirm();
  };
  const onDialogCancelled = () => {
    setDialogOpen(false);
  };
  return (
    <>
      {!locked ? (
        <i
          className="fas fa-lock smj-action-pin cursor-pointer"
          title="Zamknout účet"
          onClick={() => setDialogOpen(true)}
        />
      ) : (
        <i
          className="fas fa-lock-open smj-action-pin cursor-pointer"
          title="Odemknout účet"
          onClick={() => setDialogOpen(true)}
        />
      )}
      {dialogOpen && (
        <ConfirmationModal
          onConfirm={onDialogConfirmed}
          onReject={onDialogCancelled}
        >
          <p>Chcete {locked ? "odemknout" : "zamknout"} tento účet?</p>
          {!locked && (
            <>
              <p>
                Uživatel bude odhlášen ze všech zařízení a nebude se moci znovu
                přihlásit do systému, dokud nedojde k odemčení účtu.
              </p>
              <p>
                S uživatelem bude možné dále manipulovat a přiřazovat ho k
                úkolům.
              </p>
            </>
          )}
        </ConfirmationModal>
      )}
    </>
  );
}
