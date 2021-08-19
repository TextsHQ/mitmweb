import thunk from 'redux-thunk'
import configureStore, {MockStoreCreator, MockStoreEnhanced} from 'redux-mock-store'
import {ConnectionState} from '../../ducks/connection'
import TFlow from './_tflow'
import {AppDispatch, RootState} from "../../ducks";
import {HTTPFlow} from "../../flow";
import {defaultState as defaultConf} from "../../ducks/conf"
import {defaultState as defaultOptions} from "../../ducks/options"

const mockStoreCreator: MockStoreCreator<RootState, AppDispatch> = configureStore([thunk])

export {TFlow}

const tflow1: HTTPFlow = TFlow();
const tflow2: HTTPFlow = TFlow();
tflow1.modified = true
tflow1.intercepted = true
tflow2.id = "flow2";
tflow2.request.path = "/second";

export const testState: RootState = {
    conf: defaultConf,
    options_meta: {
        anticache: {
            "type": "bool",
            "default": false,
            "value": false,
            "help": "Strip out request headers that might cause the server to return 304-not-modified.",
            "choices": undefined
        },
        body_size_limit: {
            "type": "optional str",
            "default": undefined,
            "value": undefined,
            "help": "Byte size limit of HTTP request and response bodies. Understands k/m/g suffixes, i.e. 3m for 3 megabytes.",
            "choices": undefined,
        },
        connection_strategy: {
            "type": "str",
            "default": "eager",
            "value": "eager",
            "help": "Determine when server connections should be established. When set to lazy, mitmproxy tries to defer establishing an upstream connection as long as possible. This makes it possible to use server replay while being offline. When set to eager, mitmproxy can detect protocols with server-side greetings, as well as accurately mirror TLS ALPN negotiation.",
            "choices": [
                "eager",
                "lazy"
            ]
        },
        listen_port: {
            "type": "int",
            "default": 8080,
            "value": 8080,
            "help": "Proxy service port.",
            "choices": undefined
        }
    },
    ui: {
        flow: {
            contentViewFor: {},
            tab: 'request'
        },
        modal: {
            activeModal: undefined
        },
        optionsEditor: {
            booleanOption: {isUpdating: true, error: false},
            strOption: {error: true},
            intOption: {},
            choiceOption: {},
        }
    },
    options: defaultOptions,
    flows: {
        selected: [tflow2.id],
        byId: {[tflow1.id]: tflow1, [tflow2.id]: tflow2},
        filter: '~u /second',
        highlight: '~u /path',
        sort: {
            desc: true,
            column: "path"
        },
        view: [tflow2],
        list: [tflow1, tflow2],
        listIndex: {[tflow1.id]: 0, [tflow2.id]: 1},
        viewIndex: {[tflow2.id]: 0},
    },
    connection: {
        state: ConnectionState.ESTABLISHED
    },
    eventLog: {
        visible: true,
        filters: {
            debug: true,
            info: true,
            web: false,
            warn: true,
            error: true
        },
        view: [
            {id: "1", level: 'info', message: 'foo'},
            {id: "2", level: 'error', message: 'bar'}
        ],
        byId: {}, // TODO: incomplete
        list: [],  // TODO: incomplete
        listIndex: {},  // TODO: incomplete
        viewIndex: {},  // TODO: incomplete
    },
    commandBar: {
        visible: true,
    }
}


export function TStore(): MockStoreEnhanced<RootState, AppDispatch> {
    return mockStoreCreator(testState)
}
