import { Button } from '../../components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center mt-8 space-x-1 sm:space-x-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        className="px-2 sm:px-3"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          variant={currentPage === i + 1 ? "default" : "outline"}
          size="sm"
          className="px-2 sm:px-3"
        >
          {i + 1}
        </Button>
      )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        className="px-2 sm:px-3"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}