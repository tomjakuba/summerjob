export default function EditBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="container bg-white mt-4 p-3 rounder-3 smj-wrapper-shadow">
      {children}
    </div>
  );
}
