/** Auto-generated by test_app.py:test_generate_state_js */
import {BackendState} from '../../ducks/backendState';
export function TBackendState(): Required<BackendState> {
    return {
        "available": true,
        "contentViews": [
            "Auto",
            "Raw"
        ],
        "servers": [
            {
                "description": "HTTP(S) proxy",
                "full_spec": "regular",
                "is_running": true,
                "last_exception": null,
                "listen_addrs": [
                    [
                        "127.0.0.1",
                        8080
                    ],
                    [
                        "::1",
                        8080
                    ]
                ],
                "type": "regular"
            },
            {
                "description": "reverse proxy to example.com",
                "full_spec": "reverse:example.com",
                "is_running": false,
                "last_exception": "I failed somehow.",
                "listen_addrs": [],
                "type": "reverse"
            },
            {
                "description": "SOCKS v5 proxy",
                "full_spec": "socks5",
                "is_running": false,
                "last_exception": null,
                "listen_addrs": [],
                "type": "socks5"
            }
        ],
        "version": "1.2.3"
    }
}
