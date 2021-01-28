import { Util } from "../../common/fn/util.fn";

export const Http = {
  async post<T>(url: string, options?: { headers?: [string, string][], data?: object }): Promise<T> {
    const data = options?.data ?? {};
    const headers = options?.headers ?? [];
    const json = JSON.stringify(data);
    const _headers = headers.concat([
      ['Accepts', 'application/json'],
      ['Content-Type', 'application/json'],
    ]);
    const result = await fetch(url, { method: 'POST', body: json, headers: _headers, });
    if (!result.ok) {
      const err = await result.json().catch((error) => error);
      if (err instanceof Error) { throw err; }
      else { throw new Error(Util.pretty(err)); }
    }
    const js: T = await result.json();
    return js;
  },
};
