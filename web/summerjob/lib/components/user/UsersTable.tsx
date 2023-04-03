"use client";
import { UserComplete } from "lib/types/user";
import { useMemo } from "react";
import { MessageRow } from "../table/MessageRow";
import RowCategory from "../table/RowCategory";
import { SimpleRow } from "../table/SimpleRow";

interface UsersTableProps {
  users: UserComplete[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [regularUsers, blockedUsers] = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        if (u.blocked) {
          return [acc[0], [...acc[1], u]];
        }
        return [[...acc[0], u], acc[1]];
      },
      [[], []] as [UserComplete[], UserComplete[]]
    );
  }, [users]);
  return (
    <div className="table-responsive text-nowrap mb-2 smj-shadow rounded-3">
      <table className="table table-hover mb-0">
        <thead className="smj-table-header">
          <tr>
            {_columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="smj-table-body mb-0">
          {users.length === 0 && (
            <MessageRow message="Žádní pracanti" colspan={_columns.length} />
          )}
          {regularUsers.map((user) => (
            <SimpleRow key={user.id} data={formatUserRow(user)} />
          ))}
          <RowCategory
            title={`Zamčené účty (${blockedUsers.length})`}
            secondaryTitle="Uživatelé se zamčeným účtem se nemohou přihlásit do systému."
            numCols={_columns.length}
            className={"bg-category-hidden"}
          >
            {blockedUsers.map((user) => (
              <SimpleRow key={user.id} data={formatUserRow(user)} />
            ))}
          </RowCategory>
        </tbody>
      </table>
    </div>
  );
}

function formatUserRow(user: UserComplete) {
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
      <i
        className="fas fa-lock smj-action-pin cursor-pointer"
        title="Zamknout účet"
      ></i>
    </span>,
  ];
}

const _columns = ["Celé jméno", "Email", "Oprávnění", "Akce"];
