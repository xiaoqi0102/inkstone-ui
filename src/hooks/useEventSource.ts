import { useCallback, useEffect, useRef, useState } from 'react'

export type SseEvent = {
    /** SSE 的 event: 字段，缺省为 'message' */
    event: string
    /** data: 拼接后的原始字符串 */
    data: string
    /** id: 字段（断线重连时可用） */
    id?: string
    /** 如果 eventDataIsJson 为真，这里是解析结果，否则等于 data */
    payload: unknown
}

export type UseEventSourceOptions = {
    /** 额外请求头，用来放 Authorization 等 —— 原生 EventSource 不支持自定义头，所以这里用 fetch 流实现 */
    headers?: Record<string, string>
    /** 是否带 cookie（跨域时需要服务端 CORS 允许凭据） */
    withCredentials?: boolean
    /** 自动解析 data 为 JSON，解析失败则保留字符串 */
    eventDataIsJson?: boolean
    /** 断线后是否自动重连 */
    reconnect?: boolean
    /** 首次重连延迟（毫秒），每次失败翻倍，封顶 maxDelay */
    reconnectDelay?: number
    maxDelay?: number
    /** 是否立即连接 */
    enabled?: boolean
    onEvent?: (event: SseEvent) => void
    onError?: (error: unknown) => void
    onOpen?: () => void
}

/**
 * useEventSource —— 基于 fetch + ReadableStream 的 SSE 客户端。
 *
 * 为什么不用原生 EventSource：
 *  1. 它无法携带自定义请求头（只能靠 cookie），带 Bearer token 的场景直接不可用；
 *  2. 它把"重连"和"解析"都藏起来了，拿不到原始帧，做日志面板时没法按需干预；
 *  3. fetch 版能 AbortController 精确断开，切页面不会留下幽灵连接。
 *
 * 解析规则遵循 SSE 规范：空行分帧，一行内 `字段: 值`，
 * 多行 data 用 \n 拼接；`:` 开头是注释（心跳），忽略。
 */
export function useEventSource(url: string | null, options: UseEventSourceOptions = {}) {
    const {
        headers,
        withCredentials = false,
        eventDataIsJson = true,
        reconnect = true,
        reconnectDelay = 1000,
        maxDelay = 30_000,
        enabled = true,
        onEvent,
        onError,
        onOpen,
    } = options

    const [connected, setConnected] = useState(false)
    const abortRef = useRef<AbortController | null>(null)
    const retryRef = useRef(0)
    const timerRef = useRef<number | null>(null)
    // 回调放进 ref：避免调用方每次 render 造新函数导致 effect 重连（日志流最怕这个）。
    const cbRef = useRef({ onEvent, onError, onOpen })
    cbRef.current = { onEvent, onError, onOpen }
    const headersKey = JSON.stringify(headers ?? {})

    const disconnect = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current)
            timerRef.current = null
        }
        abortRef.current?.abort()
        abortRef.current = null
        setConnected(false)
    }, [])

    useEffect(() => {
        if (!url || !enabled) return

        let disposed = false

        const connect = async () => {
            const controller = new AbortController()
            abortRef.current = controller

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { Accept: 'text/event-stream', ...(JSON.parse(headersKey) as Record<string, string>) },
                    credentials: withCredentials ? 'include' : 'same-origin',
                    signal: controller.signal,
                    cache: 'no-store',
                })

                if (!response.ok || !response.body) {
                    throw new Error(`SSE 连接失败：HTTP ${response.status}`)
                }

                retryRef.current = 0
                setConnected(true)
                cbRef.current.onOpen?.()

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''

                while (!disposed) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })

                    // 帧之间用空行分隔；最后一段可能不完整，留在 buffer 里等下一块。
                    const frames = buffer.split(/\r?\n\r?\n/)
                    buffer = frames.pop() ?? ''

                    for (const frame of frames) {
                        if (!frame.trim()) continue
                        const parsed = parseFrame(frame, eventDataIsJson)
                        if (parsed) cbRef.current.onEvent?.(parsed)
                    }
                }

                setConnected(false)
                if (!disposed && reconnect) scheduleReconnect()
            } catch (error) {
                if (disposed || controller.signal.aborted) return
                setConnected(false)
                cbRef.current.onError?.(error)
                if (reconnect) scheduleReconnect()
            }
        }

        const scheduleReconnect = () => {
            const delay = Math.min(reconnectDelay * 2 ** retryRef.current, maxDelay)
            retryRef.current += 1
            timerRef.current = window.setTimeout(() => {
                if (!disposed) void connect()
            }, delay)
        }

        void connect()

        return () => {
            disposed = true
            disconnect()
        }
    }, [url, enabled, reconnect, reconnectDelay, maxDelay, withCredentials, eventDataIsJson, headersKey, disconnect])

    return { connected, disconnect }
}

function parseFrame(frame: string, asJson: boolean): SseEvent | null {
    let event = 'message'
    let id: string | undefined
    const dataLines: string[] = []

    for (const rawLine of frame.split(/\r?\n/)) {
        if (!rawLine || rawLine.startsWith(':')) continue // 心跳/注释
        const sep = rawLine.indexOf(':')
        const field = sep === -1 ? rawLine : rawLine.slice(0, sep)
        let value = sep === -1 ? '' : rawLine.slice(sep + 1)
        if (value.startsWith(' ')) value = value.slice(1)

        if (field === 'event') event = value
        else if (field === 'id') id = value
        else if (field === 'data') dataLines.push(value)
    }

    if (dataLines.length === 0) return null
    const data = dataLines.join('\n')

    let payload: unknown = data
    if (asJson) {
        try {
            payload = JSON.parse(data)
        } catch {
            payload = data
        }
    }

    return { event, data, id, payload }
}
