jest.unmock('../../ducks/flows');
jest.mock('../../utils')

import reduceFlows, * as flowActions from '../../ducks/flows'
import reduceStore from '../../ducks/utils/store'

describe('select flow', () => {

    let state = reduceFlows(undefined, {})
    for (let i of [1, 2, 3, 4]) {
        state = reduceFlows(state, {type: flowActions.ADD, data: {id: i}, cmd: 'add'})
    }

    it('should be possible to select a single flow', () => {
        expect(reduceFlows(state, flowActions.select(2))).toEqual(
            {
                ...state,
                selected: [2],
            }
        )
    })

    it('should be possible to deselect a flow', () => {
        expect(reduceFlows({ ...state, selected: [1] }, flowActions.select())).toEqual(
            {
                ...state,
                selected: [],
            }
        )
    })

    it('should be possible to select relative',() => {
        // already selected some flows
        let newState = {},
            getState = () => { return { flows: {...state, selected: [2]}}},
            dispatch = (action) => { newState = reduceFlows(getState().flows, action) }
        flowActions.selectRelative(1)(dispatch, getState)
        expect(newState).toEqual({...state, selected: [3]})

        // haven't selected any flow
        getState = () => { return { flows: { ...state, selected: []}}}
        flowActions.selectRelative(-1)(dispatch, getState)
        expect(newState).toEqual({...state, selected: [1]})
    })
})

describe('flows reducer', () => {
    it('should return initial state', () => {
        expect(reduceFlows(undefined, {})).toEqual({
            highlight: null,
            filter: null,
            sort: { column: null, desc: false },
            selected: [],
            ...reduceStore(undefined, {})
        })
    })

    it('should be possible to set filter', () => {
        let filt = "~u 123"
        expect(reduceFlows(undefined, flowActions.setFilter(filt)).filter).toEqual(filt)
    })

    it('should be possible to set highlight', () => {
        let key = "foo"
        expect(reduceFlows(undefined, flowActions.setHighlight(key)).highlight).toEqual(key)
    })

    it('should be possilbe to set sort', () => {
        let sort = { column: "TLSColumn", desc: 1 }
        expect(reduceFlows(undefined, flowActions.setSort(sort.column, sort.desc)).sort).toEqual(sort)
    })

    it('should update state.selected on remove', () => {
        let state = reduceFlows(undefined, {})
        for (let i of [1, 2, 3, 4]) {
            state = reduceFlows(state, {type: flowActions.ADD, data: {id: i}, cmd: 'add'})
        }
        state = reduceFlows(state, flowActions.select(2))
        expect(reduceFlows(state, {type: flowActions.REMOVE, data: 2, cmd: 'remove'}).selected).toEqual([3])
        //last row
        state = reduceFlows(state, flowActions.select(4))
        expect(reduceFlows(state, {type: flowActions.REMOVE, data: 4, cmd: 'remove'}).selected).toEqual([3])
    })
})

describe('flows actions', () => {

    let tflow = { id: 1 }
    it('should handle resume action', () => {
        flowActions.resume(tflow)()
    })

    it('should handle resumeAll action', () => {
        flowActions.resumeAll()()
    })

    it('should handle kill action', () => {
        flowActions.kill(tflow)()
    })

    it('should handle killAll action', () => {
        flowActions.killAll()()
    })

    it('should handle remove action', () => {
        flowActions.remove(tflow)()
    })

    it('should handle duplicate action', () => {
        flowActions.duplicate(tflow)()
    })

    it('should handle replay action', () => {
        flowActions.replay(tflow)()
    })

    it('should handle revert action', () => {
        flowActions.revert(tflow)()
    })

    it('should handle update action', () => {
        flowActions.update(tflow, "foo")()
    })

    it('should handle updateContent action', () => {
        flowActions.uploadContent(tflow, "foo", "foo")()
    })

    it('should hanlde clear action', () => {
        flowActions.clear()()
    })

    it('should handle download action', () => {
        let state = reduceFlows(undefined, {})
        expect(reduceFlows(state, flowActions.download())).toEqual(state)
    })

    it('should handle upload action', () => {
        flowActions.upload("foo")()
    })
})

describe('makeSort', () => {
    it('should be possible to sort by TLSColumn', () => {
        let sort = flowActions.makeSort({column: 'TLSColumn', desc:true}),
            a = {request: {scheme: 'http'}},
            b = {request: {scheme: 'https'}}
        expect(sort(a, b)).toEqual(1)
    })

    it('should be possible to sort by PathColumn', () => {
        let sort = flowActions.makeSort({column: 'PathColumn', desc:true}),
            a = {request: {}},
            b = {request: {}}
        expect(sort(a, b)).toEqual(0)

    })

    it('should be possible to sort by MethodColumn', () => {
        let sort = flowActions.makeSort({column: 'MethodColumn', desc:true}),
            a = {request: {method: 'GET'}},
            b = {request: {method: 'POST'}}
        expect(sort(b, a)).toEqual(-1)
    })

    it('should be possible to sort by StatusColumn', () => {
        let sort = flowActions.makeSort({column: 'StatusColumn', desc:false}),
            a = {response: {status_code: 200}},
            b = {response: {status_code: 404}}
        expect(sort(a, b)).toEqual(-1)
    })

    it('should be possible to sort by TimeColumn', () => {
        let sort = flowActions.makeSort({column: 'TimeColumn', desc: false}),
            a = {response: {timestamp_end: 9}, request: {timestamp_start: 8}},
            b = {response: {timestamp_end: 10}, request: {timestamp_start: 8}}
        expect(sort(b, a)).toEqual(1)
    })

    it('should be possible to sort by SizeColumn', () => {
        let sort = flowActions.makeSort({column:'SizeColumn', desc: true}),
            a = {request: {contentLength: 1}, response: {contentLength: 1}},
            b = {request: {contentLength: 1}}
        expect(sort(a, b)).toEqual(-1)
    })
})
