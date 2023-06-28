import axios, { AxiosResponse } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import querystring from 'querystring';

export async function get<Res>(url: string, header?: Record<string, string>): Promise<AxiosResponse<Res>> {
    const client = applyCaseMiddleware(axios.create(), {
        ignoreHeaders: true,
        ignoreParams: true
    });
    return await client.get<Res>(url, {
        headers: { ...header }
    });
}

export async function postForm<Req, Res>(url: string, data: Req, header?: Record<string, string>): Promise<AxiosResponse<Res>> {
    const client = applyCaseMiddleware(axios.create(), {
        ignoreHeaders: true,
        ignoreParams: true
    });
    return await client.post<Res>(url, querystring.stringify(data as any), {
        headers: { ...header, 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
}

export async function postJson<Req, Res>(url: string, data: Req, header?: Record<string, string>): Promise<AxiosResponse<Res>> {
    const client = applyCaseMiddleware(axios.create(), {
        ignoreHeaders: true,
        ignoreParams: true
    });

    return await client.post<Res>(url, data, {
        headers: { ...header, 'Content-Type': 'application/json' }
      }
    );
}