import { useEffect } from 'react';

export const Dialog: React.FC<{
  id: string;
  title?: string;
  children: React.ReactNode;
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
}> = ({ id, title, children, dialogRef }) => {
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) {
      return;
    }

    const onClick = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      if (
        (e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom) &&
        node.open
      ) {
        node.close();
      }
    };

    node.addEventListener('click', onClick);
    return () => node.removeEventListener('click', onClick);
  }, [dialogRef]);

  return (
    <dialog
      id={id}
      ref={dialogRef}
      className="backdrop:bg-background-backdrop border-none backdrop:backdrop-blur-sm open:visible invisible bg-transparent overflow-visible m-auto w-[min(100vw-1.5rem,30rem)]"
    >
      <div className="relative rounded-3xl border border-white/10 bg-[#181a2c] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] max-h-[88vh] flex flex-col overflow-hidden animate-pop-in">
        <button
          onClick={() => dialogRef.current?.close()}
          className="absolute top-3 right-3 z-10 flex justify-center items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition"
          aria-label="Đóng"
        >
          <svg
            className="text-text-primary w-5 h-5"
            fill="currentColor"
            viewBox="0 0 52 52"
          >
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

        {title && (
          <div className="px-6 pt-5 pb-3 text-xl font-bold text-center text-text-primary border-b border-white/10">
            {title}
          </div>
        )}

        <div className="overflow-auto text-text-primary px-6 py-5">
          {children}
        </div>
      </div>
    </dialog>
  );
};
