type PaginateMethod = 'find' | 'scan';

export async function paginateModel(
  model: any,
  method: PaginateMethod,
  keyOrParams: any = {},
  query: any = {},
  options: Record<string, any> = {}
) {
  const { limit = null, page = null, next = null } = query;

  // Pagination moderne avec `next`
  if (next) {
    return await model[method](keyOrParams, {
      ...options,
      ...query,
      limit,
      next,
    });
  }

  // Pagination naïve avec `page` + `limit`
  if (page && limit) {
    let result;
    let nextToken = null;

    for (let i = 0; i <= page; i++) {
      result = await model[method](keyOrParams, {
        ...options,
        ...query,
        limit,
        next: nextToken || undefined,
      });

      nextToken = result.next;
      if (!nextToken && i < page) {
        return { items: [] };
      }
    }

    return result;
  }

  // Appel standard sans pagination
  return await model[method](keyOrParams, {
    ...options,
    ...query,
  });
}
