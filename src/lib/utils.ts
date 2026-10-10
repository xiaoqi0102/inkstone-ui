import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** cn —— 合并 className：clsx 负责条件拼接，tailwind-merge 负责后写的同类工具类覆盖前写的。
 *  组件库里的 className 都过这一层，调用方才能用 `className="bg-red-500"` 覆盖默认样式。 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** 紧凑数值：把 1_234_567 显示成 "1.23M"，适合统计卡片/图表轴。
 *  compare 是"单位分档阈值"，从大到小；与 units 一一对应但多一位（第一位是兜底单位）。 */
function formatNumber(
    num: number | undefined,
    compare: number[],
    units: string[],
): { value: string; unit: string } {
    if (num === undefined) return { value: '0.00', unit: units[0] }
    else if (num >= compare[0]) return { value: (num / compare[0]).toFixed(2), unit: units[1] }
    else if (num >= compare[1]) return { value: (num / compare[1]).toFixed(2), unit: units[2] }
    else if (num >= compare[2]) return { value: (num / compare[2]).toFixed(2), unit: units[3] }
    else if (num >= compare[3]) return { value: (num / compare[3]).toFixed(2), unit: units[4] }
    else return { value: num.toFixed(2), unit: units[5] }
}

/** 次数/条数：raw 给逻辑用，formatted 给展示用（值 + 单位分开返回，方便把单位做小号字）。 */
export function formatCount(num: number | undefined) {
    return {
        raw: num ?? 0,
        formatted: formatNumber(num, [1_000_000_000, 1_000_000, 1_000, 1], ['', 'B', 'M', 'K', '', '']),
    }
}

/** 金额（USD）。单位带 $，从 "$" 到 "K$/M$/B$"。 */
export function formatMoney(num: number | undefined) {
    return {
        raw: num ?? 0,
        formatted: formatNumber(num, [1_000_000_000, 1_000_000, 1_000, 1], ['$', 'B$', 'M$', 'K$', '$', '$']),
    }
}

/** 毫秒时长 → d/h/m/s/ms。 */
export function formatTime(ms: number | undefined) {
    return {
        raw: ms ?? 0,
        formatted: formatNumber(ms, [86_400_000, 3_600_000, 60_000, 1_000], ['', 'd', 'h', 'm', 's', 'ms']),
    }
}

/** 把 token 数、字节数这类大数字加千分位。 */
export function withThousands(num: number | undefined): string {
    return (num ?? 0).toLocaleString('en-US')
}

/** 截断长文本，保留头尾（用在日志列表的一行预览里比纯 head 更有信息量）。 */
export function truncateMiddle(text: string, head = 60, tail = 30): string {
    if (!text || text.length <= head + tail + 1) return text
    return `${text.slice(0, head)}…${text.slice(-tail)}`
}
