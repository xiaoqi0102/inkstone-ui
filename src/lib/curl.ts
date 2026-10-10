/** 把一次 HTTP 请求还原成可直接粘贴执行的 curl。
 *  日志/详情面板里给这一行，排障时不用再问"你当时到底发了什么"。
 *  注意 body 里的换行要保留（-d 用单引号包住即可），所以这里只做必要转义。 */
export type CurlRequest = {
    method?: string
    url: string
    headers?: Record<string, string>
    /** 字符串原样发；对象会 JSON.stringify 并自动补 content-type */
    body?: unknown
    /** 是否带 --insecure（自签证书调试用） */
    insecure?: boolean
}

export function buildCurl({ method = 'POST', url, headers = {}, body, insecure }: CurlRequest): string {
    const parts: string[] = [`curl -X ${method.toUpperCase()} '${url}'`]

    const finalHeaders = { ...headers }
    let bodyText: string | undefined

    if (body !== undefined) {
        if (typeof body === 'string') {
            bodyText = body
        } else {
            bodyText = JSON.stringify(body, null, 2)
            const hasContentType = Object.keys(finalHeaders).some((k) => k.toLowerCase() === 'content-type')
            if (!hasContentType) finalHeaders['Content-Type'] = 'application/json'
        }
    }

    for (const [key, value] of Object.entries(finalHeaders)) {
        parts.push(`  -H '${key}: ${value}'`)
    }

    if (bodyText !== undefined) parts.push(`  -d '${bodyText.replace(/'/g, `'\\''`)}'`)
    if (insecure) parts.push('  --insecure')

    return parts.join(' \\\n')
}
