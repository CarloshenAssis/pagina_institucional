"use client";

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2.5 items-center">
      <span className="text-xs">{message}</span>
      <button className="text-xs font-bold text-red-700 underline" onClick={onConfirm}>
        Sim
      </button>
      <button className="text-xs font-bold underline" onClick={onCancel}>
        Não
      </button>
    </div>
  );
}
