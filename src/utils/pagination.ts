export interface PaginationMeta {
  totalRecords: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
}

export function getPaginationMeta(
  page: number,
  limit: number,
  totalRecords: number
): {
  pagination: PaginationMeta;
  offset: number;
} {
  const totalPages = Math.ceil(totalRecords / limit);
  const offset = limit > 0 ? (page - 1) * limit : 0;

  return {
    offset,
    pagination: {
      prevPage: page > 1 ? page - 1 : null,
      currentPage: page,
      nextPage: page < totalPages ? page + 1 : null,
      totalRecords: totalRecords,
      limit,
      totalPages: totalPages,
    },
  };
}
