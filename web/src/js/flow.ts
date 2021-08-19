/*
Type definitions for flows. Sync with mitmproxy/tools/web/app.py.
 */
interface _Flow {
    id: string
    intercepted: boolean
    is_replay: "request" | "response" | undefined
    type: string
    modified: boolean
    marked: string
    client_conn: Client
    server_conn?: Server
    error?: Error
}

export type Flow = HTTPFlow | TCPFlow;

export interface HTTPFlow extends _Flow {
    type: "http"
    request: HTTPRequest
    response?: HTTPResponse
    websocket?: WebSocketData
}

export interface TCPFlow extends _Flow {
    type: "tcp"
}

export interface Error {
    msg: string
    timestamp: number
}

export type Address = [string, number];

export interface Connection {
    id: string
    peername?: Address
    sockname?: Address

    tls_established: boolean
    cert?: Certificate
    sni?: string | boolean
    cipher?: string
    alpn?: string
    tls_version?: string

    timestamp_start?: number
    timestamp_tls_setup?: number
    timestamp_end?: number

}

export interface Client extends Connection {
    peername: Address
    sockname: Address
    timestamp_start: number
}

export interface Server extends Connection {
    address?: Address
    timestamp_tcp_setup?: number
}

export interface Certificate {
    keyinfo: [string, number]
    sha256: string,
    notbefore: number,
    notafter: number,
    serial: string,
    subject: [string, string][],
    issuer: [string, string][],
    altnames: string[],
}

export type HTTPHeader = [name: string, value: string]
export type HTTPHeaders = HTTPHeader[];

export interface HTTPMessage {
    http_version: string
    headers: HTTPHeaders
    trailers?: HTTPHeaders
    contentLength?: number
    contentHash?: string
    timestamp_start: number
    timestamp_end?: number
}

export interface HTTPRequest extends HTTPMessage {
    method: string
    scheme: string
    host: string
    port: number
    path: string
    pretty_host: string
}

export interface HTTPResponse extends HTTPMessage {
    status_code: number
    reason: string
}

export interface WebSocketData {
    messages_meta: {
        count: number,
        timestamp_last?: number
    },
    closed_by_client?: boolean
    close_code?: number
    close_reason?: string
    timestamp_end?: number
}
