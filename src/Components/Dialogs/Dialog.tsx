import { useEffect } from 'react';
import { Separator } from '../Misc/Separator';

export const Dialog: React.FC<{
  id: string;
  title?: string;
  children: React.ReactNode;
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
}> = ({ id, title, children, dialogRef }) => {
  useEffect(() => {
    if (!dialogRef.current) {
      return;
    }

    dialogRef.current.addEventListener('click', (e) => {
      const dialogDimensions = dialogRef.current!.getBoundingClientRect();
      if (
        (e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom) &&
        dialogRef.current?.open
      ) {
        dialogRef.current?.close();
      }
    });
  });

  return (
    <dialog
      id={id}
      ref={dialogRef}
      className="backdrop:bg-background-backdrop border-none backdrop:backdrop-blur-[1px] open:visible invisible bg-transparent overflow-visible my-0 justify-self-center top-[10%]"
    >
      <button
        onClick={() => {
          dialogRef.current?.close();
        }}
        className="flex absolute -top-2 right-2 z-10 justify-center items-center w-10 h-10 bg-background-default rounded-full"
        aria-label="Đóng"
      >
        <svg
          className="text-primary-main w-7 h-7"
          fill="currentColor"
          viewBox="0 0 52 52"
        >
          <path
            fillRule="evenodd"
            d="M26 48c12.15 0 22-9.85 22-22S38.15 4 26 4 4 13.85 4 26s9.85 22 22 22m0 4c14.36 0 26-11.64 26-26S40.36 0 26 0 0 11.64 0 26s11.64 26 26 26"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M15.586 15.586a2 2 0 0 1 2.828 0l18 18a2 2 0 1 1-2.828 2.828l-18-18a2 2 0 0 1 0-2.828"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M36.414 15.586a2 2 0 0 1 0 2.828l-18 18a2 2 0 1 1-2.828-2.828l18-18a2 2 0 0 1 2.828 0"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="bg-background-default rounded-2xl max-w-[548px] max-h-[80vh] flex flex-col">
        {title && (
          <div className="text-2xl text-center text-text-primary px-8 pt-4">
            <h2 className="">{title}</h2>
            <Separator height="1px" />
          </div>
        )}

        <div className="h-full overflow-auto text-text-primary show-scrollbar px-8 pb-8">
          {children}
        </div>
      </div>
    </dialog>
  );
};
