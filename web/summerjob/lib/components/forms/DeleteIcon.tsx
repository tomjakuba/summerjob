interface DeleteIconProps {
  onClick: () => void;
  isBeingDeleted: boolean;
}

export default function DeleteIcon({
  onClick,
  isBeingDeleted,
}: DeleteIconProps) {
  return (
    <>
      {!isBeingDeleted && (
        <>
          <i
            className="fas fa-trash-alt smj-action-delete cursor-pointer"
            title="Smazat"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          ></i>
          <span style={{ width: "0px" }}></span>
        </>
      )}
      {isBeingDeleted && (
        <i
          className="fas fa-spinner smj-action-delete spinning"
          title="Odstraňování..."
        ></i>
      )}
    </>
  );
}
