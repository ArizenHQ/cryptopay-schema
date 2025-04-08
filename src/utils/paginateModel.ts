type PaginateMethod = 'find' | 'scan';

export interface PaginatedResult<T = any> {
  items: T[];
  page?: number;
  limit?: number;
  next?: string;
  hasNextPage: boolean;
}

function encodeCursor(cursor: any): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64');
}

function decodeCursor(encoded: string): any {
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
}


export { encodeCursor, decodeCursor };

export async function paginateModel(
  model: any,
  method: PaginateMethod,
  keyOrParams: any = {},
  query: any = {},
  options: Record<string, any> = {}
): Promise<PaginatedResult> {
  let { limit = null, page = null, next = null, sort = '' } = query;

  // ✅ reverse dynamique basé sur `sort`
  let reverse = false;
  console.log("sort", sort);
  if (sort) {
    const [field, direction] = sort.split(' ');
    reverse = direction?.toLowerCase() === 'desc';
  }

  // Merge final options avec reverse calculé dynamiquement
  const finalOptions = {
    ...options,
    ...query,
    limit,
    reverse,
  };

  // Decode base64 if next token is provided
  if (next && typeof next === 'string') {
    try {
      finalOptions.next = decodeCursor(next);
    } catch (err) {
      throw new Error('Invalid pagination cursor');
    }
  }

  // ✅ 1. Pagination moderne OneTable via `next`
  if (finalOptions.next) {
    const result = await model[method](keyOrParams, finalOptions);
    
    return {
      items: result,
      limit,
      next: result.next ? encodeCursor(result.next) : undefined,
      hasNextPage: !!result.next,
    };
  }

  // ✅ 2. Pagination REST naïve via `page` + `limit`
  if (typeof page === 'number' && typeof limit === 'number') {
    let result;
    let nextToken = null;

    for (let i = 0; i <= page; i++) {
      result = await model[method](keyOrParams, {
        ...finalOptions,
        next: nextToken || undefined,
      });

      nextToken = result.next;
      if (!nextToken && i < page) {
        return {
          items: [],
          page,
          limit,
          hasNextPage: false,
        };
      }
    }
    return {
      items: result,
      page,
      limit,
      next: result.next ? encodeCursor(result.next) : undefined,
      hasNextPage: !!result.next,
    };
  }

  // ✅ 3. Sans pagination → fallback simple
  const result = await model[method](keyOrParams, finalOptions);
  const items = result.items ?? result;

  return {
    items,
    hasNextPage: false,
  };
}
