import { ExtendedSession, Permission } from "lib/types/auth";
import { NavbarClient } from "./NavbarClient";

export type NavPath = {
  path: string;
  name: string;
  icon: string;
  permissions: Permission[];
};

interface NavbarServerProps {
  session: ExtendedSession | null;
}

export function NavbarServer({ session }: NavbarServerProps) {
  const navPaths: NavPath[] = [
    {
      path: "/plans",
      name: "Plán",
      icon: "fas fa-calendar-alt",
      permissions: [],
    },
    {
      path: "/jobs",
      name: "Joby",
      icon: "fas fa-person-digging",
      permissions: [],
    },
    { path: "/cars", name: "Auta", icon: "fas fa-car", permissions: [] },
    {
      path: "/workers",
      name: "Pracanti",
      icon: "far fa-user",
      permissions: [],
    },
    {
      path: "/admin",
      name: "Administrace",
      icon: "fas fa-cogs",
      permissions: [],
    },
    {
      path: "/my-plan",
      name: "Můj plán",
      icon: "fas fa-calendar-alt",
      permissions: [],
    },
    { path: "/profile", name: "Profil", icon: "fas fa-user", permissions: [] },
  ];

  const availablePaths = navPaths.filter((path) => {
    if (path.permissions.length === 0) return true;
    return path.permissions.some((permission) =>
      session?.permissions.includes(permission)
    );
  });

  return <NavbarClient paths={availablePaths} username={session?.username} />;
}
