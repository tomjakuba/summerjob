"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavPath = {
  path: string;
  name: string;
  icon: string;
};

export function Navbar() {
  const pathname = usePathname();
  const navPaths: NavPath[] = [
    { path: "/", name: "Plán", icon: "far fa-calendar-alt" },
    { path: "/jobs", name: "Joby", icon: "far fa-clock" },
    { path: "/cars", name: "Auta", icon: "fas fa-car" },
    { path: "/workers", name: "Pracanti", icon: "far fa-user" },
    { path: "/admin", name: "Admin", icon: "far fa-user" },
  ];
  return (
    <>
      <nav className="navbar navbar-light navbar-expand-md smj-navbar pt-2 pb-2 mb-0">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src="/logo-smj-yellow.png"
              className="smj-nav-logo"
              alt="SummerJob logo"
            />
          </a>
          <button
            data-bs-toggle="collapse"
            className="navbar-toggler"
            data-bs-target="#navcol-1"
          >
            <span className="visually-hidden">Toggle navigation</span>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navcol-1">
            <ul className="navbar-nav me-auto">
              {navPaths.map((navPath) => {
                return (
                  <li className="nav-item" key={navPath.path}>
                    <Link
                      className={
                        "nav-link d-xl-flex align-items-xl-center" +
                        (pathname === navPath.path ? " active" : "")
                      }
                      href={navPath.path}
                    >
                      <div className="d-xl-flex justify-content-xl-start align-items-xl-center navbar-div">
                        <i
                          className={
                            navPath.icon + " d-xl-flex justify-content-xl-start"
                          }
                        ></i>
                        <span>{navPath.name}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
              <li className="nav-item">
                <a
                  className="nav-link d-xl-flex align-items-xl-center"
                  href="#"
                >
                  <div className="d-xl-flex justify-content-xl-start align-items-xl-center navbar-div">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="d-xl-flex justify-content-xl-start"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5ZM12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13ZM12 21C12.5523 21 13 20.5523 13 20C13 19.4477 12.5523 19 12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21ZM15 4C15 5.65685 13.6569 7 12 7C10.3431 7 9 5.65685 9 4C9 2.34315 10.3431 1 12 1C13.6569 1 15 2.34315 15 4ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12ZM12 23C13.6569 23 15 21.6569 15 20C15 18.3431 13.6569 17 12 17C10.3431 17 9 18.3431 9 20C9 21.6569 10.3431 23 12 23Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <span>{pathname}</span>
                  </div>
                </a>
              </li>
            </ul>
            <button className="btn" id="btn-nav-logout" type="button">
              Odhlásit
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
