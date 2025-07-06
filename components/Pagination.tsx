import { useMemo } from 'react';

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

export default function Pagination({ page, setPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxNumbersToShow = 5;

  const pageNumbers = useMemo<number[]>(() => {
    if (totalPages <= maxNumbersToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const sibling = Math.floor(maxNumbersToShow / 2);
    let start = Math.max(1, page - sibling);
    let end = Math.min(totalPages, page + sibling);

    if (page - 1 <= sibling) end = maxNumbersToShow;
    if (totalPages - page <= sibling) start = totalPages - maxNumbersToShow + 1;

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };

  return (
    <div className="flex items-center justify-center gap-3 text-base select-none">
      {/* 이전 */}
      <PaginateButton label="‹" disabled={page === 1} onClick={() => goTo(page - 1)} />

      {pageNumbers.map((p) => (
        <PaginateButton key={p} label={p.toString()} active={p === page} onClick={() => goTo(p)} />
      ))}

      {/* 다음 */}
      <PaginateButton label="›" disabled={page === totalPages} onClick={() => goTo(page + 1)} />
    </div>
  );
}

interface PaginateButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function PaginateButton({ label, active = false, disabled = false, onClick }: PaginateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-gray-300 text-black' // 선택된 페이지
          : 'text-black hover:bg-gray-100', // 기본 / hover
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </button>
  );
}
